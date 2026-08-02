import shutil
import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from db import get_db_connection
from manager import ejecutar_procesamiento
from schema.schemas import RegistroBot
from service.bot_service import procesar_y_guardar_registro

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
app = FastAPI(title="Python Bank Loader Service")

@app.post("/api/cargar-estado")
async def cargar_estado_cuenta(
    file: UploadFile = File(...), 
    banco: str = Form(...), 
    cuenta_id: int = Form(...)
):
    temp_filename = f"temp_{file.filename}"
    temp_path = os.path.join("/tmp", temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logging.info(f"Recibido archivo para banco: {banco}, cuenta: {cuenta_id}")

        with get_db_connection() as conn:
            ejecutar_procesamiento(banco, temp_path, cuenta_id, file.filename, conn)
            conn.commit()

        return {"status": "success", "message": f"Archivo {file.filename} procesado correctamente"}

    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/bot-recibo")
async def guardar_recibo_bot(registro: RegistroBot):
    try:
        with get_db_connection() as conn:
            procesar_y_guardar_registro(registro, conn)
            conn.commit()
            
        return {"status": "success", "message": "Registro guardado exitosamente"}
    except Exception as e:
        logging.error(f"Error procesando registro del bot: {e}")
        raise HTTPException(status_code=500, detail="Error interno procesando el registro")