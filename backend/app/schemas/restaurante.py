from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RestauranteBase(BaseModel):
    nombre: str
    razon_social: Optional[str] = None
    nit: Optional[str] = None
    logo_url: Optional[str] = None
    moneda: str = "BOB"

class RestauranteCreate(RestauranteBase):
    pass

class RestauranteUpdate(RestauranteBase):
    nombre: Optional[str] = None
    moneda: Optional[str] = None

class RestauranteResponse(RestauranteBase):
    id: str
    propietario_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
