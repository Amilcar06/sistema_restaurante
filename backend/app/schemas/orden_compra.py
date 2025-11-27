from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ItemOrdenCompraBase(BaseModel):
    item_inventario_id: Optional[str] = None
    nombre_item: str
    cantidad: float
    unidad: str
    precio_unitario: float
    total: float

class ItemOrdenCompraCreate(ItemOrdenCompraBase):
    pass

class ItemOrdenCompraResponse(ItemOrdenCompraBase):
    id: str
    orden_compra_id: str
    cantidad_recibida: float

    class Config:
        from_attributes = True

class OrdenCompraBase(BaseModel):
    numero_orden: str
    proveedor_id: str
    estado: str = "PENDIENTE"
    monto_total: float
    fecha_entrega_esperada: Optional[datetime] = None
    notas: Optional[str] = None

class OrdenCompraCreate(OrdenCompraBase):
    sucursal_id: str
    items: List[ItemOrdenCompraCreate]

class OrdenCompraUpdate(OrdenCompraBase):
    estado: Optional[str] = None
    fecha_recepcion: Optional[datetime] = None

class OrdenCompraResponse(OrdenCompraBase):
    id: str
    sucursal_id: str
    fecha_creacion: datetime
    creado_por_id: Optional[str]
    aprobado_por_id: Optional[str]
    items: List[ItemOrdenCompraResponse] = []

    class Config:
        from_attributes = True
