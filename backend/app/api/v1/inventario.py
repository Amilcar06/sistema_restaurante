"""
API de Inventario en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.item_inventario import ItemInventarioCreate, ItemInventarioUpdate, ItemInventarioResponse
from app.core.database import get_db
from app.models.item_inventario import ItemInventario
from app.models.sucursal import Sucursal
from app.models.historial_costo_inventario import HistorialCostoInventario

router = APIRouter()

@router.get("/", response_model=List[ItemInventarioResponse])
async def obtener_items_inventario(db: Session = Depends(get_db)):
    """Obtener todos los items de inventario"""
    items = db.query(ItemInventario).order_by(desc(ItemInventario.ultima_actualizacion)).all()
    return items

@router.post("/", response_model=ItemInventarioResponse)
async def crear_item_inventario(item: ItemInventarioCreate, db: Session = Depends(get_db)):
    """Crear un nuevo item de inventario"""
    
    # Validar que la sucursal existe
    sucursal = db.query(Sucursal).filter(Sucursal.id == item.sucursal_id).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    db_item = ItemInventario(
        id=str(uuid.uuid4()),
        nombre=item.nombre,
        categoria=item.categoria,
        cantidad=item.cantidad,
        unidad=item.unidad,
        unidad_id=item.unidad_id,
        stock_minimo=item.stock_minimo,
        stock_maximo=item.stock_maximo,
        costo_unitario=item.costo_unitario,
        proveedor_id=item.proveedor_id,
        sucursal_id=item.sucursal_id,
        fecha_vencimiento=item.fecha_vencimiento,
        codigo_barras=item.codigo_barras,
        ultima_actualizacion=datetime.utcnow(),
        puntaje_popularidad=item.puntaje_popularidad,
        factor_estacional=item.factor_estacional,
        pronostico_demanda=item.pronostico_demanda
    )
    db.add(db_item)
    db.flush()  # Obtener ID
    
    # Crear historial de costos
    if db_item.costo_unitario > 0:
        historial = HistorialCostoInventario(
            id=str(uuid.uuid4()),
            item_inventario_id=db_item.id,
            costo_unitario=db_item.costo_unitario,
            proveedor_id=db_item.proveedor_id,
            fecha=datetime.utcnow(),
            razon="creación"
        )
        db.add(historial)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{item_id}", response_model=ItemInventarioResponse)
async def obtener_item_inventario(item_id: str, db: Session = Depends(get_db)):
    """Obtener un item de inventario específico"""
    item = db.query(ItemInventario).filter(ItemInventario.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item de inventario no encontrado")
    return item

@router.put("/{item_id}", response_model=ItemInventarioResponse)
async def actualizar_item_inventario(
    item_id: str, 
    item: ItemInventarioUpdate, 
    db: Session = Depends(get_db)
):
    """Actualizar un item de inventario"""
    db_item = db.query(ItemInventario).filter(ItemInventario.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item de inventario no encontrado")
    
    # Actualizar campos
    update_data = item.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db_item.ultima_actualizacion = datetime.utcnow()
    
    # Si cambió el costo, registrar en historial
    # (Lógica simplificada, idealmente verificar si realmente cambió)
    if "costo_unitario" in update_data:
         historial = HistorialCostoInventario(
            id=str(uuid.uuid4()),
            item_inventario_id=db_item.id,
            costo_unitario=db_item.costo_unitario,
            proveedor_id=db_item.proveedor_id,
            fecha=datetime.utcnow(),
            razon="actualización"
        )
         db.add(historial)

    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def eliminar_item_inventario(item_id: str, db: Session = Depends(get_db)):
    """Eliminar un item de inventario"""
    db_item = db.query(ItemInventario).filter(ItemInventario.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item de inventario no encontrado")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item de inventario eliminado exitosamente"}
