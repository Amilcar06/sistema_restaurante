"""
Modelo de Proveedor en Español
"""
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Proveedor(Base):
    __tablename__ = "proveedores"
    
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    nombre_contacto = Column(String)
    telefono = Column(String)
    email = Column(String)
    direccion = Column(Text)
    ciudad = Column(String)
    zona = Column(String)
    nit = Column(String)  # Tax ID
    terminos_pago = Column(String)  # "30 días", "contado"
    calificacion = Column(Float)  # 1-5 estrellas
    activo = Column(Boolean, default=True)
    notas = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    items_inventario = relationship("ItemInventario", back_populates="proveedor_ref")
    historial_costos = relationship("HistorialCostoInventario", back_populates="proveedor")
    ordenes_compra = relationship("OrdenCompra", back_populates="proveedor")
