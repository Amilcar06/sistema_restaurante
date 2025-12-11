"""
Modelo de Sucursal en Español
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Sucursal(Base):
    __tablename__ = "sucursales"
    
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    direccion = Column(Text, nullable=False)
    ciudad = Column(String, default="La Paz")
    zona = Column(String)
    telefono = Column(String)
    email = Column(String)
    es_principal = Column(Boolean, default=False)
    activa = Column(Boolean, default=True)
    horarios_atencion = Column(JSON)
    
    # Relación con Restaurante (NUEVO)
    restaurante_id = Column(String, ForeignKey("restaurantes.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    creado_por_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    restaurante = relationship("Restaurante", back_populates="sucursales")
    usuarios_default = relationship("Usuario", foreign_keys="Usuario.sucursal_default_id", back_populates="sucursal_default")
    
    # Relaciones refactorizadas
    inventario = relationship("ItemInventario", back_populates="sucursal")
    recetas = relationship("Receta", back_populates="sucursal")
    ventas = relationship("Venta", back_populates="sucursal")
    promociones = relationship("Promocion", back_populates="sucursal")
    ordenes_compra = relationship("OrdenCompra", back_populates="sucursal")
    movimientos_inventario = relationship("MovimientoInventario", back_populates="sucursal")
    usuarios_rol = relationship("UsuarioRol", back_populates="sucursal")
    sesiones_caja = relationship("CajaSesion", back_populates="sucursal")
