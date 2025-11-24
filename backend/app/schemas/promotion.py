"""
Promotion schemas for request/response validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime

class PromotionBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, description="Nombre de la promoción")
    description: Optional[str] = Field(None, max_length=1000, description="Descripción")
    discount_type: str = Field(..., description="Tipo: percentage, fixed_amount, buy_x_get_y")
    discount_value: float = Field(..., gt=0, description="Valor del descuento")
    min_purchase: Optional[float] = Field(None, ge=0, description="Compra mínima requerida")
    max_discount: Optional[float] = Field(None, ge=0, description="Descuento máximo")
    start_date: datetime = Field(..., description="Fecha de inicio")
    end_date: datetime = Field(..., description="Fecha de fin")
    is_active: bool = Field(True, description="Promoción activa")
    applicable_to: Optional[str] = Field(None, description="all, recipes, categories, specific_items")
    applicable_ids: Optional[List[str]] = Field(None, description="IDs de recetas/categorías")
    location_id: Optional[str] = Field(None, description="ID de la sucursal")
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v, info):
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio")
        return v

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    discount_type: Optional[str] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_purchase: Optional[float] = Field(None, ge=0)
    max_discount: Optional[float] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    applicable_to: Optional[str] = None
    applicable_ids: Optional[List[str]] = None
    location_id: Optional[str] = None

class PromotionResponse(PromotionBase):
    id: str
    created_at: datetime
    user_id: Optional[str] = None
    
    class Config:
        from_attributes = True

