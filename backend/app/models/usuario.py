"""
Modelo de Usuario en Español
"""
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nombre_usuario = Column(String, unique=True, index=True, nullable=False)
    contrasena_hash = Column(String, nullable=False)
    nombre_completo = Column(String)
    telefono = Column(String)
    activo = Column(Boolean, default=True)
    es_superusuario = Column(Boolean, default=False)
    
    # Sucursal por defecto al iniciar sesión
    sucursal_default_id = Column(String, ForeignKey("sucursales.id", use_alter=True, name="fk_usuario_sucursal_default"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ultimo_acceso = Column(DateTime)
    
    # Relaciones
    sucursal_default = relationship("Sucursal", foreign_keys=[sucursal_default_id], back_populates="usuarios_default")
    roles = relationship("UsuarioRol", foreign_keys="UsuarioRol.usuario_id", back_populates="usuario")
    restaurantes_propios = relationship("Restaurante", back_populates="propietario")
    # chatbot_logs = relationship("ChatbotLog", back_populates="usuario") # Pendiente refactorizar ChatbotLog
