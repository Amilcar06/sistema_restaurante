"""
Supplier models for PostgreSQL
"""
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    contact_name = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    city = Column(String)  # La Paz, El Alto, etc.
    zone = Column(String)  # Rodríguez, Tacagua, Achumani, etc.
    tax_id = Column(String)  # NIT para facturación
    payment_terms = Column(String)  # "30 días", "contado", etc.
    rating = Column(Float)  # 1-5 estrellas
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    inventory_items = relationship("InventoryItem", back_populates="supplier_ref")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
    cost_history = relationship("InventoryCostHistory", back_populates="supplier")

