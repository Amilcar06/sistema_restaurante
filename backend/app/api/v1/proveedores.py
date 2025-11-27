"""
API de Proveedores en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.proveedor import ProveedorCreate, ProveedorUpdate, ProveedorResponse
from app.core.database import get_db
from app.models.proveedor import Proveedor

router = APIRouter()

@router.get("/", response_model=List[ProveedorResponse])
async def obtener_proveedores(db: Session = Depends(get_db)):
    """Obtener todos los proveedores"""
    proveedores = db.query(Proveedor).order_by(desc(Proveedor.created_at)).all()
    return proveedores

@router.post("/", response_model=ProveedorResponse)
async def crear_proveedor(proveedor: ProveedorCreate, db: Session = Depends(get_db)):
    """Crear un nuevo proveedor"""
    db_proveedor = Proveedor(
        id=str(uuid.uuid4()),
        nombre=proveedor.nombre,
        nombre_contacto=proveedor.nombre_contacto,
        telefono=proveedor.telefono,
        email=proveedor.email,
        direccion=proveedor.direccion,
        ciudad=proveedor.ciudad,
        zona=proveedor.zona,
        nit=proveedor.nit,
        terminos_pago=proveedor.terminos_pago,
        calificacion=proveedor.calificacion,
        activo=proveedor.activo,
        notas=proveedor.notas,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_proveedor)
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor

@router.get("/{proveedor_id}", response_model=ProveedorResponse)
async def obtener_proveedor(proveedor_id: str, db: Session = Depends(get_db)):
    """Obtener un proveedor específico"""
    proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor

@router.put("/{proveedor_id}", response_model=ProveedorResponse)
async def actualizar_proveedor(
    proveedor_id: str,
    proveedor: ProveedorUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un proveedor"""
    db_proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not db_proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    update_data = proveedor.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_proveedor, field, value)
    
    db_proveedor.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor

@router.delete("/{proveedor_id}")
async def eliminar_proveedor(proveedor_id: str, db: Session = Depends(get_db)):
    """Eliminar un proveedor"""
    db_proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not db_proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    db.delete(db_proveedor)
    db.commit()
    return {"message": "Proveedor eliminado exitosamente"}
