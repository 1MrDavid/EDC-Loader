import re
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

def procesar_y_guardar_registro(registro: RegistroBot, conn):
    cursor = conn.cursor()
    try:
        # 1. Aplicar limpieza de texto
        origen_std = estandarizar_banco(registro.banco_origen)
        destino_std = estandarizar_banco(registro.banco_destino)
        telefono_std = estandarizar_telefono(registro.telefono)
        ident_std = estandarizar_identificacion(registro.identificacion)

        # 2. Buscar la tasa del dólar para la fecha del movimiento
        # Pydantic entrega registro.fecha como un objeto datetime.date
        fecha_int = int(registro.fecha.strftime('%Y%m%d'))
        
        cursor.execute("SELECT precio FROM valor_dolar WHERE fecha = %s", (fecha_int,))
        row = cursor.fetchone()
        
        tasa_dia = float(row[0]) if row and row[0] is not None else None
        
        # 3. Calcular el monto en dólares (si existe la tasa)
        monto_usd = round(registro.monto / tasa_dia, 2) if tasa_dia and tasa_dia > 0 else None

        # 4. Guardar en Base de Datos incluyendo monto_dolar
        cursor.execute("""
            INSERT INTO registros_bot
            (tipo, monto, monto_dolar, es_ingreso, referencia, fecha, banco_origen, banco_destino, beneficiario, telefono, identificacion, concepto)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            registro.tipo, registro.monto, monto_usd, registro.es_ingreso, registro.referencia,
            registro.fecha, origen_std, destino_std,
            registro.beneficiario, telefono_std, ident_std, registro.concepto
        ))
    finally:
        cursor.close()