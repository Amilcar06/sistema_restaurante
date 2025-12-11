"""
API de Ventas en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.venta import VentaCreate, VentaUpdate, VentaResponse
from app.core.database import get_db
from app.models.venta import Venta, ItemVenta
from app.models.sucursal import Sucursal
from app.models.sucursal import Sucursal
from app.models.receta import Receta, IngredienteReceta
from app.models.item_inventario import ItemInventario

router = APIRouter()

@router.get("/", response_model=List[VentaResponse])
async def obtener_ventas(db: Session = Depends(get_db)):
    """Obtener todas las ventas"""
    ventas = db.query(Venta).order_by(desc(Venta.fecha_creacion)).all()
    return ventas

@router.post("/", response_model=VentaResponse)
async def crear_venta(venta: VentaCreate, db: Session = Depends(get_db)):
    """Crear una nueva venta"""
    
    # Validar sucursal
    sucursal = db.query(Sucursal).filter(Sucursal.id == venta.sucursal_id).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    # Generar número de venta (simple por ahora)
    numero_venta = f"V-{int(datetime.utcnow().timestamp())}"
    
    db_venta = Venta(
        id=str(uuid.uuid4()),
        numero_venta=numero_venta,
        sucursal_id=venta.sucursal_id,
        numero_mesa=venta.numero_mesa,
        mesero_id=venta.mesero_id,
        tipo_venta=venta.tipo_venta,
        servicio_delivery=venta.servicio_delivery,
        nombre_cliente=venta.nombre_cliente,
        telefono_cliente=venta.telefono_cliente,
        subtotal=venta.subtotal,
        monto_descuento=venta.monto_descuento,
        impuesto=venta.impuesto,
        total=venta.total,
        metodo_pago=venta.metodo_pago,
        notas=venta.notas,
        estado=venta.estado,
        fecha_creacion=datetime.utcnow()
    )
    db.add(db_venta)
    db.flush()
    
    # Agregar items
    for item in venta.items:
        db_item = ItemVenta(
            id=str(uuid.uuid4()),
            venta_id=db_venta.id,
            receta_id=item.receta_id,
            nombre_item=item.nombre_item,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
            total=item.total
        )
        db.add(db_item)

        # Descontar de inventario
        # 1. Obtener receta con sus ingredientes
        receta = db.query(Receta).filter(Receta.id == item.receta_id).first()
        
        if receta and receta.ingredientes:
            for ingrediente in receta.ingredientes:
                if ingrediente.item_inventario_id:
                    # 2. Buscar el item de inventario correspondiente en la sucursal
                    item_inv = db.query(ItemInventario).filter(
                        ItemInventario.id == ingrediente.item_inventario_id,
                        ItemInventario.sucursal_id == venta.sucursal_id
                    ).first()
                    
                    if item_inv:
                        # 3. Calcular cantidad a descontar
                        cantidad_total = ingrediente.cantidad * item.cantidad
                        
                        # 4. Actualizar stock (permitiendo negativos)
                        item_inv.cantidad -= cantidad_total
                        
                        # Actualizar fecha de actualización
                        item_inv.ultima_actualizacion = datetime.utcnow()
                        
                        db.add(item_inv)
    
    db.commit()
    db.refresh(db_venta)
    return db_venta

@router.get("/{venta_id}", response_model=VentaResponse)
async def obtener_venta(venta_id: str, db: Session = Depends(get_db)):
    """Obtener una venta específica"""
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta

@router.put("/{venta_id}", response_model=VentaResponse)
async def actualizar_venta(
    venta_id: str,
    venta_update: VentaUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una venta (solo estado por ahora)"""
    db_venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not db_venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    if venta_update.estado:
        db_venta.estado = venta_update.estado
    
    db.commit()
    db.refresh(db_venta)
    return db_venta
