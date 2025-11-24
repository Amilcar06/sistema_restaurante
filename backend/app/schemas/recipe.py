"""
Recipe Pydantic schemas
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re
from app.core.enums import RecipeCategory, RecipeIngredientUnit

class RecipeIngredientBase(BaseModel):
    ingredient_name: str = Field(
        ..., 
        min_length=2, 
        max_length=200,
        description="Nombre del ingrediente (2-200 caracteres)"
    )
    quantity: float = Field(
        ..., 
        gt=0, 
        le=10000,
        description="Cantidad (0.001 - 10,000)"
    )
    unit: RecipeIngredientUnit = Field(
        ...,
        description="Unidad de medida"
    )
    cost: float = Field(
        ..., 
        ge=0, 
        le=9999.99,
        description="Costo (0.00 - 9,999.99)"
    )
    inventory_item_id: Optional[str] = None
    
    @field_validator('ingredient_name')
    @classmethod
    def validate_ingredient_name(cls, v: str) -> str:
        """Validar formato del nombre del ingrediente"""
        v = v.strip()
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]{2,200}$', v):
            raise ValueError("El nombre del ingrediente solo puede contener letras, números, espacios, guiones y acentos")
        # Capitalizar primera letra
        return v[0].upper() + v[1:] if len(v) > 1 else v.upper()
    
    @field_validator('quantity')
    @classmethod
    def validate_quantity_precision(cls, v: float) -> float:
        """Validar precisión de cantidad (3 decimales)"""
        if v <= 0:
            raise ValueError("La cantidad debe ser mayor a 0")
        if round(v, 3) != v:
            raise ValueError("La cantidad debe tener máximo 3 decimales")
        return round(v, 3)
    
    @field_validator('cost')
    @classmethod
    def validate_cost_precision(cls, v: float) -> float:
        """Validar precisión de costo (2 decimales)"""
        if v < 0:
            raise ValueError("El costo no puede ser negativo")
        if round(v, 2) != v:
            raise ValueError("El costo debe tener máximo 2 decimales")
        return round(v, 2)

class RecipeIngredientCreate(RecipeIngredientBase):
    @field_validator('cost')
    @classmethod
    def validate_cost(cls, v, info):
        if v < 0:
            raise ValueError("El costo no puede ser negativo")
        return v

class RecipeIngredientResponse(BaseModel):
    id: str
    recipe_id: str
    ingredient_name: str
    quantity: float
    unit: str  # Use str instead of enum for response to handle existing data
    cost: float
    inventory_item_id: Optional[str] = None
    
    class Config:
        from_attributes = True

class RecipeBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=2, 
        max_length=200,
        description="Nombre de la receta (2-200 caracteres)"
    )
    description: Optional[str] = Field(
        None, 
        max_length=2000,
        description="Descripción (opcional, max 2000 caracteres)"
    )
    category: RecipeCategory = Field(
        ...,
        description="Categoría de la receta"
    )
    price: float = Field(
        ..., 
        gt=0, 
        le=9999.99,
        description="Precio de venta (0.01 - 9,999.99)"
    )
    preparation_time: Optional[int] = Field(
        None, 
        ge=0, 
        le=1440,
        description="Tiempo de preparación en minutos (0-1440, max 24 horas)"
    )
    servings: int = Field(
        default=1, 
        gt=0, 
        le=1000,
        description="Número de porciones (1-1000)"
    )
    instructions: Optional[str] = Field(
        None, 
        max_length=5000,
        description="Instrucciones de preparación (opcional, max 5000 caracteres)"
    )
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validar formato del nombre"""
        v = v.strip()
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]{2,200}$', v):
            raise ValueError("El nombre solo puede contener letras, números, espacios, guiones y acentos")
        if v.isdigit():
            raise ValueError("El nombre no puede ser solo números")
        # Capitalizar primera letra
        return v[0].upper() + v[1:] if len(v) > 1 else v.upper()
    
    @field_validator('price')
    @classmethod
    def validate_price_precision(cls, v: float) -> float:
        """Validar precisión de precio (2 decimales)"""
        if v <= 0:
            raise ValueError("El precio debe ser mayor a 0")
        if round(v, 2) != v:
            raise ValueError("El precio debe tener máximo 2 decimales")
        return round(v, 2)
    
    @field_validator('preparation_time')
    @classmethod
    def validate_preparation_time(cls, v: Optional[int]) -> Optional[int]:
        """Validar tiempo de preparación razonable"""
        if v is not None:
            if v > 120:  # Más de 2 horas
                # Warning pero permitir
                pass
        return v

class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredientCreate] = Field(..., min_length=1)
    
    @field_validator('ingredients')
    @classmethod
    def validate_ingredients(cls, v):
        if not v or len(v) == 0:
            raise ValueError("La receta debe tener al menos un ingrediente")
        return v

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None  # NUEVO
    price: Optional[float] = None
    preparation_time: Optional[int] = None
    servings: Optional[int] = None
    instructions: Optional[str] = None
    location_id: Optional[str] = None  # NUEVO
    is_available: Optional[bool] = None  # NUEVO
    ingredients: Optional[List[RecipeIngredientCreate]] = None

class RecipeResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None  # NUEVO
    price: float
    cost: float
    margin: float
    preparation_time: Optional[int] = None
    servings: int
    instructions: Optional[str] = None
    location_id: Optional[str] = None  # NUEVO
    is_available: Optional[bool] = True  # NUEVO: Opcional para manejar valores NULL
    popularity_score: Optional[float] = 0.0  # NUEVO: Opcional para manejar valores NULL
    current_version: Optional[int] = 1  # NUEVO: Opcional para manejar valores NULL
    created_at: datetime
    updated_at: datetime
    user_id: Optional[str] = None
    ingredients: List[RecipeIngredientResponse] = []
    
    @field_validator('popularity_score', mode='before')
    @classmethod
    def validate_popularity_score(cls, v):
        """Convertir None a 0.0 para popularity_score"""
        return v if v is not None else 0.0
    
    @field_validator('is_available', mode='before')
    @classmethod
    def validate_is_available(cls, v):
        """Convertir None a True para is_available"""
        return v if v is not None else True
    
    @field_validator('current_version', mode='before')
    @classmethod
    def validate_current_version(cls, v):
        """Convertir None a 1 para current_version"""
        return v if v is not None else 1
    
    class Config:
        from_attributes = True

