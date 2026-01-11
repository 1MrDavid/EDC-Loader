import pandas as pd
import re
import psycopg2
import os

conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", "5432"),
    database=os.getenv("DB_NAME", "finanzas"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "1234")
)

cursor = conn.cursor()

meses = {
    'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4, 'MAYO': 5, 'JUNIO': 6,
    'JULIO': 7, 'AGOSTO': 8, 'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
}

def limpiar_valor_dolar(valor_dolar):
    if pd.isna(valor_dolar) or valor_dolar in ['sábado', 'domingo', 'Feriado', 'Carnaval']:
        return None
    
    if isinstance(valor_dolar, str):
        # Eliminar referencias y texto no numérico
        valor_limpio = re.sub(r'\[\d+\]​', '', valor_dolar)
        valor_limpio = valor_limpio.replace('Bs.', '').strip()
        
        # Buscar números con decimales
        patron = r'(\d+\.\d+|\d+)'
        coincidencias = re.findall(patron, valor_limpio)
        
        if coincidencias:
            try:
                return float(coincidencias[0])
            except ValueError:
                return None
    else:
        try:
            return float(valor_dolar)
        except (ValueError, TypeError):
            return None
    
    return None

# Cargar y procesar el CSV
df = pd.read_csv('tipo_cambio_BCV_2025_por_mes.csv')

valor_numerico = 52.03
ano = '2025'
fecha_cocatenada = ''

for index, fila in df.iterrows():
    nombre_mes = fila['Mes'].strip().upper()
    mes_numero = meses.get(nombre_mes)
    
    try:
        dia = int(fila['Día'])
    except (ValueError, TypeError):
        continue
    
    valor_anterior = valor_numerico
    valor_numerico = limpiar_valor_dolar(fila['BCV'])
    
    if valor_numerico is not None:
        fecha_cocatenada = f"{ano}{mes_numero:02d}{dia:02d}"
        print(f"Fecha: {fecha_cocatenada}, Mes: {mes_numero:2d}, Día: {dia:2d}, Dólar: {valor_numerico:6.2f}")
    else:
        valor_numerico = valor_anterior
        fecha_cocatenada = f"{ano}{mes_numero:02d}{dia:02d}"
        print(f"Fecha: {fecha_cocatenada}, Mes: {mes_numero:2d}, Día: {dia:2d}, Dólar: {valor_numerico:6.2f}")

    cursor.execute("SELECT COUNT(*) FROM valor_dolar WHERE fecha = %s", (fecha_cocatenada,))
    count = cursor.fetchone()[0]

    if count == 0:
        try:

            cursor.execute("""
                INSERT INTO valor_dolar VALUES (%s, %s, %s, %s, %s)
            """, (
                fecha_cocatenada, dia, mes_numero, ano, valor_numerico
            ))

            conn.commit()
        except Exception as err:
            print(f"Error al insertar en la base de datos: {err}")