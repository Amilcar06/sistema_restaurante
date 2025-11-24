"""
User schemas for request/response validation
"""
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="Email del usuario")
    username: str = Field(..., min_length=3, max_length=50, description="Nombre de usuario (3-50 caracteres)")
    full_name: Optional[str] = Field(None, max_length=200, description="Nombre completo")
    phone: Optional[str] = Field(None, max_length=20, description="Teléfono")
    is_active: bool = Field(True, description="Usuario activo")
    is_superuser: bool = Field(False, description="Usuario administrador")
    default_location_id: Optional[str] = Field(None, description="ID de la sucursal por defecto")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, description="Contraseña (mínimo 6 caracteres)")

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    default_location_id: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

