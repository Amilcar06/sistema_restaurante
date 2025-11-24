"""
User models for PostgreSQL
"""
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)  # NUEVO
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    default_location_id = Column(String, ForeignKey("business_locations.id"))  # NUEVO
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)  # NUEVO
    
    # Relaciones
    default_location = relationship("BusinessLocation", foreign_keys=[default_location_id], back_populates="users_default")
    roles = relationship("UserRole", foreign_keys="UserRole.user_id", back_populates="user")
    chatbot_logs = relationship("ChatbotLog", back_populates="user")

