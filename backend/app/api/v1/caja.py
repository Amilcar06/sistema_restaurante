from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.caja import CajaSesion
from app.models.venta import Venta
from app.schemas.caja import CajaSesionCreate, CajaSesionResponse, CajaSesionCerrar

router = APIRouter()

@router.get("/estado", response_model=Optional[CajaSesionResponse])
def obtener_estado_caja(
    sucursal_id: str, 
    usuario_id: str, 
    db: Session = Depends(get_db)
):
    """
    Verifica si el usuario tiene una caja abierta en esta sucursal.
    Retorna la sesión activa o null.
    """
    sesion = db.query(CajaSesion).filter(
        CajaSesion.sucursal_id == sucursal_id,
        CajaSesion.usuario_id == usuario_id,
        CajaSesion.estado == "ABIERTA"
    ).first()
    return sesion

@router.post("/abrir", response_model=CajaSesionResponse)
def abrir_caja(datos: CajaSesionCreate, db: Session = Depends(get_db)):
    """Abre una nueva sesión de caja"""
    # Verificar si ya tiene una abierta
    sesion_activa = db.query(CajaSesion).filter(
        CajaSesion.sucursal_id == datos.sucursal_id,
        CajaSesion.usuario_id == datos.usuario_id,
        CajaSesion.estado == "ABIERTA"
    ).first()
    
    if sesion_activa:
        raise HTTPException(
            status_code=400, 
            detail="Ya tienes una caja abierta en esta sucursal."
        )
    
    nueva_sesion = CajaSesion(
        id=str(uuid.uuid4()),
        sucursal_id=datos.sucursal_id,
        usuario_id=datos.usuario_id,
        monto_inicial=datos.monto_inicial,
        estado="ABIERTA",
        fecha_apertura=datetime.utcnow(),
        comentarios=datos.comentarios
    )
    
    db.add(nueva_sesion)
    db.commit()
    db.refresh(nueva_sesion)
    return nueva_sesion

@router.post("/cerrar/{sesion_id}", response_model=CajaSesionResponse)
def cerrar_caja(
    sesion_id: str, 
    datos: CajaSesionCerrar, 
    db: Session = Depends(get_db)
):
    """Cierra la sesión de caja y calcula diferencias"""
    sesion = db.query(CajaSesion).filter(CajaSesion.id == sesion_id).first()
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión de caja no encontrada")
    
    if sesion.estado != "ABIERTA":
        raise HTTPException(status_code=400, detail="Esta caja ya está cerrada")
    
    # Calcular VENTAS realizadas por este usuario en esta sesión
    # Lógica simplificada: Ventas desde fecha_apertura hasta hora actual (fecha_cierre)
    # Filtrando por usuario y sucursal
    fecha_cierre = datetime.utcnow()
    
    ventas_total = 0.0
    # TODO: Implementar filtro por usuario si es caja individual, o por sucursal si es compartida.
    # Asumimos caja individual por usuario por ahora según el modelo.
    
    from sqlalchemy import func
    
    ventas = db.query(func.sum(Venta.total)).filter(
        Venta.sucursal_id == sesion.sucursal_id,
        Venta.usuario_id == sesion.usuario_id,   # Asegurarse que Venta tenga usuario_id
        Venta.fecha_creacion >= sesion.fecha_apertura,
        Venta.fecha_creacion <= fecha_cierre,
        Venta.estado == "COMPLETADA"
    ).scalar()
    
    ventas_total = ventas or 0.0
    
    # Cálculo final
    # Monto Sistema = Inicial + Ventas (Efectivo) 
    # NOTA: Idealmente filtraríamos solo ventas en EFECTIVO para cuadrar billetes, 
    # pero para simplificar 'monto_sistema' suele ser el total esperado.
    # Si queremos cuadrar solo efectivo, deberíamos filtrar metodo_pago="EFECTIVO".
    # Vamos a asumir que cuadramos TODO el dinero (Efectivo + Vouchers tarjetas + QR).
    
    monto_sistema = sesion.monto_inicial + ventas_total
    diferencia = datos.monto_final - monto_sistema
    
    sesion.fecha_cierre = fecha_cierre
    sesion.monto_final = datos.monto_final
    sesion.monto_sistema = monto_sistema
    sesion.diferencia = diferencia
    sesion.estado = "CERRADA"
    if datos.comentarios:
        sesion.comentarios = datos.comentarios
        
    db.commit()
    db.refresh(sesion)
    return sesion
