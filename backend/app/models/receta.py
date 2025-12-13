"""
Modelo de Receta en Español
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Receta(Base):
    __tablename__ = "recetas"
    
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    descripcion = Column(Text)
    imagen_url = Column(String, nullable=True)
    categoria = Column(String, nullable=False, index=True)
    subcategoria = Column(String)
    precio = Column(Float, nullable=False)
    costo = Column(Float, nullable=False, default=0.0)
    margen = Column(Float, nullable=False, default=0.0)
    tiempo_preparacion = Column(Integer)  # minutos
    porciones = Column(Integer, default=1)
    instrucciones = Column(Text)
    sucursal_id = Column(String, ForeignKey("sucursales.id"))
    disponible = Column(Boolean, default=True)
    puntaje_popularidad = Column(Float, default=0.0)
    version_actual = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    sucursal = relationship("Sucursal", back_populates="recetas")
    ingredientes = relationship("IngredienteReceta", back_populates="receta", cascade="all, delete-orphan")
    # componentes = relationship("ComponenteReceta", foreign_keys="ComponenteReceta.receta_id", back_populates="receta")
    # usado_en_recetas = relationship("ComponenteReceta", foreign_keys="ComponenteReceta.subreceta_id", back_populates="subreceta")
    versiones = relationship("VersionReceta", back_populates="receta")
    items_venta = relationship("ItemVenta", back_populates="receta")

class IngredienteReceta(Base):
    __tablename__ = "ingredientes_receta"
    
    id = Column(String, primary_key=True, index=True)
    receta_id = Column(String, ForeignKey("recetas.id"), nullable=False)
    item_inventario_id = Column(String, ForeignKey("items_inventario.id"))
    nombre_ingrediente = Column(String, nullable=False)  # Nombre si no está en inventario
    cantidad = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)
    unidad_id = Column(String, ForeignKey("unidades.id"))
    costo = Column(Float, nullable=False)
    
    # Relaciones
    receta = relationship("Receta", back_populates="ingredientes")
    item_inventario = relationship("ItemInventario", back_populates="ingredientes_receta")
    unidad_ref = relationship("Unidad", back_populates="ingredientes_receta")
