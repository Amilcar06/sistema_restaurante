"""
API de Ordenes de Compra en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.orden_compra import OrdenCompraCreate, OrdenCompraUpdate, OrdenCompraResponse
from app.core.database import get_db
from app.models.orden_compra import OrdenCompra, ItemOrdenCompra
from app.models.sucursal import Sucursal
from app.models.item_inventario import ItemInventario
from app.models.movimiento_inventario import MovimientoInventario

router = APIRouter()

@router.get("/", response_model=List[OrdenCompraResponse])
async def obtener_ordenes_compra(db: Session = Depends(get_db)):
    """Obtener todas las ordenes de compra"""
    ordenes = db.query(OrdenCompra).order_by(desc(OrdenCompra.fecha_creacion)).all()
    return ordenes

@router.post("/", response_model=OrdenCompraResponse)
async def crear_orden_compra(orden: OrdenCompraCreate, db: Session = Depends(get_db)):
    """Crear una nueva orden de compra"""
    
    # Validar sucursal
    sucursal = db.query(Sucursal).filter(Sucursal.id == orden.sucursal_id).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    db_orden = OrdenCompra(
        id=str(uuid.uuid4()),
        numero_orden=orden.numero_orden,
        proveedor_id=orden.proveedor_id,
        sucursal_id=orden.sucursal_id,
        estado=orden.estado,
        monto_total=orden.monto_total,
        fecha_entrega_esperada=orden.fecha_entrega_esperada,
        notas=orden.notas,
        fecha_creacion=datetime.utcnow()
    )
    db.add(db_orden)
    db.flush()
    
    # Agregar items
    for item in orden.items:
        db_item = ItemOrdenCompra(
            id=str(uuid.uuid4()),
            orden_compra_id=db_orden.id,
            item_inventario_id=item.item_inventario_id,
            nombre_item=item.nombre_item,
            cantidad=item.cantidad,
            unidad=item.unidad,
            precio_unitario=item.precio_unitario,
            total=item.total
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_orden)
    return db_orden

@router.get("/{orden_id}", response_model=OrdenCompraResponse)
async def obtener_orden_compra(orden_id: str, db: Session = Depends(get_db)):
    """Obtener una orden de compra específica"""
    orden = db.query(OrdenCompra).filter(OrdenCompra.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")
    return orden

@router.put("/{orden_id}", response_model=OrdenCompraResponse)
async def actualizar_orden_compra(
    orden_id: str,
    orden_update: OrdenCompraUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una orden de compra (estado, recepción)"""
    db_orden = db.query(OrdenCompra).filter(OrdenCompra.id == orden_id).first()
    if not db_orden:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")
    
    # Si se marca como RECIBIDA, actualizar inventario
    if orden_update.estado == "RECIBIDA" and db_orden.estado != "RECIBIDA":
        db_orden.fecha_recepcion = datetime.utcnow()
        
        for item_orden in db_orden.items:
            if item_orden.item_inventario_id:
                # Crear movimiento de entrada
                movimiento = MovimientoInventario(
                    id=str(uuid.uuid4()),
                    item_inventario_id=item_orden.item_inventario_id,
                    sucursal_id=db_orden.sucursal_id,
                    tipo_movimiento="COMPRA",
                    cantidad=item_orden.cantidad,
                    unidad=item_orden.unidad,
                    costo_unitario=item_orden.precio_unitario,
                    referencia_id=db_orden.id,
                    tipo_referencia="orden_compra",
                    fecha_creacion=datetime.utcnow()
                )
                db.add(movimiento)
                
                # Actualizar stock del item
                item_inv = db.query(ItemInventario).filter(ItemInventario.id == item_orden.item_inventario_id).first()
                if item_inv:
                    item_inv.cantidad += item_orden.cantidad
                    item_inv.costo_unitario = item_orden.precio_unitario # Actualizar costo
                    item_inv.ultima_actualizacion = datetime.utcnow()
                
                item_orden.cantidad_recibida = item_orden.cantidad # Asumimos recepción completa por ahora

    if orden_update.estado:
        db_orden.estado = orden_update.estado
    
    if orden_update.notas:
        db_orden.notas = orden_update.notas

    db.commit()
    db.refresh(db_orden)
    return db_orden
