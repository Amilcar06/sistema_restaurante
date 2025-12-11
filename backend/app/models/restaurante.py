"""
Modelo de Restaurante (Entidad de Negocio)
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Restaurante(Base):
    __tablename__ = "restaurantes"
    
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)  # Nombre comercial
    razon_social = Column(String)  # Razón social legal
    nit = Column(String)  # Número de Identificación Tributaria
    logo_url = Column(String)
    moneda = Column(String, default="BOB")
    
    # Propietario (Usuario)
    propietario_id = Column(String, ForeignKey("usuarios.id", use_alter=True, name="fk_restaurante_propietario"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    propietario = relationship("Usuario", back_populates="restaurantes_propios")
    sucursales = relationship("Sucursal", back_populates="restaurante")
