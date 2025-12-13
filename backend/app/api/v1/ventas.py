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
from app.models.caja import CajaSesion
from app.models.configuracion import Configuracion
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[VentaResponse])
def obtener_ventas(db: Session = Depends(get_db)):
    """Obtener todas las ventas"""
    ventas = db.query(Venta).order_by(desc(Venta.fecha_creacion)).all()
    return ventas

@router.post("/", response_model=VentaResponse)
def crear_venta(
    venta: VentaCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Crear una nueva venta con validaciones estrictas"""
    
    # 0. Validar Caja Abierta
    # Buscar sesión de caja abierta para el usuario en esta sucursal
    caja_sesion = db.query(CajaSesion).filter(
        CajaSesion.usuario_id == current_user.id,
        CajaSesion.sucursal_id == venta.sucursal_id,
        CajaSesion.estado == "ABIERTA"
    ).first()
    
    if not caja_sesion:
        raise HTTPException(
            status_code=400, 
            detail="No tienes una caja abierta en esta sucursal. Por favor abre caja antes de vender."
        )

    # 1. Validar sucursal
    sucursal = db.query(Sucursal).filter(Sucursal.id == venta.sucursal_id).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    # 2. Seguridad: Forzar mesero_id al usuario actual (o validar permisos si se quiere permitir vender por otros)
    # Por ahora, estricto: la venta la hace quien está logueado
    venta.mesero_id = current_user.id
    
    # 3. Validar Configuración de Stock
    config = db.query(Configuracion).first()
    permitir_stock_negativo = config.permitir_stock_negativo if config else True
    
    # Generar número de venta
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
    
    # Agregar items y validar stock
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
        receta = db.query(Receta).filter(Receta.id == item.receta_id).first()
        
        if receta and receta.ingredientes:
            for ingrediente in receta.ingredientes:
                if ingrediente.item_inventario_id:
                    item_inv = db.query(ItemInventario).filter(
                        ItemInventario.id == ingrediente.item_inventario_id,
                        ItemInventario.sucursal_id == venta.sucursal_id
                    ).first()
                    
                    if item_inv:
                        cantidad_necesaria = ingrediente.cantidad * item.cantidad
                        
                        # Validar stock si no se permite negativo
                        if not permitir_stock_negativo and (item_inv.cantidad - cantidad_necesaria) < 0:
                            raise HTTPException(
                                status_code=400,
                                detail=f"Stock insuficiente para '{item_inv.nombre}'. Disponible: {item_inv.cantidad}, Necesario: {cantidad_necesaria}"
                            )
                        
                        item_inv.cantidad -= cantidad_necesaria
                        item_inv.ultima_actualizacion = datetime.utcnow()
                        db.add(item_inv)
    
    db.commit()
    db.refresh(db_venta)
    return db_venta

@router.get("/{venta_id}", response_model=VentaResponse)
def obtener_venta(venta_id: str, db: Session = Depends(get_db)):
    """Obtener una venta específica"""
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta

@router.put("/{venta_id}", response_model=VentaResponse)
def actualizar_venta(
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
