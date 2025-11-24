"""
Recipe Version models for PostgreSQL
Versionado de recetas
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class RecipeVersion(Base):
    __tablename__ = "recipe_versions"
    
    id = Column(String, primary_key=True, index=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    margin = Column(Float, nullable=False)
    preparation_time = Column(Integer)
    servings = Column(Integer, nullable=False)
    instructions = Column(Text)
    is_active = Column(Boolean, default=False)  # Solo una versión activa por receta
    change_reason = Column(String)  # "precio", "ingredientes", "presentación"
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    recipe = relationship("Recipe", back_populates="versions")

