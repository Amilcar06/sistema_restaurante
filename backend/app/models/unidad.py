"""
Modelo de Unidad de Medida en Español
"""
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Unidad(Base):
    __tablename__ = "unidades"
    
    id = Column(String, primary_key=True, index=True)
    codigo = Column(String, unique=True, nullable=False, index=True)  # kg, g, lb
    nombre = Column(String, nullable=False)  # Kilogramo, Gramo
    tipo = Column(String, nullable=False)  # peso, volumen, unidad
    unidad_base_id = Column(String, ForeignKey("unidades.id"))
    factor_conversion = Column(Float, nullable=False, default=1.0)
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    unidad_base = relationship("Unidad", remote_side=[id], backref="unidades_derivadas")
    items_inventario = relationship("ItemInventario", back_populates="unidad_ref")
    ingredientes_receta = relationship("IngredienteReceta", back_populates="unidad_ref")
