"""
Recipe Component models for PostgreSQL
Preparaciones intermedias (recetas que usan otras recetas)
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class RecipeComponent(Base):
    __tablename__ = "recipe_components"
    
    id = Column(String, primary_key=True, index=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)  # Receta principal
    subrecipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)  # Receta usada como ingrediente
    quantity = Column(Float, nullable=False)  # Cantidad de la sub-receta
    unit = Column(String, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    recipe = relationship("Recipe", foreign_keys=[recipe_id], back_populates="components")
    subrecipe = relationship("Recipe", foreign_keys=[subrecipe_id], back_populates="used_in_recipes")

