"""
Modelo de Movimiento de Inventario en Español
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"
    
    id = Column(String, primary_key=True, index=True)
    item_inventario_id = Column(String, ForeignKey("items_inventario.id"), nullable=False, index=True)
    sucursal_id = Column(String, ForeignKey("sucursales.id"), nullable=False)
    tipo_movimiento = Column(String, nullable=False)  # ENTRADA, SALIDA, AJUSTE, MERMA, CADUCIDAD, ROBO, TRANSFERENCIA
    cantidad = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)
    costo_unitario = Column(Float)
    referencia_id = Column(String)
    tipo_referencia = Column(String)
    notas = Column(Text)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, index=True)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    item_inventario = relationship("ItemInventario", back_populates="movimientos")
    sucursal = relationship("Sucursal", back_populates="movimientos_inventario")
