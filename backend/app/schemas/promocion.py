from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class PromocionBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tipo_descuento: str
    valor_descuento: float
    compra_minima: Optional[float] = None
    descuento_maximo: Optional[float] = None
    fecha_inicio: datetime
    fecha_fin: datetime
    activa: bool = True
    aplicable_a: Optional[str] = None
    ids_aplicables: Optional[List[str]] = None

class PromocionCreate(PromocionBase):
    sucursal_id: str

class PromocionUpdate(PromocionBase):
    nombre: Optional[str] = None
    activa: Optional[bool] = None

class PromocionResponse(PromocionBase):
    id: str
    sucursal_id: str
    created_at: datetime
    usuario_id: Optional[str]

    class Config:
        from_attributes = True
