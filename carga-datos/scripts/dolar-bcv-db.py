import pandas as pd
import re
import psycopg2
import os
from pathlib import Path

# -------------------------
# Conexión DB
# -------------------------
conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", "5432"),
    database=os.getenv("DB_NAME", "finanzas"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "1234")
)
cursor = conn.cursor()

# -------------------------
# Constantes
# -------------------------
MESES = {
    'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4,
    'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
    'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
}

SCRIPT_DIR = Path("/app/scripts")

# -------------------------
# Helpers
# -------------------------
def limpiar_valor_dolar(valor):
    if pd.isna(valor) or valor in ['sábado', 'domingo', 'Feriado', 'Carnaval']:
        return None

    if isinstance(valor, str):
        valor = valor.replace('Bs.', '').strip()
        match = re.search(r'\d+(\.\d+)?', valor)
        return float(match.group()) if match else None

    try:
        return float(valor)
    except (ValueError, TypeError):
        return None


def extraer_ano(nombre_archivo: str) -> str:
    """
    tipo_cambio_BCV_2026_por_mes.csv → 2026
    """
    match = re.search(r'(\d{4})', nombre_archivo)
    if not match:
        raise ValueError(f"No se pudo determinar el año desde {nombre_archivo}")
    return match.group(1)


# -------------------------
# Proceso principal
# -------------------------
def procesar_archivo(csv_path: Path):
    print(f"\n Procesando archivo: {csv_path.name}")

    ano = extraer_ano(csv_path.name)
    df = pd.read_csv(csv_path)

    valor_numerico = None

    for _, fila in df.iterrows():
        nombre_mes = fila['Mes'].strip().upper()
        mes_numero = MESES.get(nombre_mes)

        if not mes_numero:
            continue

        try:
            dia = int(fila['Día'])
        except (ValueError, TypeError):
            continue

        nuevo_valor = limpiar_valor_dolar(fila['BCV'])
        if nuevo_valor is not None:
            valor_numerico = nuevo_valor

        if valor_numerico is None:
            continue

        fecha = f"{ano}{mes_numero:02d}{dia:02d}"

        cursor.execute(
            "SELECT 1 FROM valor_dolar WHERE fecha = %s",
            (fecha,)
        )

        if cursor.fetchone():
            continue

        cursor.execute("""
            INSERT INTO valor_dolar (
                fecha,
                dia,
                mes,
                ano,
                precio
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (fecha, dia, mes_numero, ano, valor_numerico))

        print(f"✔ {fecha} → {valor_numerico}")

    conn.commit()


# -------------------------
# Ejecutar todos los CSV
# -------------------------
def main():
    archivos = SCRIPT_DIR.glob("tipo_cambio_BCV_*_por_mes.csv")

    for archivo in archivos:
        procesar_archivo(archivo)

    print("\n✅ Carga de dólares completada")


if __name__ == "__main__":
    main()
