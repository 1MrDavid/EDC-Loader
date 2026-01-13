import logging
from decimal import Decimal
from datetime import datetime
import sys

# Reutilizamos tus funciones auxiliares
def convertir_valor(val):
    val = val.replace(".", "").replace(",", ".").strip()
    return float(val) if val else 0.0

def convertir_fecha(valor):
    valor = valor.strip()
    if not valor: return None
    try:
        return datetime.strptime(valor, "%d/%m/%Y").date()
    except ValueError:
        return None

def consultaDolar(fecha, cursor):
    cursor.execute("SELECT precio FROM valor_dolar WHERE fecha = %s", (fecha,))
    resultado = cursor.fetchone()
    return resultado[0] if resultado else None

# ESTA es la función que llamará el Manager
def procesar_bfc(ruta_archivo, cuenta_id, cursor, fecha_add):
    logging.info(f"Iniciando procesador BFC para cuenta {cuenta_id}")
    
    with open(ruta_archivo, "r", encoding="utf-8") as archivo:
        next(archivo) # Saltar cabecera si existe

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

            # Consulta tasa dólar
            tasaDolar = 0.0
            if FechaValor:
                fecha_dolar = FechaValor.strftime("%Y%m%d")
                val_usd = consultaDolar(fecha_dolar, cursor)
                if val_usd: tasaDolar = val_usd
            else:
                tasaDolar = None

            # Conversiones
            # (Nota: Asegúrate de manejar la división por cero si tasaDolar es 0)
            ingresoDolar = (Decimal(str(Ingreso)) / Decimal(str(tasaDolar))) if Ingreso and tasaDolar else None
            egresoDolar = (Decimal(str(Egreso)) / Decimal(str(tasaDolar))) if Egreso and tasaDolar else None
            saldoDolar = (Decimal(str(Saldo)) / Decimal(str(tasaDolar))) if Saldo and tasaDolar else None
            
            if tasaDolar is None: tasaDolar = 0.0

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