"""
Promotion models for PostgreSQL
Sistema de promociones y descuentos
"""
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Promotion(Base):
    __tablename__ = "promotions"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    discount_type = Column(String, nullable=False)  # percentage, fixed_amount, buy_x_get_y
    discount_value = Column(Float, nullable=False)  # Porcentaje o monto fijo
    min_purchase = Column(Float)  # Compra mínima requerida
    max_discount = Column(Float)  # Descuento máximo
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    applicable_to = Column(String)  # all, recipes, categories, specific_items
    applicable_ids = Column(JSON)  # IDs de recetas/categorías específicas
    location_id = Column(String, ForeignKey("business_locations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    location = relationship("BusinessLocation", back_populates="promotions")
    sale_discounts = relationship("SaleDiscount", back_populates="promotion")

class SaleDiscount(Base):
    __tablename__ = "sale_discounts"
    
    id = Column(String, primary_key=True, index=True)
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    promotion_id = Column(String, ForeignKey("promotions.id"))
    discount_type = Column(String, nullable=False)  # promotion, manual, loyalty
    discount_amount = Column(Float, nullable=False)
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    sale = relationship("Sale", back_populates="discounts")
    promotion = relationship("Promotion", back_populates="sale_discounts")

