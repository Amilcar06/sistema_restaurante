"""
API de Recetas en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.receta import RecetaCreate, RecetaUpdate, RecetaResponse
from app.core.database import get_db
from app.models.receta import Receta, IngredienteReceta
from app.models.sucursal import Sucursal

router = APIRouter()

@router.get("/", response_model=List[RecetaResponse])
def obtener_recetas(db: Session = Depends(get_db)):
    """Obtener todas las recetas"""
    recetas = db.query(Receta).order_by(desc(Receta.created_at)).all()
    return recetas

@router.post("/", response_model=RecetaResponse)
def crear_receta(receta: RecetaCreate, db: Session = Depends(get_db)):
    """Crear una nueva receta"""
    
    # Validar sucursal
    sucursal = db.query(Sucursal).filter(Sucursal.id == receta.sucursal_id).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    db_receta = Receta(
        id=str(uuid.uuid4()),
        nombre=receta.nombre,
        descripcion=receta.descripcion,
        imagen_url=receta.imagen_url,
        categoria=receta.categoria,
        subcategoria=receta.subcategoria,
        precio=receta.precio,
        costo=receta.costo,
        margen=receta.margen,
        tiempo_preparacion=receta.tiempo_preparacion,
        porciones=receta.porciones,
        instrucciones=receta.instrucciones,
        sucursal_id=receta.sucursal_id,
        disponible=receta.disponible,
        puntaje_popularidad=receta.puntaje_popularidad,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_receta)
    db.flush()
    
    # Agregar ingredientes
    for ingrediente in receta.ingredientes:
        db_ingrediente = IngredienteReceta(
            id=str(uuid.uuid4()),
            receta_id=db_receta.id,
            item_inventario_id=ingrediente.item_inventario_id,
            nombre_ingrediente=ingrediente.nombre_ingrediente,
            cantidad=ingrediente.cantidad,
            unidad=ingrediente.unidad,
            unidad_id=ingrediente.unidad_id,
            costo=ingrediente.costo
        )
        db.add(db_ingrediente)
    
    db.commit()
    db.refresh(db_receta)
    return db_receta

@router.get("/{receta_id}", response_model=RecetaResponse)
def obtener_receta(receta_id: str, db: Session = Depends(get_db)):
    """Obtener una receta específica"""
    receta = db.query(Receta).filter(Receta.id == receta_id).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return receta

@router.put("/{receta_id}", response_model=RecetaResponse)
def actualizar_receta(
    receta_id: str,
    receta_update: RecetaUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una receta"""
    db_receta = db.query(Receta).filter(Receta.id == receta_id).first()
    if not db_receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    
    update_data = receta_update.model_dump(exclude_unset=True, exclude={"ingredientes"})
    for field, value in update_data.items():
        setattr(db_receta, field, value)
    
    # Actualizar ingredientes si se proporcionan
    if receta_update.ingredientes is not None:
        # Eliminar ingredientes existentes
        db.query(IngredienteReceta).filter(IngredienteReceta.receta_id == receta_id).delete()
        
        # Agregar nuevos ingredientes
        for ingrediente in receta_update.ingredientes:
            db_ingrediente = IngredienteReceta(
                id=str(uuid.uuid4()),
                receta_id=db_receta.id,
                item_inventario_id=ingrediente.item_inventario_id,
                nombre_ingrediente=ingrediente.nombre_ingrediente,
                cantidad=ingrediente.cantidad,
                unidad=ingrediente.unidad,
                unidad_id=ingrediente.unidad_id,
                costo=ingrediente.costo
            )
            db.add(db_ingrediente)
    
    db_receta.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_receta)
    return db_receta

@router.delete("/{receta_id}")
def eliminar_receta(receta_id: str, db: Session = Depends(get_db)):
    """Eliminar una receta"""
    db_receta = db.query(Receta).filter(Receta.id == receta_id).first()
    if not db_receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    
    db.delete(db_receta)
    db.commit()
    return {"message": "Receta eliminada exitosamente"}
