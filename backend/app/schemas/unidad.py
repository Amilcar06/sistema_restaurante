from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UnidadBase(BaseModel):
    codigo: str
    nombre: str
    tipo: str
    unidad_base_id: Optional[str] = None
    factor_conversion: float = 1.0
    activa: bool = True

class UnidadCreate(UnidadBase):
    pass

class UnidadUpdate(UnidadBase):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    tipo: Optional[str] = None

class UnidadResponse(UnidadBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
