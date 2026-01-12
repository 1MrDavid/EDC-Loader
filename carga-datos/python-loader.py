import os
import psycopg2
import logging
from decimal import Decimal
from datetime import datetime
from datetime import date
import sys

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

def procesar_archivo(ruta_archivo, cuenta_id, cursor):
    fechaAdd = date.today()

    with open(ruta_archivo, "r", encoding="utf-8") as archivo:
        next(archivo)

        for linea in archivo:
            campos = linea.strip().split("|")
            if len(campos) < 7:
                continue

            FechaValor = convertir_fecha(campos[0])
            FechaEfec = convertir_fecha(campos[1])
            Referencia = campos[2].strip()
            Descripcion = campos[3].strip()
            Egreso = convertir_valor(campos[4])
            Ingreso = convertir_valor(campos[5])
            Saldo = convertir_valor(campos[6])

            # Consulta tasa dólar según fecha valor
            if FechaValor:
                fecha_dolar = FechaValor.strftime("%Y%m%d")
                tasaDolar = consultaDolar(fecha_dolar, cursor)
            else:
                tasaDolar = None

            # Conversiones
            ingresoDolar = (Decimal(Ingreso) / tasaDolar) if Ingreso and tasaDolar else None
            egresoDolar = (Decimal(Egreso) / tasaDolar) if Egreso and tasaDolar else None
            saldoDolar = (Decimal(Saldo) / tasaDolar) if Saldo and tasaDolar else None

            if tasaDolar is None:
                tasaDolar = 0.0

            cursor.execute("""
                INSERT INTO movimientos (
                    cuenta_id,
                    fechaadd,
                    fechavalor,
                    fechaefec,
                    referencia,
                    descripcion,
                    egreso,
                    ingreso,
                    saldo,
                    ingresodolar,
                    egresodolar,
                    saldodolar,
                    tasadolar
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                cuenta_id,
                fechaAdd,
                FechaValor,
                FechaEfec,
                Referencia,
                Descripcion,
                Egreso,
                Ingreso,
                Saldo,
                ingresoDolar,
                egresoDolar,
                saldoDolar,
                tasaDolar
            ))

        logging.info(f"Archivo {ruta_archivo} cargado correctamente.")         

# Calculo de estadisticas
def recalcular_balance_mensual(cursor, cuenta_id):
    cursor.execute("""
    WITH movimientos_mes AS (
        SELECT
            m.id,
            m.cuenta_id,
            date_trunc('month', m.fechavalor)::date AS periodo,
            m.fechavalor,
            m.saldo,
            m.ingreso,
            m.egreso
        FROM movimientos m
        WHERE m.cuenta_id = %s
    ),
    primer_movimiento AS (
        SELECT DISTINCT ON (cuenta_id, periodo)
            cuenta_id,
            periodo,
            saldo AS monto_inicio
        FROM movimientos_mes
        ORDER BY cuenta_id, periodo, id ASC
    ),
    ultimo_movimiento AS (
        SELECT DISTINCT ON (cuenta_id, periodo)
            cuenta_id,
            periodo,
            saldo AS monto_final
        FROM movimientos_mes
        ORDER BY cuenta_id, periodo, id DESC
    )
    INSERT INTO balance_mensual (
        cuenta_id,
        periodo,
        monto_inicio,
        monto_final,
        ingresos_total,
        egresos_total,
        numero_ingresos,
        numero_egresos,
        saldo_variacion,
        flujo_neto,
        promedio_ingreso,
        promedio_egreso
    )
    SELECT
        pm.cuenta_id,
        pm.periodo,
        pm.monto_inicio,
        um.monto_final,
        SUM(mm.ingreso) AS ingresos_total,
        SUM(mm.egreso) AS egresos_total,
        COUNT(*) FILTER (WHERE mm.ingreso > 0) AS numero_ingresos,
        COUNT(*) FILTER (WHERE mm.egreso > 0) AS numero_egresos,
        (um.monto_final - pm.monto_inicio) AS saldo_variacion,
        (SUM(mm.ingreso) - SUM(mm.egreso)) AS flujo_neto,
        AVG(mm.ingreso) FILTER (WHERE mm.ingreso > 0) AS promedio_ingreso,
        AVG(mm.egreso) FILTER (WHERE mm.egreso > 0) AS promedio_egreso
    FROM primer_movimiento pm
    JOIN ultimo_movimiento um 
        ON pm.cuenta_id = um.cuenta_id 
        AND pm.periodo = um.periodo
    JOIN movimientos_mes mm 
        ON mm.cuenta_id = pm.cuenta_id 
        AND mm.periodo = pm.periodo
    GROUP BY pm.cuenta_id, pm.periodo, pm.monto_inicio, um.monto_final
    ON CONFLICT (cuenta_id, periodo)
    DO UPDATE SET
        monto_inicio = EXCLUDED.monto_inicio,
        monto_final = EXCLUDED.monto_final,
        ingresos_total = EXCLUDED.ingresos_total,
        egresos_total = EXCLUDED.egresos_total,
        numero_ingresos = EXCLUDED.numero_ingresos,
        numero_egresos = EXCLUDED.numero_egresos,
        saldo_variacion = EXCLUDED.saldo_variacion,
        flujo_neto = EXCLUDED.flujo_neto,
        promedio_ingreso = EXCLUDED.promedio_ingreso,
        promedio_egreso = EXCLUDED.promedio_egreso;
    """, (cuenta_id,))

#=================================================#
# main                                            #
#=================================================#


def main():
    if len(sys.argv) != 3:
        logging.error("Uso: python python-loader.py <archivo> <cuenta_id>")
        sys.exit(1)

    # Realiza conexion a la DB
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "finanzas"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "1234")
    )

    ruta_archivo = sys.argv[1]
    cuenta_id = int(sys.argv[2])

    cursor = conn.cursor()

    if archivo_ya_cargado(cursor, os.path.basename(ruta_archivo)):
        logging.error("Archivo ya cargado previamente")
        sys.exit(2)

    procesar_archivo(ruta_archivo, cuenta_id, cursor)
    conn.commit()
    recalcular_balance_mensual(cursor, cuenta_id)
    conn.commit()
    registrar_archivo_cargado(cursor, os.path.basename(ruta_archivo))
    conn.commit()

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()

