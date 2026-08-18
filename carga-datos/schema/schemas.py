from pydantic import BaseModel
from datetime import date
from typing import Optional

class RegistroBot(BaseModel):
    tipo: str
    monto: float
    es_ingreso: bool = False
    referencia: Optional[str] = None
    fecha: date
    banco_origen: Optional[str] = None
    banco_destino: Optional[str] = None
    beneficiario: Optional[str] = None
    telefono: Optional[str] = None
    identificacion: Optional[str] = None
    concepto: Optional[str] = None