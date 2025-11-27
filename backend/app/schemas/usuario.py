from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    email: EmailStr
    nombre_usuario: str
    nombre_completo: Optional[str] = None
    telefono: Optional[str] = None
    activo: bool = True
    es_superusuario: bool = False

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(UsuarioBase):
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    nombre_usuario: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: str
    sucursal_default_id: Optional[str]
    created_at: datetime
    ultimo_acceso: Optional[datetime]

    class Config:
        from_attributes = True
