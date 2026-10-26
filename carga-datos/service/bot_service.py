import logging
import re
from datetime import date

import requests
from schema.schemas import RegistroBot

# Diccionario maestro de bancos en Venezuela
BANCOS_VENEZUELA = {
    "0102": ["VENEZUELA", "BDV"],
    "0104": ["VENEZOLANO DE CREDITO", "BVC"],
    "0105": ["MERCANTIL"],
    "0108": ["PROVINCIAL", "BBVA"],
    "0114": ["BANCARIBE"],
    "0115": ["EXTERIOR"],
    "0128": ["CARONI"],
    "0134": ["BANESCO"],
    "0138": ["PLAZA"],
    "0151": ["FONDO COMUN", "BFC", "BANCO FONDO COMUN"],
    "0156": ["100% BANCO", "100%BANCO"],
    "0157": ["DELSUR"],
    "0163": ["TESORO"],
    "0168": ["AGRICOLA DE VENEZUELA", "BANCAGRICOLA"],
    "0169": ["MIBANCO"],
    "0171": ["ACTIVO"],
    "0172": ["BANCAMIGA"],
    "0174": ["BANPLUS"],
    "0175": ["BICENTENARIO"],
    "0177": ["BANFANB"],
    "0191": ["BNC", "NACIONAL DE CREDITO"],
    "0178": ["N58 BANCO DIGITAL", "N58"]
}

def estandarizar_banco(nombre_banco: str) -> str:
    if not nombre_banco or nombre_banco.upper() in ["N/A", "NULL", "NONE"]:
        return None
    
    banco_limpio = nombre_banco.upper().strip()

    banco_limpio = banco_limpio.replace("Á", "A").replace("É", "E").replace("Í", "I").replace("Ó", "O").replace("Ú", "U")
    
    # 1. Si la IA ya extrajo un código de 4 dígitos exacto
    if re.match(r'^\d{4}$', banco_limpio) and banco_limpio in BANCOS_VENEZUELA:
        return banco_limpio

    # 2. Si la IA mandó el nombre con el código mezclado (Ej: "0151 - Bfc Banco...")
    match_codigo = re.search(r'\b(01\d{2})\b', banco_limpio)
    if match_codigo:
        codigo = match_codigo.group(1)
        if codigo in BANCOS_VENEZUELA:
            return codigo

    # 3. Búsqueda semántica por nombre o alias
    for codigo, alias_lista in BANCOS_VENEZUELA.items():
        for alias in alias_lista:
            if alias in banco_limpio:
                return codigo
                
    # Si no logra mapearlo, devuelve el original crudo para no perder el dato
    return banco_limpio

def estandarizar_telefono(telefono: str) -> str:
    if not telefono or telefono.upper() in ["N/A", "NULL", "NONE"]:
        return None
    
    # Dejar solo los números (elimina espacios, guiones, signos +)
    numeros = re.sub(r'\D', '', telefono)
    
    # Si viene con el código de país +58 (12 dígitos)
    if numeros.startswith('58') and len(numeros) == 12:
        numeros = '0' + numeros[2:]
        
    # Si tiene el largo correcto (11 dígitos), formatear
    if len(numeros) == 11:
        return f"{numeros[:4]}-{numeros[4:]}"
        
    return telefono

def estandarizar_identificacion(ident: str) -> str:
    if not ident or ident.upper() in ["N/A", "NULL", "NONE"]:
        return None
    
    # Eliminar guiones, puntos, espacios y convertir a mayúsculas
    ident_limpia = ident.upper().replace("-", "").replace(".", "").replace(" ", "")
    return ident_limpia

def normalizar_tipo_patron(tipo: str) -> str:
    if not tipo:
        return "CONCEPTO"
    tipo = tipo.upper()
    if tipo in ("DESCRIPCION", "CONCEPTO"):
        return "CONCEPTO"
    if tipo == "BENEFICIARIO":
        return "BENEFICIARIO"
    if tipo == "REFERENCIA":
        return "REFERENCIA"
    return "CONCEPTO"


def _columna_por_tipo(tipo: str) -> str:
    if tipo == "BENEFICIARIO":
        return "beneficiario"
    if tipo == "REFERENCIA":
        return "referencia"
    return "concepto"


def _calcular_periodo(frecuencia: str, fecha):
    from datetime import timedelta
    if frecuencia == "MENSUAL":
        inicio = fecha.replace(day=1)
        if fecha.month == 12:
            fin = fecha.replace(day=31)
        else:
            fin = fecha.replace(month=fecha.month + 1, day=1) - timedelta(days=1)
        return inicio, fin
    if frecuencia == "SEMANAL":
        inicio = fecha - timedelta(days=fecha.weekday())
        fin = inicio + timedelta(days=6)
        return inicio, fin
    if frecuencia == "QUINCENAL":
        return fecha, fecha + timedelta(days=13)
    return fecha, fecha


