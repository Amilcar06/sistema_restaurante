from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ItemVentaBase(BaseModel):
    receta_id: Optional[str] = None
    nombre_item: str
    cantidad: int = 1
    precio_unitario: float
    total: float

class ItemVentaCreate(ItemVentaBase):
    pass

class ItemVentaResponse(ItemVentaBase):
    id: str
    venta_id: str

    class Config:
        from_attributes = True

class VentaBase(BaseModel):
    numero_mesa: Optional[str] = None
    mesero_id: Optional[str] = None
    tipo_venta: str = "LOCAL"
    servicio_delivery: Optional[str] = None
    nombre_cliente: Optional[str] = None
    telefono_cliente: Optional[str] = None
    subtotal: float
    monto_descuento: float = 0.0
    impuesto: float = 0.0
    total: float
    metodo_pago: Optional[str] = None
    notas: Optional[str] = None
    estado: str = "COMPLETADA"

class VentaCreate(VentaBase):
    sucursal_id: str
    items: List[ItemVentaCreate]

class VentaUpdate(VentaBase):
    estado: Optional[str] = None

class VentaResponse(VentaBase):
    id: str
    numero_venta: Optional[str]
    sucursal_id: str
    fecha_creacion: datetime
    usuario_id: Optional[str]
    items: List[ItemVentaResponse] = []

    class Config:
        from_attributes = True
