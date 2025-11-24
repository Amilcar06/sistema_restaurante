"""
Sales Pydantic schemas
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re
from app.core.enums import PaymentMethod

class SaleItemBase(BaseModel):
    recipe_id: Optional[str] = None
    item_name: str = Field(
        ..., 
        min_length=2, 
        max_length=200,
        description="Nombre del item (2-200 caracteres)"
    )
    quantity: int = Field(
        ..., 
        gt=0, 
        le=1000,
        description="Cantidad (1-1000)"
    )
    unit_price: float = Field(
        ..., 
        gt=0, 
        le=9999.99,
        description="Precio unitario (0.01 - 9,999.99)"
    )
    total: float = Field(
        ..., 
        gt=0, 
        le=999999.99,
        description="Total del item (0.01 - 999,999.99)"
    )
    
    @field_validator('item_name')
    @classmethod
    def validate_item_name(cls, v: str) -> str:
        """Validar formato del nombre del item"""
        v = v.strip()
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]{2,200}$', v):
            raise ValueError("El nombre del item solo puede contener letras, números, espacios, guiones y acentos")
        # Capitalizar primera letra
        return v[0].upper() + v[1:] if len(v) > 1 else v.upper()
    
    @field_validator('unit_price', 'total')
    @classmethod
    def validate_price_precision(cls, v: float) -> float:
        """Validar precisión de precios (2 decimales)"""
        if v <= 0:
            raise ValueError("El precio debe ser mayor a 0")
        if round(v, 2) != v:
            raise ValueError("El precio debe tener máximo 2 decimales")
        return round(v, 2)

class SaleItemCreate(SaleItemBase):
    @field_validator('total')
    @classmethod
    def validate_total(cls, v, info):
        if 'quantity' in info.data and 'unit_price' in info.data:
            expected = info.data['quantity'] * info.data['unit_price']
            if abs(v - expected) > 0.01:  # Allow small floating point differences
                raise ValueError(f"Total debe ser igual a cantidad × precio unitario ({expected:.2f})")
        return v

class SaleItemResponse(BaseModel):
    id: str
    sale_id: str
    recipe_id: Optional[str] = None
    item_name: str
    quantity: int
    unit_price: float
    total: float
    
    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    location_id: str = Field(..., description="ID de la sucursal")  # NUEVO: Requerido
    table_number: Optional[str] = Field(None, description="Número de mesa")  # NUEVO
    waiter_id: Optional[str] = Field(None, description="ID del mesero")  # NUEVO
    sale_type: str = Field(default="LOCAL", description="Tipo de venta: LOCAL, DELIVERY, TAKEAWAY")  # NUEVO
    delivery_service: Optional[str] = Field(None, description="Servicio de delivery")  # NUEVO
    customer_name: Optional[str] = Field(None, description="Nombre del cliente")  # NUEVO
    customer_phone: Optional[str] = Field(None, description="Teléfono del cliente")  # NUEVO
    subtotal: float = Field(
        ..., 
        ge=0, 
        le=999999.99,
        description="Subtotal (0.00 - 999,999.99)"
    )
    discount_amount: float = Field(default=0.0, ge=0, description="Descuento total")  # NUEVO
    tax: float = Field(
        default=0.0, 
        ge=0, 
        le=999999.99,
        description="Impuesto/IVA (0.00 - 999,999.99)"
    )
    total: float = Field(
        ..., 
        gt=0, 
        le=999999.99,
        description="Total (0.01 - 999,999.99)"
    )
    payment_method: PaymentMethod = Field(
        ...,
        description="Método de pago: EFECTIVO, QR o TARJETA"
    )
    notes: Optional[str] = Field(
        None, 
        max_length=500,
        description="Notas adicionales (opcional, max 500 caracteres)"
    )
    
    @field_validator('subtotal', 'tax', 'total')
    @classmethod
    def validate_amount_precision(cls, v: float) -> float:
        """Validar precisión de montos (2 decimales)"""
        if v < 0:
            raise ValueError("Los montos no pueden ser negativos")
        if round(v, 2) != v:
            raise ValueError("Los montos deben tener máximo 2 decimales")
        return round(v, 2)
    
    @field_validator('notes')
    @classmethod
    def validate_notes(cls, v: Optional[str]) -> Optional[str]:
        """Validar y sanitizar notas"""
        if v:
            v = v.strip()
            if len(v) > 500:
                raise ValueError("Las notas no pueden exceder 500 caracteres")
        return v
    
    @field_validator('total')
    @classmethod
    def validate_total(cls, v, info):
        if 'subtotal' in info.data and 'tax' in info.data and 'discount_amount' in info.data:
            expected = info.data['subtotal'] - info.data.get('discount_amount', 0.0) + info.data['tax']
            if abs(v - expected) > 0.01:
                raise ValueError(f"Total debe ser igual a subtotal - descuento + impuesto ({expected:.2f})")
        return v

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class SaleResponse(BaseModel):
    id: str
    sale_number: Optional[str] = None  # NUEVO
    location_id: str  # NUEVO
    table_number: Optional[str] = None  # NUEVO
    waiter_id: Optional[str] = None  # NUEVO
    sale_type: str = "LOCAL"  # NUEVO
    delivery_service: Optional[str] = None  # NUEVO
    customer_name: Optional[str] = None  # NUEVO
    customer_phone: Optional[str] = None  # NUEVO
    subtotal: float
    discount_amount: float = 0.0  # NUEVO
    tax: float
    total: float
    payment_method: str
    notes: Optional[str] = None
    status: str = "COMPLETED"  # NUEVO
    created_at: datetime
    user_id: Optional[str] = None
    items: List[SaleItemResponse] = []
    discounts: List[dict] = []  # NUEVO: Lista de descuentos aplicados
    
    class Config:
        from_attributes = True

