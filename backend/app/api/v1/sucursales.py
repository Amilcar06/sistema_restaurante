"""
API de Sucursales en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.sucursal import SucursalCreate, SucursalUpdate, SucursalResponse
from app.core.database import get_db
from app.models.sucursal import Sucursal

router = APIRouter()

@router.get("/", response_model=List[SucursalResponse])
async def obtener_sucursales(db: Session = Depends(get_db)):
    """Obtener todas las sucursales"""
    sucursales = db.query(Sucursal).order_by(desc(Sucursal.created_at)).all()
    return sucursales

@router.post("/", response_model=SucursalResponse)
async def crear_sucursal(sucursal: SucursalCreate, db: Session = Depends(get_db)):
    """Crear una nueva sucursal"""
    db_sucursal = Sucursal(
        id=str(uuid.uuid4()),
        nombre=sucursal.nombre,
        direccion=sucursal.direccion,
        ciudad=sucursal.ciudad,
        zona=sucursal.zona,
        telefono=sucursal.telefono,
        email=sucursal.email,
        es_principal=sucursal.es_principal,
        activa=sucursal.activa,
        horarios_atencion=sucursal.horarios_atencion,
        restaurante_id=sucursal.restaurante_id,
        created_at=datetime.utcnow()
    )
    db.add(db_sucursal)
    db.commit()
    db.refresh(db_sucursal)
    return db_sucursal

@router.get("/{sucursal_id}", response_model=SucursalResponse)
async def obtener_sucursal(sucursal_id: str, db: Session = Depends(get_db)):
    """Obtener una sucursal específica"""
    sucursal = db.query(Sucursal).filter(Sucursal.id == sucursal_id).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    return sucursal

@router.put("/{sucursal_id}", response_model=SucursalResponse)
async def actualizar_sucursal(
    sucursal_id: str,
    sucursal: SucursalUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una sucursal"""
    db_sucursal = db.query(Sucursal).filter(Sucursal.id == sucursal_id).first()
    if not db_sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    update_data = sucursal.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_sucursal, field, value)
    
    db.commit()
    db.refresh(db_sucursal)
    return db_sucursal

@router.delete("/{sucursal_id}")
async def eliminar_sucursal(sucursal_id: str, db: Session = Depends(get_db)):
    """Eliminar una sucursal"""
    db_sucursal = db.query(Sucursal).filter(Sucursal.id == sucursal_id).first()
    if not db_sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    db.delete(db_sucursal)
    db.commit()
    return {"message": "Sucursal eliminada exitosamente"}
