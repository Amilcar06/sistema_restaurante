"""
Sales models for PostgreSQL
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(String, primary_key=True, index=True)
    sale_number = Column(String, unique=True, index=True)  # NUEVO: Número de venta legible
    location_id = Column(String, ForeignKey("business_locations.id"), nullable=False)  # NUEVO
    table_number = Column(String)  # NUEVO: Número de mesa
    waiter_id = Column(String, ForeignKey("users.id"))  # NUEVO: Mesero
    sale_type = Column(String, nullable=False, default="LOCAL")  # NUEVO: LOCAL, DELIVERY, TAKEAWAY
    delivery_service = Column(String)  # NUEVO: PedidosYa, Ahora, etc.
    customer_name = Column(String)  # NUEVO: Nombre del cliente
    customer_phone = Column(String)  # NUEVO: Teléfono del cliente
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)  # NUEVO: Descuento total
    tax = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    payment_method = Column(String)  # EFECTIVO, QR, TARJETA
    notes = Column(Text)
    status = Column(String, default="COMPLETED")  # NUEVO: COMPLETED, CANCELLED, REFUNDED
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    location = relationship("BusinessLocation", back_populates="sales")
    waiter = relationship("User", foreign_keys=[waiter_id])
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    discounts = relationship("SaleDiscount", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(String, primary_key=True, index=True)
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    recipe_id = Column(String, ForeignKey("recipes.id"))
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    
    # Relaciones
    sale = relationship("Sale", back_populates="items")
    recipe = relationship("Recipe", back_populates="sale_items")

