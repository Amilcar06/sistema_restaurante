"""
API de Chatbot en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chatbot import MensajeChat, RespuestaChat
from app.services.ai_service import ai_service
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/chat", response_model=RespuestaChat)
async def chat(mensaje: MensajeChat):
    """
    Endpoint de chat - recibe mensaje del usuario y retorna respuesta de IA
    """
    try:
        # TODO: Obtener contexto del negocio de la base de datos
        # Por ahora, usamos contexto vacío
        context = {}
        
        # Obtener respuesta de IA
        # Nota: ai_service necesita ser refactorizado también si usa modelos en inglés internamente
        response_text = await ai_service.get_chat_response(
            mensaje.message,
            context=context
        )
        
        # Generar o usar ID de conversación existente
        conversation_id = mensaje.conversation_id or str(uuid.uuid4())
        
        return RespuestaChat(
            response=response_text,
            conversation_id=conversation_id,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando mensaje de chat: {str(e)}")
