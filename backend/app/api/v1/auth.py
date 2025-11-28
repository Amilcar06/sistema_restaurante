from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.models.usuario import Usuario
from app.schemas.token import Token
from app.schemas.usuario import UsuarioResponse

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if not usuario:
        # Intentar con nombre de usuario si el email falla
        usuario = db.query(Usuario).filter(Usuario.nombre_usuario == form_data.username).first()
        
    if not usuario or not security.verify_password(form_data.password, usuario.contrasena_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not usuario.activo:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            usuario.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "usuario": usuario # Incluimos el usuario en la respuesta para el frontend
    }
