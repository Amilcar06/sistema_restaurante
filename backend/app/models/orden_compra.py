"""
Modelo de Orden de Compra en Español
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class OrdenCompra(Base):
    __tablename__ = "ordenes_compra"
    
    id = Column(String, primary_key=True, index=True)
    numero_orden = Column(String, unique=True, nullable=False, index=True)
    proveedor_id = Column(String, ForeignKey("proveedores.id"), nullable=False)
    sucursal_id = Column(String, ForeignKey("sucursales.id"), nullable=False)
    estado = Column(String, nullable=False, default="PENDIENTE")  # PENDIENTE, APROBADA, RECIBIDA, CANCELADA
    monto_total = Column(Float, nullable=False)
    fecha_entrega_esperada = Column(DateTime)
    fecha_recepcion = Column(DateTime)
    notas = Column(Text)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, index=True)
    creado_por_id = Column(String, ForeignKey("usuarios.id"))
    aprobado_por_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    proveedor = relationship("Proveedor", back_populates="ordenes_compra")
    sucursal = relationship("Sucursal", back_populates="ordenes_compra")
    items = relationship("ItemOrdenCompra", back_populates="orden_compra", cascade="all, delete-orphan")
    creador = relationship("Usuario", foreign_keys=[creado_por_id])
    aprobador = relationship("Usuario", foreign_keys=[aprobado_por_id])

class ItemOrdenCompra(Base):
    __tablename__ = "items_orden_compra"
    
    id = Column(String, primary_key=True, index=True)
    orden_compra_id = Column(String, ForeignKey("ordenes_compra.id"), nullable=False)
    item_inventario_id = Column(String, ForeignKey("items_inventario.id"))
    nombre_item = Column(String, nullable=False)  # Por si no existe en inventario
    cantidad = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    cantidad_recibida = Column(Float, default=0.0)
    
    # Relaciones
    orden_compra = relationship("OrdenCompra", back_populates="items")
    item_inventario = relationship("ItemInventario", back_populates="items_orden_compra")
