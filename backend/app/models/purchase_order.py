"""
Purchase Order models for PostgreSQL
Órdenes de compra a proveedores
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(String, primary_key=True, index=True)
    order_number = Column(String, unique=True, nullable=False, index=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)
    status = Column(String, nullable=False, default="PENDING")  # PENDING, APPROVED, RECEIVED, CANCELLED
    total_amount = Column(Float, nullable=False)
    expected_delivery_date = Column(DateTime)
    received_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_by = Column(String, ForeignKey("users.id"))
    approved_by = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    supplier = relationship("Supplier", back_populates="purchase_orders")
    location = relationship("BusinessLocation", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])
    approver = relationship("User", foreign_keys=[approved_by])

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(String, primary_key=True, index=True)
    purchase_order_id = Column(String, ForeignKey("purchase_orders.id"), nullable=False)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"))
    item_name = Column(String, nullable=False)  # Por si no existe en inventario aún
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    received_quantity = Column(Float, default=0.0)
    
    # Relaciones
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    inventory_item = relationship("InventoryItem", back_populates="purchase_order_items")

