from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class IngredienteRecetaBase(BaseModel):
    item_inventario_id: Optional[str] = None
    nombre_ingrediente: str
    cantidad: float
    unidad: str
    unidad_id: Optional[str] = None
    costo: float

class IngredienteRecetaCreate(IngredienteRecetaBase):
    pass

class IngredienteRecetaResponse(IngredienteRecetaBase):
    id: str
    receta_id: str

    class Config:
        from_attributes = True

class RecetaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    categoria: str
    subcategoria: Optional[str] = None
    precio: float
    costo: float = 0.0
    margen: float = 0.0
    tiempo_preparacion: Optional[int] = None
    porciones: int = 1
    instrucciones: Optional[str] = None
    disponible: bool = True
    puntaje_popularidad: float = 0.0

class RecetaCreate(RecetaBase):
    sucursal_id: str
    ingredientes: List[IngredienteRecetaCreate]

class RecetaUpdate(RecetaBase):
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    precio: Optional[float] = None
    ingredientes: Optional[List[IngredienteRecetaCreate]] = None

class RecetaResponse(RecetaBase):
    id: str
    sucursal_id: str
    version_actual: int
    created_at: datetime
    updated_at: datetime
    usuario_id: Optional[str]
    ingredientes: List[IngredienteRecetaResponse] = []

    class Config:
        from_attributes = True
