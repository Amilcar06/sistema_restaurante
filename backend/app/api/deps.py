from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/login/access-token"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> Usuario:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(Usuario).filter(Usuario.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    if not current_user.activo:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
