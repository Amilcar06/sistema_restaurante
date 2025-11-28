"""
Modelo de Configuración del Sistema
"""
from sqlalchemy import Column, String, Float, Boolean, DateTime
from datetime import datetime
from app.core.database import Base
import uuid

class Configuracion(Base):
    __tablename__ = "configuracion"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    moneda = Column(String, default="BOB")
    impuesto_porcentaje = Column(Float, default=13.0)
    logo_url = Column(String, nullable=True)
    nombre_empresa = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    email_contacto = Column(String, nullable=True)
    
    # Configuración de notificaciones (JSON serializado o columnas individuales)
    notif_stock_critico = Column(Boolean, default=True)
    notif_reporte_diario = Column(Boolean, default=True)
    notif_sugerencias_ia = Column(Boolean, default=True)
    notif_margen_bajo = Column(Boolean, default=False)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
