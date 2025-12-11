from typing import Optional
from pydantic import BaseModel
from app.schemas.usuario import UsuarioResponse

class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: Optional[UsuarioResponse] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
