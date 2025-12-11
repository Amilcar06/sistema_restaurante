"""
Modelo de Promoción en Español
"""
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Promocion(Base):
    __tablename__ = "promociones"
    
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text)
    tipo_descuento = Column(String, nullable=False)  # porcentaje, monto_fijo, 2x1
    valor_descuento = Column(Float, nullable=False)
    compra_minima = Column(Float)
    descuento_maximo = Column(Float)
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime, nullable=False)
    activa = Column(Boolean, default=True)
    aplicable_a = Column(String)  # todo, recetas, categorias, items_especificos
    ids_aplicables = Column(JSON)
    sucursal_id = Column(String, ForeignKey("sucursales.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    sucursal = relationship("Sucursal", back_populates="promociones")
    descuentos_venta = relationship("DescuentoVenta", back_populates="promocion")

class DescuentoVenta(Base):
    __tablename__ = "descuentos_venta"
    
    id = Column(String, primary_key=True, index=True)
    venta_id = Column(String, ForeignKey("ventas.id"), nullable=False)
    promocion_id = Column(String, ForeignKey("promociones.id"))
    tipo_descuento = Column(String, nullable=False)  # promocion, manual, lealtad
    monto_descuento = Column(Float, nullable=False)
    razon = Column(Text)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    venta = relationship("Venta", back_populates="descuentos")
    promocion = relationship("Promocion", back_populates="descuentos_venta")
