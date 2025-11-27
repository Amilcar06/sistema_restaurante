from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProveedorBase(BaseModel):
    nombre: str
    nombre_contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    zona: Optional[str] = None
    nit: Optional[str] = None
    terminos_pago: Optional[str] = None
    calificacion: Optional[float] = None
    activo: bool = True
    notas: Optional[str] = None

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(ProveedorBase):
    nombre: Optional[str] = None

class ProveedorResponse(ProveedorBase):
    id: str
    created_at: datetime
    updated_at: datetime
    usuario_id: Optional[str]

    class Config:
        from_attributes = True
