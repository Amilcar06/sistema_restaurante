"""
Inventory Movement models for PostgreSQL
Movimientos de inventario para auditoría
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    id = Column(String, primary_key=True, index=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False, index=True)
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)
    movement_type = Column(String, nullable=False)  # ENTRADA, SALIDA, AJUSTE, MERMA, CADUCIDAD, ROBO, TRANSFERENCIA
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    cost_per_unit = Column(Float)  # Costo al momento del movimiento
    reference_id = Column(String)  # ID de venta, compra, etc.
    reference_type = Column(String)  # "sale", "purchase", "adjustment", etc.
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    inventory_item = relationship("InventoryItem", back_populates="movements")
    location = relationship("BusinessLocation", back_populates="inventory_movements")

