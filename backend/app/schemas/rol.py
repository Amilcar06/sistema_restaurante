from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PermisoBase(BaseModel):
    nombre: str
    recurso: str
    accion: str
    descripcion: Optional[str] = None

class PermisoResponse(PermisoBase):
    id: str

    class Config:
        from_attributes = True

class RolBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    es_sistema: bool = False

class RolCreate(RolBase):
    permisos: Optional[List[str]] = []

class RolUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    es_sistema: Optional[bool] = None
    permisos: Optional[List[str]] = None

class RolResponse(RolBase):
    id: str
    fecha_creacion: datetime
    permisos: List[PermisoResponse] = []

    class Config:
        from_attributes = True

class UsuarioRolBase(BaseModel):
    usuario_id: str
    rol_id: str
    sucursal_id: Optional[str] = None

class UsuarioRolCreate(UsuarioRolBase):
    pass

class UsuarioRolResponse(UsuarioRolBase):
    id: str
    fecha_asignacion: datetime
    asignado_por_id: Optional[str]

    class Config:
        from_attributes = True
