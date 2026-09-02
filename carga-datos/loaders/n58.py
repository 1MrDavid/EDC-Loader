import logging
import pandas as pd
from decimal import Decimal
from datetime import datetime
import math

def consultaDolar(cursor):
    cursor.execute("SELECT fecha, precio FROM valor_dolar")
    tasas = dict(cursor.fetchall())
    return tasas

def procesar_n58(ruta_archivo, cuenta_id, cursor, fecha_add):
    logging.info(f"Iniciando procesador N58 para cuenta {cuenta_id}")

    # 1. Leer excel ignorando el encabezado del banco (primeras 8 filas)
    # Obligamos a leer 'REFERENCIA' como texto para no perder los ceros a la izquierda (ej. 004714)
    df = pd.read_excel(ruta_archivo, skiprows=8, dtype={1: str})
    
    # Nombramos las columnas basándonos en la estructura de N58
    df.columns = ["Fecha", "Referencia", "Descripcion", "Monto", "Saldo"]

    # 2. Limpiar filas informativas, celdas vacías o el footer de N58
    df = df.dropna(subset=["Fecha"])
    df = df[~df["Fecha"].astype(str).str.contains("TOTALES|Documento", na=False, case=False)]

    # 3. Parsear fechas a objetos reales
    def parse_date(x):
        if isinstance(x, datetime):
            return x.date()
        try:
            return datetime.strptime(str(x).strip(), "%d/%m/%Y").date()
        except:
            return None

    df['FechaObj'] = df['Fecha'].apply(parse_date)
    df = df.dropna(subset=["FechaObj"])

    # Extraer todas las tasas de BD a memoria
    tasas = consultaDolar(cursor)

    for _, fila in df.iterrows():
        FechaValor = fila["FechaObj"]
        FechaEfec = FechaValor
        
        # Limpieza de referencia
        Referencia = str(fila["Referencia"]).strip()
        if Referencia == 'nan':
            Referencia = ""

        Descripcion = str(fila["Descripcion"]).strip()

        try:
            monto = Decimal(str(fila["Monto"]))
            saldo_val = Decimal(str(fila["Saldo"]))
        except Exception as e:
            continue

        # N58 unifica Ingresos y Egresos en la misma columna (Monto)
        # Si es negativo, es un Egreso.
        if monto < 0:
            Egreso = abs(monto)
            Ingreso = Decimal("0")
        else:
            Ingreso = monto
            Egreso = Decimal("0")

        # Consultar tasa dólar
        tasaDolar = Decimal("0")
        fecha_dolar = int(FechaValor.strftime("%Y%m%d"))
        val_usd = tasas.get(fecha_dolar)

        if val_usd:
            tasaDolar = Decimal(str(val_usd))

        # Conversiones
        ingresoDolar = (Ingreso / tasaDolar) if Ingreso and tasaDolar > 0 else None
        egresoDolar = (Egreso / tasaDolar) if Egreso and tasaDolar > 0 else None
        saldoDolar = (saldo_val / tasaDolar) if saldo_val and tasaDolar > 0 else None

        # Insertar
        cursor.execute("""
            INSERT INTO movimientos (
                cuenta_id, fechaadd, fechavalor, fechaefec,
                referencia, descripcion,
                egreso, ingreso, saldo,
                ingresodolar, egresodolar, saldodolar,
                tasadolar
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            cuenta_id, fecha_add, FechaValor, FechaEfec,
            Referencia, Descripcion,
            float(Egreso), float(Ingreso), float(saldo_val),
            float(ingresoDolar) if ingresoDolar is not None else None,
            float(egresoDolar) if egresoDolar is not None else None,
            float(saldoDolar) if saldoDolar is not None else None,
            float(tasaDolar)
        ))

    logging.info("Procesamiento N58 completado")