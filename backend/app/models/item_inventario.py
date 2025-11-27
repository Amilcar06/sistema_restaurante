"""
Modelo de Item de Inventario en Español
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ItemInventario(Base):
    __tablename__ = "items_inventario"
    
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    categoria = Column(String, nullable=False, index=True)
    cantidad = Column(Float, nullable=False, default=0.0)
    unidad = Column(String, nullable=False)  # kg, litros, etc.
    unidad_id = Column(String, ForeignKey("unidades.id"))
    stock_minimo = Column(Float, nullable=False)
    stock_maximo = Column(Float)
    costo_unitario = Column(Float, nullable=False)
    proveedor_id = Column(String, ForeignKey("proveedores.id"))
    sucursal_id = Column(String, ForeignKey("sucursales.id"), nullable=False)
    fecha_vencimiento = Column(DateTime)
    codigo_barras = Column(String, unique=True, index=True)
    ultima_actualizacion = Column(DateTime, default=datetime.utcnow, index=True)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Campos para IA
    puntaje_popularidad = Column(Float, default=0.0)
    factor_estacional = Column(JSON)
    pronostico_demanda = Column(Float)
    
    # Relaciones
    unidad_ref = relationship("Unidad", back_populates="items_inventario")
    proveedor_ref = relationship("Proveedor", back_populates="items_inventario")
    sucursal = relationship("Sucursal", back_populates="inventario")
    historial_costos = relationship("HistorialCostoInventario", back_populates="item_inventario")
    movimientos = relationship("MovimientoInventario", back_populates="item_inventario")
    ingredientes_receta = relationship("IngredienteReceta", back_populates="item_inventario")
    items_orden_compra = relationship("ItemOrdenCompra", back_populates="item_inventario")
