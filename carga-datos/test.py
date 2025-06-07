import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port="5432",
    database="finanzas",
    user="root",
    password="1234"
)

def elimina_tabla(cursor):
    # Eliminar la tabla
    cursor.execute("DROP TABLE IF EXISTS finanzas")
    cursor.execute("DROP TABLE IF EXISTS archivos_cargados")
    cursor.execute("DROP TABLE IF EXISTS valor_dolar")
    conn.commit()
    print("Tabla eliminada.")

def eliminar_datos(cursor):
    cursor.execute("DELETE FROM finanzas")
    cursor.execute("DELETE FROM archivos_cargados")
    # cursor.execute("DELETE FROM valor_dolar")
    conn.commit()
    print("Datos eliminados")

def mostrar_tabla(cursor):
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)
    tablas = cursor.fetchall()
    print("Tablas:")
    for t in tablas:
        print(t[0])

    cursor.execute("SELECT * FROM finanzas")
    registros = cursor.fetchall()
    for fila in registros:
        print(fila)

    cursor.execute("SELECT * FROM archivos_cargados")
    registros = cursor.fetchall()
    for fila in registros:
        print(fila)

    cursor.execute("SELECT * FROM valor_dolar")
    registros = cursor.fetchall()
    for fila in registros:
        print(fila)

def main():
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS finanzas (
            id SERIAL PRIMARY KEY,
            diaadd INTEGER NOT NULL,
            mesadd INTEGER NOT NULL,
            anoadd INTEGER NOT NULL,
            horaadd TIME NOT NULL,
            fechavalor TEXT,
            fechaefec TEXT,
            referencia TEXT,
            descripcion TEXT,
            egreso NUMERIC,
            ingreso NUMERIC,
            saldo NUMERIC,
            ingresoDolar NUMERIC,
            egresoDolar NUMERIC,
            saldoDolar NUMERIC,
            tasaDolar NUMERIC,
            categoria TEXT 
        )
    """)

    # Índices para la tabla finanzas
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finanzas_fecha ON finanzas (anoadd, mesadd, diaadd)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finanzas_referencia ON finanzas (referencia)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finanzas_egreso ON finanzas (egreso)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finanzas_ingreso ON finanzas (ingreso)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finanzas_categoria ON finanzas (categoria)")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS archivos_cargados (
            nombre_archivo TEXT PRIMARY KEY,
            fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS valor_dolar (
            fecha INTEGER PRIMARY KEY,
            dia INTEGER NOT NULL,
            mes INTEGER NOT NULL,
            ano INTEGER NOT NULL,
            precio DECIMAL NOT NULL
        );
    """)

    # Índices para la tabla valor_dolar
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_valor_dolar_fecha ON valor_dolar (fecha)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_valor_dolar_dia_mes_ano ON valor_dolar (dia, mes, ano)")

    
    elegir = input("Selecciona opcion\n1-Mostrar datos\n2-Eliminar datos\n3-Eliminar tabla\n")

    if elegir == "1":
        mostrar_tabla(cursor)
    elif elegir == "2":
        eliminar_datos(cursor)
    elif elegir == "3":
        elimina_tabla(cursor)
        

    conn.commit()
    cursor.close()

if __name__ == "__main__":
    main()
