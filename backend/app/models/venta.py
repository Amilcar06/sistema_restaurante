"""
Modelo de Venta en Español
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Venta(Base):
    __tablename__ = "ventas"
    
    id = Column(String, primary_key=True, index=True)
    numero_venta = Column(String, unique=True, index=True)  # Número legible
    sucursal_id = Column(String, ForeignKey("sucursales.id"), nullable=False)
    numero_mesa = Column(String)
    mesero_id = Column(String, ForeignKey("usuarios.id"))
    tipo_venta = Column(String, nullable=False, default="LOCAL")  # LOCAL, DELIVERY, TAKEAWAY
    servicio_delivery = Column(String)  # PedidosYa, etc.
    nombre_cliente = Column(String)
    telefono_cliente = Column(String)
    subtotal = Column(Float, nullable=False)
    monto_descuento = Column(Float, default=0.0)
    impuesto = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    metodo_pago = Column(String)  # EFECTIVO, QR, TARJETA
    notas = Column(Text)
    estado = Column(String, default="COMPLETADA")  # COMPLETADA, CANCELADA, REEMBOLSADA
    fecha_creacion = Column(DateTime, default=datetime.utcnow, index=True)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    sucursal = relationship("Sucursal", back_populates="ventas")
    mesero = relationship("Usuario", foreign_keys=[mesero_id])
    items = relationship("ItemVenta", back_populates="venta", cascade="all, delete-orphan")
    descuentos = relationship("DescuentoVenta", back_populates="venta")

class ItemVenta(Base):
    __tablename__ = "items_venta"
    
    id = Column(String, primary_key=True, index=True)
    venta_id = Column(String, ForeignKey("ventas.id"), nullable=False)
    receta_id = Column(String, ForeignKey("recetas.id"))
    nombre_item = Column(String, nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    
    # Relaciones
    venta = relationship("Venta", back_populates="items")
    receta = relationship("Receta", back_populates="items_venta")
