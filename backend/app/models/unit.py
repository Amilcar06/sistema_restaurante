"""
Unit models for PostgreSQL
Sistema de unidades de medida con conversiones
"""
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Unit(Base):
    __tablename__ = "units"
    
    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)  # kg, g, lb, atado, cuchara
    name = Column(String, nullable=False)  # Kilogramo, Gramo, Libra, Atado, Cuchara
    type = Column(String, nullable=False)  # weight, volume, piece, custom
    base_unit_id = Column(String, ForeignKey("units.id"))  # Unidad base para conversión
    factor_to_base = Column(Float, nullable=False, default=1.0)  # Factor de conversión
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    base_unit = relationship("Unit", remote_side=[id], backref="derived_units")
    inventory_items = relationship("InventoryItem", back_populates="unit_ref")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="unit_ref")

