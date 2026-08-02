import logging
import pandas as pd
from decimal import Decimal
from datetime import datetime

def consultaDolar(cursor):
    cursor.execute("SELECT fecha, precio FROM valor_dolar")
    tasas = dict(cursor.fetchall())
    return tasas

def procesar_mercantil(ruta_archivo, cuenta_id, cursor, fecha_add):
    logging.info(f"Iniciando procesador MERCANTIL para cuenta {cuenta_id}")

    # 1. Obtener el último saldo registrado en la BD para continuar la secuencia
    cursor.execute("""
        SELECT saldo FROM movimientos 
        WHERE cuenta_id = %s 
        ORDER BY fechavalor DESC, id DESC LIMIT 1
    """, (cuenta_id,))
    resultado = cursor.fetchone()
    Saldo = Decimal(str(resultado[0])) if resultado else Decimal("0")

    # 2. Leer excel ignorando el encabezado del banco
    df = pd.read_excel(ruta_archivo, skiprows=8)
    df.columns = ["Tipo", "Fecha", "Referencia", "Descripcion", "Monto"]

    # 3. Limpiar filas informativas que dañan el cálculo
    df = df.dropna(subset=["Fecha"])
    df = df[~df["Descripcion"].astype(str).str.upper().str.contains("SALDO INICIAL|SALDO FINAL", na=False)]

    # 4. Parsear fechas a objetos reales ANTES de ordenar
    def parse_date(x):
        if isinstance(x, datetime):
            return x.date()
        try:
            return datetime.strptime(str(x).strip(), "%d/%m/%Y").date()
        except:
            return None

    df['FechaObj'] = df['Fecha'].apply(parse_date)
    df = df.dropna(subset=["FechaObj"])

    # 5. Ordenar cronológicamente (ahora sí usará el valor de tiempo, no texto)
    df = df.sort_values(by=["FechaObj", "Referencia"])

    tasas = consultaDolar(cursor)

    for _, fila in df.iterrows():
        FechaValor = fila["FechaObj"]
        FechaEfec = FechaValor
        Referencia = str(fila["Referencia"]).strip()
        Descripcion = str(fila["Descripcion"]).strip()

        try:
            monto = Decimal(str(fila["Monto"]))
        except:
            continue

        # Actualización de saldo dinámico
        if monto < 0:
            Egreso = abs(monto)
            Ingreso = Decimal("0")
            Saldo -= Egreso
        else:
            Ingreso = monto
            Egreso = Decimal("0")
            Saldo += Ingreso

        # Consultar tasa dólar
        tasaDolar = Decimal("0")
        fecha_dolar = int(FechaValor.strftime("%Y%m%d"))
        val_usd = tasas.get(fecha_dolar)

        if val_usd:
            tasaDolar = Decimal(str(val_usd))

        # Conversiones
        ingresoDolar = (Ingreso / tasaDolar) if Ingreso and tasaDolar > 0 else None
        egresoDolar = (Egreso / tasaDolar) if Egreso and tasaDolar > 0 else None
        saldoDolar = (Saldo / tasaDolar) if Saldo and tasaDolar > 0 else None

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
            float(Egreso), float(Ingreso), float(Saldo),
            float(ingresoDolar) if ingresoDolar is not None else None,
            float(egresoDolar) if egresoDolar is not None else None,
            float(saldoDolar) if saldoDolar is not None else None,
            float(tasaDolar)
        ))

    logging.info("Procesamiento MERCANTIL completado")