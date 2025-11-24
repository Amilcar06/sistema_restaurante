"""
Inventory models for PostgreSQL
For MongoDB, we use Pydantic schemas instead
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String, nullable=False)  # kg, litros, unidades, etc.
    unit_id = Column(String, ForeignKey("units.id"))  # NUEVO: Referencia a tabla units
    min_stock = Column(Float, nullable=False)
    max_stock = Column(Float)  # NUEVO: Stock máximo recomendado
    cost_per_unit = Column(Float, nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"))  # NUEVO: FK a suppliers
    supplier = Column(String)  # Mantener para compatibilidad
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)  # NUEVO
    expiry_date = Column(DateTime)  # NUEVO: Fecha de caducidad
    barcode = Column(String, unique=True, index=True)  # NUEVO: Código de barras
    last_updated = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Campos para IA
    popularity_score = Column(Float, default=0.0)  # NUEVO: Basado en uso
    seasonal_factor = Column(JSON)  # NUEVO: {"enero": 1.2, "septiembre": 0.8}
    demand_forecast = Column(Float)  # NUEVO: Predicción de demanda
    
    # Relaciones
    unit_ref = relationship("Unit", back_populates="inventory_items")
    supplier_ref = relationship("Supplier", back_populates="inventory_items")
    location = relationship("BusinessLocation", back_populates="inventory_items")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="inventory_item")
    cost_history = relationship("InventoryCostHistory", back_populates="inventory_item")
    movements = relationship("InventoryMovement", back_populates="inventory_item")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="inventory_item")

