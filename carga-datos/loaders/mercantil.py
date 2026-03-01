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

    # Leer excel ignorando primeras 8 filas
    df = pd.read_excel(
        ruta_archivo,
        skiprows=8
    )

    # Renombrar columnas para claridad
    df.columns = ["Tipo", "Fecha", "Referencia", "Descripcion", "Monto"]

    df = df.sort_values(by=["Fecha", "Referencia"])

    tasas = consultaDolar(cursor)

    Saldo = None

    for _, fila in df.iterrows():

        if pd.isna(fila["Fecha"]):
            continue

        # Fecha
        if isinstance(fila["Fecha"], datetime):
            FechaValor = fila["Fecha"].date()
        else:
            try:
                FechaValor = datetime.strptime(str(fila["Fecha"]), "%d/%m/%Y").date()
            except:
                continue

        FechaEfec = FechaValor

        Referencia = str(fila["Referencia"]).strip()
        Descripcion = str(fila["Descripcion"]).strip()

        try:
            monto = Decimal(str(fila["Monto"]))
        except:
            continue

        # Determinar ingreso / egreso por signo
        if monto < 0:
            Egreso = abs(monto)
            Ingreso = Decimal("0")
        else:
            Ingreso = monto
            Egreso = Decimal("0")

        descripcion_upper = Descripcion.upper().strip()
        if descripcion_upper == "SALDO INICIAL":
            Saldo = Ingreso  
            continue  # no insertamos este como movimiento 
        elif descripcion_upper == "SALDO FINAL":
            if Saldo is not None and Saldo != Ingreso:
                logging.warning("Saldo final no coincide con saldo calculado")
            continue
        else:
            if Saldo is not None:
                if Ingreso > 0:
                    Saldo += Ingreso
                elif Egreso > 0:
                    Saldo -= Egreso

        if Saldo is None:
            raise ValueError("No se encontró SALDO INICIAL antes de movimientos")

        # Consultar tasa dólar
        tasaDolar = None
        
        fecha_dolar = int(FechaValor.strftime("%Y%m%d"))
        val_usd = tasas.get(fecha_dolar)

        if val_usd:
            tasaDolar = Decimal(str(val_usd))
        else:
            tasaDolar = Decimal("0")

        # Conversiones
        ingresoDolar = (Ingreso / tasaDolar) if Ingreso and tasaDolar else None
        egresoDolar = (Egreso / tasaDolar) if Egreso and tasaDolar else None
        saldoDolar = (Saldo / tasaDolar) if Saldo and tasaDolar else None

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
            cuenta_id,
            fecha_add,
            FechaValor,
            FechaEfec,
            Referencia,
            Descripcion,
            float(Egreso),
            float(Ingreso),
            Saldo,
            float(ingresoDolar) if ingresoDolar is not None else None,
            float(egresoDolar) if egresoDolar is not None else None,
            saldoDolar,
            float(tasaDolar)
        ))

    logging.info("Procesamiento MERCANTIL completado")