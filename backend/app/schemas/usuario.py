from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UsuarioBase(BaseModel):
    email: EmailStr
    nombre_usuario: str
    nombre_completo: Optional[str] = None
    telefono: Optional[str] = None
    activo: bool = True
    es_superusuario: bool = False
    sucursal_default_id: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    contrasena: str
    rol_id: Optional[str] = None

class UsuarioUpdate(UsuarioBase):
    contrasena: Optional[str] = None
    rol_id: Optional[str] = None
    email: Optional[EmailStr] = None
    nombre_usuario: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: str
    created_at: datetime
    updated_at: datetime
    rol_id: Optional[str] = None
    permisos: List[str] = []

    class Config:
        from_attributes = True
