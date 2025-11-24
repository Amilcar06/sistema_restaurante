"""
Inventory Pydantic schemas
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re
from app.core.enums import InventoryCategory, InventoryUnit

class InventoryItemBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=2, 
        max_length=200,
        description="Nombre del item (2-200 caracteres)"
    )
    category: InventoryCategory = Field(
        ...,
        description="Categoría del item"
    )
    quantity: float = Field(
        ..., 
        ge=0, 
        le=999999.99,
        description="Cantidad disponible (0 - 999,999.99)"
    )
    unit: InventoryUnit = Field(
        ...,
        description="Unidad de medida"
    )
    min_stock: float = Field(
        ..., 
        ge=0, 
        le=999999.99,
        description="Stock mínimo (0 - 999,999.99)"
    )
    cost_per_unit: float = Field(
        ..., 
        gt=0, 
        le=99999.99,
        description="Costo por unidad (0.01 - 99,999.99)"
    )
    supplier: Optional[str] = Field(
        None, 
        max_length=200,
        description="Proveedor (opcional, max 200 caracteres)"
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
    
    @field_validator('supplier')
    @classmethod
    def validate_supplier(cls, v: Optional[str]) -> Optional[str]:
        """Validar formato del proveedor"""
        if v:
            v = v.strip()
            if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\-]{0,200}$', v):
                raise ValueError("El proveedor solo puede contener letras, números, espacios, puntos, guiones y acentos")
            # Capitalizar primera letra
            return v[0].upper() + v[1:] if len(v) > 1 else v.upper()
        return v
    
    @field_validator('quantity', 'min_stock')
    @classmethod
    def validate_quantity_precision(cls, v: float) -> float:
        """Validar precisión de decimales (2 decimales)"""
        if round(v, 2) != v:
            raise ValueError("La cantidad debe tener máximo 2 decimales")
        return round(v, 2)
    
    @field_validator('cost_per_unit')
    @classmethod
    def validate_cost_precision(cls, v: float) -> float:
        """Validar precisión de costo (2 decimales)"""
        if v <= 0:
            raise ValueError("El costo por unidad debe ser mayor a 0")
        if round(v, 2) != v:
            raise ValueError("El costo debe tener máximo 2 decimales")
        return round(v, 2)

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    unit_id: Optional[str] = None  # NUEVO
    min_stock: Optional[float] = None
    max_stock: Optional[float] = None  # NUEVO
    cost_per_unit: Optional[float] = None
    supplier_id: Optional[str] = None  # NUEVO
    supplier: Optional[str] = None  # Mantener para compatibilidad
    location_id: Optional[str] = None  # NUEVO
    expiry_date: Optional[datetime] = None  # NUEVO
    barcode: Optional[str] = None  # NUEVO

class InventoryItemResponse(BaseModel):
    id: str
    name: str
    category: str
    quantity: float
    unit: str
    unit_id: Optional[str] = None  # NUEVO
    min_stock: float
    max_stock: Optional[float] = None  # NUEVO
    cost_per_unit: float
    supplier_id: Optional[str] = None  # NUEVO
    supplier: Optional[str] = None  # Mantener para compatibilidad
    location_id: str  # NUEVO
    expiry_date: Optional[datetime] = None  # NUEVO
    barcode: Optional[str] = None  # NUEVO
    popularity_score: Optional[float] = 0.0  # NUEVO: Opcional para manejar valores NULL
    seasonal_factor: Optional[dict] = None  # NUEVO
    demand_forecast: Optional[float] = None  # NUEVO
    last_updated: datetime
    user_id: Optional[str] = None
    
    @field_validator('popularity_score', mode='before')
    @classmethod
    def validate_popularity_score(cls, v):
        """Convertir None a 0.0 para popularity_score"""
        return v if v is not None else 0.0
    
    class Config:
        from_attributes = True

