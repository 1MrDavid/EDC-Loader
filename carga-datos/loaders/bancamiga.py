import logging
from decimal import Decimal
from datetime import datetime

# Función para limpiar y convertir números, adaptada para ignorar comillas
def convertir_valor(val):
    val = val.replace('"', '').replace(".", "").replace(",", ".").strip()
    return float(val) if val else 0.0

# Función específica para la fecha de Bancamiga (año de 2 dígitos)
def convertir_fecha_bancamiga(valor):
    valor = valor.replace('"', '').strip()
    if not valor: return None
    try:
        # Nota el %y minúscula para años como '26'
        return datetime.strptime(valor, "%d/%m/%y").date()
    except ValueError:
        return None

# Asegúrate de importar o mantener en este archivo la función consultaDolar 
# si la tienes de manera global en tu proyecto, igual que en bfc.py
def consultaDolar(fecha, cursor):
    cursor.execute("SELECT precio FROM valor_dolar WHERE fecha = %s", (fecha,))
    resultado = cursor.fetchone()
    return resultado[0] if resultado else None


def procesar_bancamiga(ruta_archivo, cuenta_id, cursor, fecha_add):
    logging.info(f"Iniciando procesador Bancamiga para cuenta {cuenta_id}")
    
    with open(ruta_archivo, "r", encoding="utf-8") as archivo:
        saldo_inicial_registrado = False
        
        for linea in archivo:
            linea = linea.strip()
            if not linea:
                continue
            
            # 1. Extraer el Saldo Inicial de la primera línea 
            # (También ignorará la línea de resumen final que empieza igual)
            if linea.startswith('"Saldo Inicial:'):
                if not saldo_inicial_registrado:
                    partes = linea.split(':')
                    if len(partes) > 1:
                        # Extrae el monto, limpiando comillas y posibles cortes de la línea final
                        val_str = partes[1].replace('"', '').split('|')[0]
                        saldo_inicial = convertir_valor(val_str)
                        
                        # Insertar movimiento de Saldo Inicial
                        cursor.execute("""
                            INSERT INTO movimientos (
                                cuenta_id, fechaadd, fechavalor, fechaefec, referencia, 
                                descripcion, egreso, ingreso, saldo, 
                                ingresodolar, egresodolar, saldodolar, tasadolar
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            cuenta_id, fecha_add, None, None, "", "SALDO INICIAL",
                            0.0, 0.0, saldo_inicial, None, None, None, 0.0
                        ))
                        saldo_inicial_registrado = True
                continue 

            # 2. Omitir la cabecera de las columnas
            if "Referencia|Fecha|Hora" in linea:
                continue

            # 3. Procesar las líneas de transacciones normales
            campos = linea.split("|")
            if len(campos) < 7:
                continue

            # Mapeo de columnas según el formato Bancamiga
            Referencia = campos[0].replace('"', '').strip()
            FechaValor = convertir_fecha_bancamiga(campos[1])
            FechaEfec = FechaValor # Bancamiga solo da una fecha, replicamos la misma
            # Ignoramos campos[2] que es la Hora
            Descripcion = campos[3].replace('"', '').strip()
            Egreso = convertir_valor(campos[4])
            Ingreso = convertir_valor(campos[5])
            Saldo = convertir_valor(campos[6])

            # Ignorar si es basura o no se parseó la fecha
            if not FechaValor:
                continue

            # 4. Cálculo del Dólar
            tasaDolar = 0.0
            fecha_dolar = FechaValor.strftime("%Y%m%d")
            val_usd = consultaDolar(fecha_dolar, cursor)
            
            if val_usd: 
                tasaDolar = val_usd
            else: 
                tasaDolar = None

            # Conversiones matemáticas
            ingresoDolar = (Decimal(str(Ingreso)) / Decimal(str(tasaDolar))) if Ingreso and tasaDolar else None
            egresoDolar = (Decimal(str(Egreso)) / Decimal(str(tasaDolar))) if Egreso and tasaDolar else None
            saldoDolar = (Decimal(str(Saldo)) / Decimal(str(tasaDolar))) if Saldo and tasaDolar else None
            
            if tasaDolar is None: tasaDolar = 0.0

            # 5. Insertar transacción
            cursor.execute("""
                INSERT INTO movimientos (
                    cuenta_id, fechaadd, fechavalor, fechaefec, referencia, 
                    descripcion, egreso, ingreso, saldo, 
                    ingresodolar, egresodolar, saldodolar, tasadolar
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                cuenta_id, fecha_add, FechaValor, FechaEfec, Referencia, Descripcion,
                Egreso, Ingreso, Saldo, ingresoDolar, egresoDolar, saldoDolar, tasaDolar
            ))