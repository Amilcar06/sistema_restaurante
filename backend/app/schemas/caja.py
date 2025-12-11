from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CajaSesionBase(BaseModel):
    sucursal_id: str
    monto_inicial: float
    comentarios: Optional[str] = None

class CajaSesionCreate(CajaSesionBase):
    usuario_id: str

class CajaSesionCerrar(BaseModel):
    monto_final: float
    comentarios: Optional[str] = None

class CajaSesionResponse(BaseModel):
    id: str
    sucursal_id: str
    usuario_id: str
    fecha_apertura: datetime
    fecha_cierre: Optional[datetime]
    monto_inicial: float
    monto_final: Optional[float]
    monto_sistema: Optional[float]
    diferencia: Optional[float]
    estado: str
    comentarios: Optional[str]

    class Config:
        from_attributes = True
