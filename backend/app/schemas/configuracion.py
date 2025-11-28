from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ConfiguracionBase(BaseModel):
    moneda: str = "BOB"
    impuesto_porcentaje: float = 13.0
    logo_url: Optional[str] = None
    nombre_empresa: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email_contacto: Optional[str] = None
    
    notif_stock_critico: bool = True
    notif_reporte_diario: bool = True
    notif_sugerencias_ia: bool = True
    notif_margen_bajo: bool = False

class ConfiguracionCreate(ConfiguracionBase):
    pass

class ConfiguracionUpdate(ConfiguracionBase):
    pass

class ConfiguracionResponse(ConfiguracionBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True
