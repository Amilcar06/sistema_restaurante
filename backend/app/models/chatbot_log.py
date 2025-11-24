"""
Chatbot Log models for PostgreSQL
Logs de interacciones con el chatbot
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ChatbotLog(Base):
    __tablename__ = "chatbot_logs"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    session_id = Column(String, index=True)  # Para agrupar conversaciones
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    intent = Column(String)  # Clasificación de intención
    confidence = Column(Float)  # Confianza de la respuesta
    log_metadata = Column(JSON)  # Datos adicionales: contexto, sugerencias, etc. (renombrado de 'metadata' porque es palabra reservada en SQLAlchemy)
    response_time_ms = Column(Integer)  # Tiempo de respuesta en ms
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relaciones
    user = relationship("User", back_populates="chatbot_logs")

