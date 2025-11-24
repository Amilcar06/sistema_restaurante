"""
Chatbot Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime
    sources: Optional[list] = None  # For future: sources of information used

