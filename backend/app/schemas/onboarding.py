from pydantic import BaseModel
from typing import Optional

class OnboardingRestauranteRequest(BaseModel):
    nombre: str
    razon_social: Optional[str] = None
    nit: Optional[str] = None
    moneda: str = "BOB"

class OnboardingSucursalRequest(BaseModel):
    nombre: str
    direccion: str
    ciudad: str = "La Paz"
    telefono: Optional[str] = None
