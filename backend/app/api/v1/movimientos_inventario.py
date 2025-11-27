"""
API de Movimientos de Inventario en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.movimiento_inventario import MovimientoInventarioCreate, MovimientoInventarioResponse
from app.core.database import get_db
from app.models.movimiento_inventario import MovimientoInventario
from app.models.sucursal import Sucursal
from app.models.item_inventario import ItemInventario

router = APIRouter()

@router.get("/", response_model=List[MovimientoInventarioResponse])
async def obtener_movimientos(db: Session = Depends(get_db)):
    """Obtener todos los movimientos de inventario"""
    movimientos = db.query(MovimientoInventario).order_by(desc(MovimientoInventario.fecha_creacion)).all()
    return movimientos

@router.post("/", response_model=MovimientoInventarioResponse)
async def crear_movimiento(movimiento: MovimientoInventarioCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo movimiento de inventario"""
    
    # Validar sucursal
    sucursal = db.query(Sucursal).filter(Sucursal.id == movimiento.sucursal_id).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    # Validar item
    item = db.query(ItemInventario).filter(ItemInventario.id == movimiento.item_inventario_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item de inventario no encontrado")
    
    db_movimiento = MovimientoInventario(
        id=str(uuid.uuid4()),
        item_inventario_id=movimiento.item_inventario_id,
        sucursal_id=movimiento.sucursal_id,
        tipo_movimiento=movimiento.tipo_movimiento,
        cantidad=movimiento.cantidad,
        unidad=movimiento.unidad,
        costo_unitario=movimiento.costo_unitario,
        referencia_id=movimiento.referencia_id,
        tipo_referencia=movimiento.tipo_referencia,
        notas=movimiento.notas,
        fecha_creacion=datetime.utcnow()
    )
    db.add(db_movimiento)
    
    # Actualizar stock del item
    if movimiento.tipo_movimiento in ["ENTRADA", "COMPRA", "DEVOLUCION"]:
        item.cantidad += movimiento.cantidad
    elif movimiento.tipo_movimiento in ["SALIDA", "VENTA", "MERMA", "ROBO", "CADUCIDAD"]:
        item.cantidad -= movimiento.cantidad
    elif movimiento.tipo_movimiento == "AJUSTE":
        # Ajuste absoluto o relativo? Asumiremos relativo por simplicidad, o absoluto si se define así.
        # Por ahora lo tratamos como ajuste de stock (diferencia)
        # Si fuera absoluto, necesitaríamos saber el stock anterior.
        # Asumiremos que 'cantidad' es la diferencia a sumar/restar.
        item.cantidad += movimiento.cantidad
        
    item.ultima_actualizacion = datetime.utcnow()
    
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento
