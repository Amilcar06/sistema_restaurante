"""
Recipe models for PostgreSQL
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String)  # NUEVO: Subcategoría (ej: "Carnes Rojas", "Carnes Blancas")
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False, default=0.0)  # Calculated from ingredients
    margin = Column(Float, nullable=False, default=0.0)  # Calculated margin percentage
    preparation_time = Column(Integer)  # in minutes
    servings = Column(Integer, default=1)
    instructions = Column(Text)
    location_id = Column(String, ForeignKey("business_locations.id"))  # NUEVO
    is_available = Column(Boolean, default=True)  # NUEVO: Disponible para venta
    popularity_score = Column(Float, default=0.0)  # NUEVO: Basado en ventas
    current_version = Column(Integer, default=1)  # NUEVO: Versión actual
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    location = relationship("BusinessLocation", back_populates="recipes")
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    components = relationship("RecipeComponent", foreign_keys="RecipeComponent.recipe_id", back_populates="recipe")
    used_in_recipes = relationship("RecipeComponent", foreign_keys="RecipeComponent.subrecipe_id", back_populates="subrecipe")
    versions = relationship("RecipeVersion", back_populates="recipe")
    sale_items = relationship("SaleItem", back_populates="recipe")

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    
    id = Column(String, primary_key=True, index=True)
    recipe_id = Column(String, ForeignKey("recipes.id"), nullable=False)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"))
    ingredient_name = Column(String, nullable=False)  # Name if not in inventory
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    unit_id = Column(String, ForeignKey("units.id"))  # NUEVO: Referencia a tabla units
    cost = Column(Float, nullable=False)  # Cost for this ingredient in the recipe
    
    # Relaciones
    recipe = relationship("Recipe", back_populates="ingredients")
    inventory_item = relationship("InventoryItem", back_populates="recipe_ingredients")
    unit_ref = relationship("Unit", back_populates="recipe_ingredients")

