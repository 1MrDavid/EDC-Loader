import logging
import os
from datetime import date
from loaders.bfc import procesar_bfc

# ==========================================
# MAPA DE BANCOS (FACTORY)
# Aquí registrarás tus futuros bancos
# ==========================================
BANK_LOADERS = {
    "BFC": procesar_bfc,
    # "MERCANTIL": procesar_mercantil,  <-- Futuro
    # "BANESCO": procesar_banesco       <-- Futuro
}

def archivo_ya_cargado(cursor, nombre_archivo):
    cursor.execute("SELECT 1 FROM archivos_cargados WHERE nombre_archivo = %s LIMIT 1", (nombre_archivo,))
    return cursor.fetchone() is not None

def registrar_archivo_cargado(cursor, nombre_archivo):
    cursor.execute("INSERT INTO archivos_cargados (nombre_archivo) VALUES (%s)", (nombre_archivo,))

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
            m.egreso,
            m.ingresodolar,
            m.egresodolar
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
        ingresos_total_dolar,
        egresos_total_dolar,
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
        SUM(mm.ingreso)      AS ingresos_total,
        SUM(mm.egreso)       AS egresos_total,
        SUM(mm.ingresodolar) AS ingresos_total_dolar,
        SUM(mm.egresodolar)  AS egresos_total_dolar,
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
        ingresos_total_dolar = EXCLUDED.ingresos_total_dolar,
        egresos_total_dolar = EXCLUDED.egresos_total_dolar,
        numero_ingresos = EXCLUDED.numero_ingresos,
        numero_egresos = EXCLUDED.numero_egresos,
        saldo_variacion = EXCLUDED.saldo_variacion,
        flujo_neto = EXCLUDED.flujo_neto,
        promedio_ingreso = EXCLUDED.promedio_ingreso,
        promedio_egreso = EXCLUDED.promedio_egreso;
    """, (cuenta_id,))

def ejecutar_procesamiento(banco_key, ruta_archivo, cuenta_id, nombre_original, conn):
    """Lógica principal que envuelve al loader específico"""
    
    # 1. Validar que el banco existe
    loader_func = BANK_LOADERS.get(banco_key.upper())
    if not loader_func:
        raise ValueError(f"Banco '{banco_key}' no soportado.")

    cursor = conn.cursor()
    try:
        # 2. Verificar duplicados
        if archivo_ya_cargado(cursor, nombre_original):
            raise FileExistsError(f"El archivo '{nombre_original}' ya fue cargado previamente.")

        # 3. Ejecutar el loader específico
        fecha_add = date.today()
        loader_func(ruta_archivo, cuenta_id, cursor, fecha_add)
        
        # 4. Tareas post-carga
        recalcular_balance_mensual(cursor, cuenta_id)
        registrar_archivo_cargado(cursor, nombre_original)
        
        conn.commit()
        logging.info("Procesamiento finalizado con éxito.")
        
    except Exception as e:
        conn.rollback()
        logging.error(f"Error procesando archivo: {e}")
        raise e
    finally:
        cursor.close()