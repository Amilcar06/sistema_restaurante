"""
Modelo de Historial de Costos de Inventario en Español
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class HistorialCostoInventario(Base):
    __tablename__ = "historial_costos_inventario"
    
    id = Column(String, primary_key=True, index=True)
    item_inventario_id = Column(String, ForeignKey("items_inventario.id"), nullable=False, index=True)
    costo_unitario = Column(Float, nullable=False)
    proveedor_id = Column(String, ForeignKey("proveedores.id"))
    fecha = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    razon = Column(String)  # "compra", "ajuste", "inflación", "estacional"
    notas = Column(Text)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    item_inventario = relationship("ItemInventario", back_populates="historial_costos")
    proveedor = relationship("Proveedor", back_populates="historial_costos")
