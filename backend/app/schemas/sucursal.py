from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SucursalBase(BaseModel):
    nombre: str
    direccion: str
    ciudad: str = "La Paz"
    zona: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    es_principal: bool = False
    horarios_atencion: Optional[Dict[str, Any]] = None

class SucursalCreate(SucursalBase):
    restaurante_id: str

class SucursalUpdate(SucursalBase):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    activa: Optional[bool] = None

class SucursalResponse(SucursalBase):
    id: str
    activa: bool
    restaurante_id: str
    created_at: datetime
    creado_por_id: Optional[str]

    class Config:
        from_attributes = True
