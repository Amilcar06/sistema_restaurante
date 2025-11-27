"""
Modelo de Versión de Receta en Español
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class VersionReceta(Base):
    __tablename__ = "versiones_receta"
    
    id = Column(String, primary_key=True, index=True)
    receta_id = Column(String, ForeignKey("recetas.id"), nullable=False, index=True)
    numero_version = Column(Integer, nullable=False)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text)
    categoria = Column(String, nullable=False)
    precio = Column(Float, nullable=False)
    costo = Column(Float, nullable=False)
    margen = Column(Float, nullable=False)
    tiempo_preparacion = Column(Integer)
    porciones = Column(Integer, nullable=False)
    instrucciones = Column(Text)
    activa = Column(Boolean, default=False)
    razon_cambio = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    receta = relationship("Receta", back_populates="versiones")
