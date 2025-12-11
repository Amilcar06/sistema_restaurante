from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ItemInventarioBase(BaseModel):
    nombre: str
    categoria: str
    cantidad: float = 0.0
    unidad: str
    unidad_id: Optional[str] = None
    stock_minimo: float
    stock_maximo: Optional[float] = None
    costo_unitario: float
    proveedor_id: Optional[str] = None
    fecha_vencimiento: Optional[datetime] = None
    codigo_barras: Optional[str] = None
    puntaje_popularidad: float = 0.0
    factor_estacional: Optional[Dict[str, float]] = None
    pronostico_demanda: Optional[float] = None

class ItemInventarioCreate(ItemInventarioBase):
    sucursal_id: str

class ItemInventarioUpdate(ItemInventarioBase):
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    stock_minimo: Optional[float] = None
    costo_unitario: Optional[float] = None

class ItemInventarioResponse(ItemInventarioBase):
    id: str
    sucursal_id: str
    ultima_actualizacion: datetime
    usuario_id: Optional[str]

    class Config:
        from_attributes = True
