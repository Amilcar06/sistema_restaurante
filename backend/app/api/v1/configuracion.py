from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from app.core.database import get_db
from app.models.configuracion import Configuracion
from app.schemas.configuracion import ConfiguracionCreate, ConfiguracionUpdate, ConfiguracionResponse
import uuid

router = APIRouter()

@router.get("/", response_model=ConfiguracionResponse)
def obtener_configuracion(db: Session = Depends(get_db)) -> Any:
    """
    Obtener la configuración del sistema. Si no existe, crea una por defecto.
    """
    config = db.query(Configuracion).first()
    if not config:
        config = Configuracion(id=str(uuid.uuid4()))
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/", response_model=ConfiguracionResponse)
def actualizar_configuracion(
    config_in: ConfiguracionUpdate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Actualizar la configuración del sistema.
    """
    config = db.query(Configuracion).first()
    if not config:
        config = Configuracion(id=str(uuid.uuid4()))
        db.add(config)
        db.commit()
    
    update_data = config_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    db.add(config)
    db.commit()
    db.refresh(config)
    return config
