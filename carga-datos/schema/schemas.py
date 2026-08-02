from pydantic import BaseModel
from datetime import date
from typing import Optional

class RegistroBot(BaseModel):
    tipo: str
    monto: float
    referencia: Optional[str] = None
    fecha: date
    banco_origen: Optional[str] = None
    banco_o_comercio: Optional[str] = None
    beneficiario: Optional[str] = None
    telefono: Optional[str] = None
    identificacion: Optional[str] = None
    concepto: Optional[str] = None