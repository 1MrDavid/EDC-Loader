import os
import time
import subprocess
import psycopg2
import requests
import logging
from datetime import datetime, date, timedelta

#=================================================#
# Configuracion del log                           #
#=================================================#

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s [%(levelname)s] %(message)s"
)

#=================================================#
# Definiciones iniciales                          #
#=================================================#

# DIRECTORIO_ARCHIVOS = "/app/estados-cuenta"
DIRECTORIO_ARCHIVOS = "./estados-cuenta"
CHEQUEO_INTERVALO = 100  # segundos

SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "python-loader.py")

#=================================================#
# Funciones                                       #
#=================================================#

def db_disponible():
    try:
        # Realiza conexion a la DB
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "finanzas"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "1234")
        )

        conn.close()
        return True
    except:
        logging.error("La base de datos no está disponible.")
        return False

def archivos_nuevos():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "finanzas"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "1234")
        )

        cursor = conn.cursor()
        archivos_en_directorio = os.listdir(DIRECTORIO_ARCHIVOS)
        nuevos = []

        for archivo in archivos_en_directorio:
            cursor.execute("SELECT COUNT(*) FROM archivos_cargados WHERE nombre_archivo = %s", (archivo,))
            count = cursor.fetchone()[0]
            if count == 0:
                nuevos.append(archivo)

        conn.close()
        return nuevos
    except Exception as e:
        logging.error("Error al verificar archivos nuevos:", e)
        return []
    
def carga_precio_dolar():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "finanzas"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "1234")
        )

        cursor = conn.cursor()

        # Carga fecha actual
        hoy = datetime.now()

        # Carga fecha del dia anterior para cargar precio del dolar sin esperar actualizacion del BCV
        ayer = date.today() - timedelta(days=1)
        dd = ayer.day
        mm = ayer.month
        yy = ayer.year
        fec = int(f"{yy}{mm:02}{dd:02}")

        cursor.execute("SELECT COUNT(*) FROM valor_dolar WHERE fecha = %s", (fec,))
        count = cursor.fetchone()[0]

        if count == 0:
            try:
                url = "https://ve.dolarapi.com/v1/dolares/oficial"

                logging.info("Consultando API del dólar")
                response = requests.get(url)
                response.raise_for_status()

                data = response.json()

                valorDolar = data['promedio']

                if not valorDolar:
                    logging.error("No se obtuvo valor de dólar válido")
                    return False

                cursor.execute("""
                    INSERT INTO valor_dolar VALUES (%s, %s, %s, %s, %s)
                """, (
                    fec, dd, mm, yy, valorDolar
                ))

                conn.commit()

                logging.info(f"Dólar insertado para {dd}/{mm}/{yy}: {valorDolar} Bs.")

            except Exception as err:
                logging.error(f"Error obteniendo el valor del dólar: {err}")
                return False
        else:
            logging.info(f" Ya se cargó el precio del dólar para {dd}/{mm}/{yy}")

        
        cursor.close()
        conn.close()
        return True
    
    except Exception as e:
        logging.error(f"Error al consultar o guardar precio del dólar: {e}")
        return False

def ejecutar_loader():
    logging.info("Ejecutando python-loader...")
    result = subprocess.run(["python", "./python-loader.py"])
    logging.info(f"Carga finalizada con código: {result.returncode}")

#=================================================#
# main                                            #
#=================================================#

def main():
    logging.info("Iniciando checker...")
    while True:
        if db_disponible():
            carga_precio_dolar()
            nuevos = archivos_nuevos()
            if nuevos:
                logging.info(f"Se encontraron {len(nuevos)} archivos nuevos.")
                ejecutar_loader()
            else:
                logging.info("No hay archivos nuevos por cargar.")
        else:
            logging.info("Esperando que la base de datos esté lista...")

        time.sleep(CHEQUEO_INTERVALO)

if __name__ == "__main__":
    main()
