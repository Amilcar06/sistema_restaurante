"""
Inventory Movement schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InventoryMovementBase(BaseModel):
    inventory_item_id: str = Field(..., description="ID del item de inventario")
    location_id: str = Field(..., description="ID de la sucursal")
    movement_type: str = Field(..., description="ENTRADA, SALIDA, AJUSTE, MERMA, CADUCIDAD, ROBO, TRANSFERENCIA")
    quantity: float = Field(..., description="Cantidad del movimiento")
    unit: str = Field(..., description="Unidad de medida")
    cost_per_unit: Optional[float] = Field(None, ge=0, description="Costo por unidad")
    reference_id: Optional[str] = Field(None, description="ID de referencia (venta, compra, etc.)")
    reference_type: Optional[str] = Field(None, description="Tipo de referencia")
    notes: Optional[str] = Field(None, max_length=500, description="Notas adicionales")

class InventoryMovementCreate(InventoryMovementBase):
    pass

class InventoryMovementResponse(InventoryMovementBase):
    id: str
    created_at: datetime
    user_id: Optional[str] = None
    
    class Config:
        from_attributes = True

