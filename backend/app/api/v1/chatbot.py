"""
Chatbot API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chatbot import ChatMessage, ChatResponse
from app.services.ai_service import ai_service
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """
    Chat endpoint - receives user message and returns AI response
    """
    try:
        # TODO: Get business context from database
        # For now, using empty context
        context = {}
        
        # Get AI response
        response_text = await ai_service.get_chat_response(
            message.message,
            context=context
        )
        
        # Generate or use existing conversation ID
        conversation_id = message.conversation_id or str(uuid.uuid4())
        
        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")

