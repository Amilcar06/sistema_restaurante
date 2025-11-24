"""
Business Location models for PostgreSQL
Soporte multi-sucursal
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class BusinessLocation(Base):
    __tablename__ = "business_locations"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)  # "Sucursal Centro", "Sopocachi", etc.
    address = Column(Text, nullable=False)
    city = Column(String, default="La Paz")
    zone = Column(String)  # Zona específica
    phone = Column(String)
    email = Column(String)
    is_main = Column(Boolean, default=False)  # Sucursal principal
    is_active = Column(Boolean, default=True)
    open_hours = Column(JSON)  # {"monday": {"open": "08:00", "close": "22:00"}, ...}
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    inventory_items = relationship("InventoryItem", back_populates="location")
    recipes = relationship("Recipe", back_populates="location")
    sales = relationship("Sale", back_populates="location")
    inventory_movements = relationship("InventoryMovement", back_populates="location")
    user_roles = relationship("UserRole", foreign_keys="UserRole.location_id", back_populates="location")
    promotions = relationship("Promotion", back_populates="location")
    purchase_orders = relationship("PurchaseOrder", back_populates="location")
    users_default = relationship("User", foreign_keys="User.default_location_id", back_populates="default_location")

