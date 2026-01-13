import shutil
import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from db import get_db_connection
from manager import ejecutar_procesamiento

# Configurar Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(title="Python Bank Loader Service")

@app.post("/api/cargar-estado")
async def cargar_estado_cuenta(
    file: UploadFile = File(...), 
    banco: str = Form(...), 
    cuenta_id: int = Form(...)
):
    """
    Endpoint recibido por Spring Boot.
    Parametros:
    - file: El archivo físico (multipart)
    - banco: String (ej: "BFC", "MERCANTIL")
    - cuenta_id: ID numérico de la cuenta en DB
    """
    
    # 1. Guardar archivo temporalmente
    temp_filename = f"temp_{file.filename}"
    temp_path = os.path.join("/tmp", temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logging.info(f"Recibido archivo para banco: {banco}, cuenta: {cuenta_id}")

        # 2. Procesar usando la conexión a DB
        with get_db_connection() as conn:
            ejecutar_procesamiento(
                banco_key=banco, 
                ruta_archivo=temp_path, 
                cuenta_id=cuenta_id, 
                nombre_original=file.filename,
                conn=conn
            )

        return {"status": "success", "message": f"Archivo {file.filename} procesado correctamente para {banco}"}

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) # Banco no soportado
    except FileExistsError as fe:
        raise HTTPException(status_code=409, detail=str(fe)) # Archivo duplicado
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    finally:
        # 3. Limpieza: Borrar archivo temporal
        if os.path.exists(temp_path):
            os.remove(temp_path)