def intentar_auto_match_deuda(cursor, registro_id: int, categoria_id: int, monto: float,
                               monto_usd, fecha, es_ingreso: bool):
    if es_ingreso or not categoria_id:
        return

    cursor.execute(
        """
        SELECT 1 FROM pagos_deuda WHERE registro_bot_id = %s
        """,
        (registro_id,),
    )
    if cursor.fetchone():
        return

    cursor.execute(
        """
        SELECT id, frecuencia, tipo_deuda FROM deudas
        WHERE activa = true AND categoria_id = %s
        LIMIT 1
        """,
        (categoria_id,),
    )
    deuda = cursor.fetchone()
    if not deuda:
        return

    deuda_id, frecuencia, tipo_deuda = deuda
    inicio, fin = _calcular_periodo(frecuencia.upper(), fecha)

    if frecuencia.upper() != "DEFINIDA":
        cursor.execute(
            """
            SELECT 1 FROM pagos_deuda
            WHERE deuda_id = %s AND fecha_pago BETWEEN %s AND %s
            """,
            (deuda_id, inicio, fin),
        )
        if cursor.fetchone():
            return

    cursor.execute(
        """
        INSERT INTO pagos_deuda (deuda_id, monto_pagado_bs, monto_pagado_usd, fecha_pago, registro_bot_id, origen)
        VALUES (%s, %s, %s, %s, %s, 'AUTO')
        """,
        (deuda_id, monto, monto_usd, fecha, registro_id),
    )

    if frecuencia.upper() == "UNA_VEZ":
        cursor.execute("UPDATE deudas SET activa = false WHERE id = %s", (deuda_id,))


def aplicar_reglas_a_registro(cursor, registro_id: int):
    cursor.execute(
        "SELECT patron, tipo_patron, categoria_id FROM reglas_categorizacion WHERE activa = true"
    )
    reglas = cursor.fetchall()

    for patron, tipo_patron, categoria_id in reglas:
        tipo = normalizar_tipo_patron(tipo_patron)
        columna = _columna_por_tipo(tipo)
        cursor.execute(
            f"""
            UPDATE registros_bot
            SET categoria_id = %s
            WHERE id = %s
              AND categoria_id IS NULL
              AND procesado = false
              AND LOWER({columna}) LIKE LOWER(%s)
            """,
            (categoria_id, registro_id, f"%{patron}%"),
        )


def _consultar_tasa_externa(fecha):
    try:
        if fecha >= date.today():
            respuesta = requests.get("https://ve.dolarapi.com/v1/dolares/oficial", timeout=10)
            respuesta.raise_for_status()
            promedio = respuesta.json().get("promedio")
            if promedio:
                return float(promedio)

        respuesta = requests.get("https://ve.dolarapi.com/v1/historicos/dolares/oficial", timeout=15)
        respuesta.raise_for_status()
        fecha_iso = fecha.isoformat()
        for item in respuesta.json():
            if item.get("fecha") == fecha_iso and item.get("promedio"):
                return float(item["promedio"])
    except Exception as e:
        logging.warning("No se pudo consultar la tasa externa para %s: %s", fecha, e)
    return None


def _resolver_tasa_dolar(cursor, fecha):
    fecha_int = int(fecha.strftime("%Y%m%d"))
    cursor.execute("SELECT precio FROM valor_dolar WHERE fecha = %s", (fecha_int,))
    row = cursor.fetchone()
    if row and row[0] is not None:
        return float(row[0])

    tasa_externa = _consultar_tasa_externa(fecha)
    if tasa_externa is None or tasa_externa <= 0:
        return None

    cursor.execute(
        """
        INSERT INTO valor_dolar (fecha, dia, mes, ano, precio)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (fecha) DO NOTHING
        """,
        (fecha_int, fecha.day, fecha.month, fecha.year, tasa_externa),
    )
    return tasa_externa


def procesar_y_guardar_registro(registro: RegistroBot, conn):
    cursor = conn.cursor()
    try:
        # 1. Aplicar limpieza de texto
        origen_std = estandarizar_banco(registro.banco_origen)
        destino_std = estandarizar_banco(registro.banco_destino)
        telefono_std = estandarizar_telefono(registro.telefono)
        ident_std = estandarizar_identificacion(registro.identificacion)

        # 2. Buscar la tasa del dólar (local, luego API externa). Si ambas fallan, monto_dolar queda NULL.
        tasa_dia = _resolver_tasa_dolar(cursor, registro.fecha)
        monto_usd = round(registro.monto / tasa_dia, 2) if tasa_dia and tasa_dia > 0 else None

        # 4. Guardar en Base de Datos incluyendo monto_dolar
        cursor.execute("""
            INSERT INTO registros_bot
            (tipo, monto, monto_dolar, es_ingreso, referencia, fecha, banco_origen, banco_destino, beneficiario, telefono, identificacion, concepto)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            registro.tipo, registro.monto, monto_usd, registro.es_ingreso, registro.referencia,
            registro.fecha, origen_std, destino_std,
            registro.beneficiario, telefono_std, ident_std, registro.concepto
        ))
        registro_id = cursor.fetchone()[0]

        # 5. Aplicar reglas de categorización automática
        aplicar_reglas_a_registro(cursor, registro_id)

        # 6. Auto-match de deuda por categoría
        cursor.execute(
            "SELECT categoria_id, monto, monto_dolar, fecha, es_ingreso FROM registros_bot WHERE id = %s",
            (registro_id,),
        )
        row = cursor.fetchone()
        if row and row[0]:
            intentar_auto_match_deuda(cursor, registro_id, row[0], row[1], row[2], row[3], row[4])
    finally:
        cursor.close()