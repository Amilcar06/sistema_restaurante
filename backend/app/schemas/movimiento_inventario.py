from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MovimientoInventarioBase(BaseModel):
    item_inventario_id: str
    tipo_movimiento: str
    cantidad: float
    unidad: str
    costo_unitario: Optional[float] = None
    referencia_id: Optional[str] = None
    tipo_referencia: Optional[str] = None
    notas: Optional[str] = None

class MovimientoInventarioCreate(MovimientoInventarioBase):
    sucursal_id: str

class MovimientoInventarioResponse(MovimientoInventarioBase):
    id: str
    sucursal_id: str
    fecha_creacion: datetime
    usuario_id: Optional[str]

    class Config:
        from_attributes = True
