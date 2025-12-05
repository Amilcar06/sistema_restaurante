"""
API de Chatbot en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chatbot import MensajeChat, RespuestaChat
from app.services.ai_service import ai_service
from app.core.database import get_db
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/chat", response_model=RespuestaChat)
async def chat(mensaje: MensajeChat, db: Session = Depends(get_db)):
    """
    Endpoint de chat - recibe mensaje del usuario y retorna respuesta de IA
    con contexto del negocio en tiempo real.
    """
    try:
        # 1. Obtener contexto del negocio de la base de datos
        context = ai_service.get_business_context(db)
        
        # 2. Obtener respuesta de IA
        response_text = await ai_service.get_chat_response(
            mensaje.message,
            context=context
        )
        
        # 3. Generar o usar ID de conversación existente
        conversation_id = mensaje.conversation_id or str(uuid.uuid4())
        
        # 4. (Opcional) Guardar log de la conversación aquí si se desea
        
        return RespuestaChat(
            response=response_text,
            conversation_id=conversation_id,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        print(f"Error en chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando mensaje de chat: {str(e)}")
