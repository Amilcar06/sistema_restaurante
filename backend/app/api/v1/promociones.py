"""
API de Promociones en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.promocion import PromocionCreate, PromocionUpdate, PromocionResponse
from app.core.database import get_db
from app.models.promocion import Promocion
from app.models.sucursal import Sucursal

router = APIRouter()

@router.get("/", response_model=List[PromocionResponse])
async def obtener_promociones(db: Session = Depends(get_db)):
    """Obtener todas las promociones"""
    promociones = db.query(Promocion).order_by(desc(Promocion.created_at)).all()
    return promociones

@router.post("/", response_model=PromocionResponse)
async def crear_promocion(promocion: PromocionCreate, db: Session = Depends(get_db)):
    """Crear una nueva promoción"""
    
    # Validar sucursal
    sucursal = db.query(Sucursal).filter(Sucursal.id == promocion.sucursal_id).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    db_promocion = Promocion(
        id=str(uuid.uuid4()),
        nombre=promocion.nombre,
        descripcion=promocion.descripcion,
        tipo_descuento=promocion.tipo_descuento,
        valor_descuento=promocion.valor_descuento,
        compra_minima=promocion.compra_minima,
        descuento_maximo=promocion.descuento_maximo,
        fecha_inicio=promocion.fecha_inicio,
        fecha_fin=promocion.fecha_fin,
        activa=promocion.activa,
        aplicable_a=promocion.aplicable_a,
        ids_aplicables=promocion.ids_aplicables,
        sucursal_id=promocion.sucursal_id,
        created_at=datetime.utcnow()
    )
    db.add(db_promocion)
    db.commit()
    db.refresh(db_promocion)
    return db_promocion

@router.get("/{promocion_id}", response_model=PromocionResponse)
async def obtener_promocion(promocion_id: str, db: Session = Depends(get_db)):
    """Obtener una promoción específica"""
    promocion = db.query(Promocion).filter(Promocion.id == promocion_id).first()
    if not promocion:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    return promocion

@router.put("/{promocion_id}", response_model=PromocionResponse)
async def actualizar_promocion(
    promocion_id: str,
    promocion_update: PromocionUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una promoción"""
    db_promocion = db.query(Promocion).filter(Promocion.id == promocion_id).first()
    if not db_promocion:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    
    update_data = promocion_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_promocion, field, value)
    
    db.commit()
    db.refresh(db_promocion)
    return db_promocion

@router.delete("/{promocion_id}")
async def eliminar_promocion(promocion_id: str, db: Session = Depends(get_db)):
    """Eliminar una promoción"""
    db_promocion = db.query(Promocion).filter(Promocion.id == promocion_id).first()
    if not db_promocion:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    
    db.delete(db_promocion)
    db.commit()
    return {"message": "Promoción eliminada exitosamente"}
