import os
import psycopg2
import logging
from decimal import Decimal
from datetime import datetime

#=================================================#
# Configuracion del log                           #
#=================================================#

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s [%(levelname)s] %(message)s"
)


#=================================================#
# Funciones                                       #
#=================================================#

# Arregla el formato de los saldos para que lo permite el DB
def convertir_valor(val):
    val = val.replace(".", "").replace(",", ".").strip()
    return float(val) if val else 0.0

# Intenta convertir fechas, si no se puede, usa None
def convertir_fecha(valor):
    valor = valor.strip()
    if not valor:
        return None
    try:
        return datetime.strptime(valor, "%d/%m/%Y").date()
    except ValueError:
        logging.error(f"Fecha inválida: {valor}, se usará NULL.")
        return None

# Comprueba si el edc del mes y año ya existe en el DB
def archivo_ya_cargado(cursor, nombre_archivo):
    cursor.execute("""
        SELECT 1 FROM archivos_cargados WHERE nombre_archivo = %s LIMIT 1
    """, (nombre_archivo,))
    return cursor.fetchone() is not None

# Agrega el nombre del archivo a la tabla de archivos cargado para que el demonio no lo tome en cuenta
def registrar_archivo_cargado(cursor, nombre_archivo):
    cursor.execute("""
        INSERT INTO archivos_cargados (nombre_archivo) VALUES (%s)
    """, (nombre_archivo,))

# Consulta el valor del dia correspondiente a la fecha valor de la transaccion
def consultaDolar(fecha, cursor):

    cursor.execute("SELECT precio FROM valor_dolar WHERE fecha = %s", (fecha,))

    resultado = cursor.fetchone() 

    if resultado:
        precio_dolar = resultado[0]
    else:
        precio_dolar = None

    return precio_dolar

# Procesa el EDC
def procesar_archivo(ruta_archivo, cursor):
    hoy = datetime.now()
    diaAdd = hoy.day
    mesAdd = hoy.month
    anoAdd = hoy.year
    ahora = datetime.now()
    horaAdd = ahora.time()

    logging.info(f"Procesando archivo: {ruta_archivo}")
    with open(ruta_archivo, "r", encoding="utf-8") as archivo:
        next(archivo)  # saltar encabezado
        for linea in archivo:
            campos = linea.strip().split(";")
            if len(campos) < 7:
                continue  # evitar errores si línea incompleta

            # Carga valores del EDC
            FechaValor = convertir_fecha(campos[0])
            FechaEfec = convertir_fecha(campos[1])
            Referencia = campos[2].strip()
            Descripcion = campos[3].strip()
            Egreso = convertir_valor(campos[4])
            Ingreso = convertir_valor(campos[5])
            Saldo = convertir_valor(campos[6])

            if FechaValor:
                # Toma la fecha valor para realizar la consulta de la tasa del dolar
                fecha = FechaValor.strftime("%Y%m%d")

                # Toma la tasa del dolar correspondiente a la fecha valor
                tasaDolar = consultaDolar(fecha, cursor)
            else:
                tasaDolar = None

            # Realiza las respectivas conversiones
            ingresoDolar = (Decimal(Ingreso) / tasaDolar) if Ingreso > 0 and tasaDolar else None
            egresoDolar = (Decimal(Egreso) / tasaDolar) if Egreso > 0 and tasaDolar else None
            saldoDolar = (Decimal(Saldo) / tasaDolar) if tasaDolar else None

            # Agrega a la base de datos
            cursor.execute("""
                INSERT INTO finanzas (
                    diaadd, mesadd, anoadd, horaadd,
                    fechavalor, fechaefec, referencia,
                    descripcion, egreso, ingreso, saldo,
                    ingresoDolar, egresoDolar, saldoDolar,
                    tasaDolar
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                diaAdd, mesAdd, anoAdd, horaAdd,
                FechaValor, FechaEfec, Referencia,
                Descripcion, Egreso, Ingreso, Saldo,
                ingresoDolar, egresoDolar, saldoDolar,
                tasaDolar
            ))

        conn.commit()
        logging.info(f"Archivo {ruta_archivo} cargado correctamente.")             

#=================================================#
# Definiciones iniciales                          #
#=================================================#

# Realiza conexion a la DB
conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", "5432"),
    database=os.getenv("DB_NAME", "finanzas"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "1234")
)

#=================================================#
# main                                            #
#=================================================#

def main():
    cursor = conn.cursor()

    carpeta = "./estados-cuenta"
    if not os.path.exists(carpeta):
        logging.error(f"La carpeta {carpeta} no existe.")
        return

    for archivo_nombre in os.listdir(carpeta):
        if not archivo_nombre.endswith(".txt"):
            continue

        if archivo_ya_cargado(cursor, archivo_nombre):
            logging.error(f"Archivo ya cargado previamente: {archivo_nombre}")
            continue

        ruta_completa = os.path.join(carpeta, archivo_nombre)
        procesar_archivo(ruta_completa, cursor)

        registrar_archivo_cargado(cursor, archivo_nombre)
        conn.commit()  # importante confirmar la inserción en archivos_cargados

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()

