"""
Modelo de Gestión de Caja en Español
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class CajaSesion(Base):
    __tablename__ = "caja_sesiones"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sucursal_id = Column(String, ForeignKey("sucursales.id"), nullable=False)
    usuario_id = Column(String, ForeignKey("usuarios.id"), nullable=False)
    
    fecha_apertura = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_cierre = Column(DateTime, nullable=True)
    
    monto_inicial = Column(Float, default=0.0, nullable=False)
    monto_final = Column(Float, nullable=True)     # Lo que el usuario declara al contar
    monto_sistema = Column(Float, nullable=True)   # Lo que el sistema calculó
    diferencia = Column(Float, nullable=True)      # final - sistema
    
    # ABIERTA, CERRADA
    estado = Column(String, default="ABIERTA", nullable=False)
    
    comentarios = Column(String, nullable=True)
    
    # Relaciones
    sucursal = relationship("Sucursal", back_populates="sesiones_caja")
    usuario = relationship("Usuario")
