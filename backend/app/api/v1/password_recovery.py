from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.core.database import get_db
from app.models.usuario import Usuario
from app.schemas.password_recovery import PasswordRecoveryRequest, PasswordResetConfirm
from app.core import security
from app.core.config import settings
from app.services.email import email_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/recover-password")
async def recover_password(
    request: PasswordRecoveryRequest,
    db: Session = Depends(get_db)
):
    """
    Initiate password recovery. 
    Sends an email with a signed token.
    """
    user = db.query(Usuario).filter(Usuario.email == request.email).first()
    if not user:
        # Return 200 even if user not found to prevent email enumeration
        return {"message": "If the email exists, a recovery link has been sent."}
    
    # Generate a signed token valid for 30 minutes
    access_token_expires = timedelta(minutes=30)
    token = security.create_access_token(user.id, expires_delta=access_token_expires)
    
    # Send email
    email_service.send_password_recovery_email(user.email, token)
    
    return {"message": "If the email exists, a recovery link has been sent."}

@router.post("/reset-password")
async def reset_password(
    confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Reset password using the signed token.
    """
    try:
        payload = jwt.decode(confirm.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.contrasena_hash = security.get_password_hash(confirm.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}
