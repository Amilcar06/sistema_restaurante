"""
Inventory Cost History models for PostgreSQL
Historial de precios de inventario
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class InventoryCostHistory(Base):
    __tablename__ = "inventory_cost_history"
    
    id = Column(String, primary_key=True, index=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False, index=True)
    cost_per_unit = Column(Float, nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    reason = Column(String)  # "compra", "ajuste", "inflación", "estacional"
    notes = Column(Text)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    inventory_item = relationship("InventoryItem", back_populates="cost_history")
    supplier = relationship("Supplier", back_populates="cost_history")

