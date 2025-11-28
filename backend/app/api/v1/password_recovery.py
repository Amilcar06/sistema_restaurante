from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.usuario import Usuario
from app.schemas.password_recovery import PasswordRecoveryRequest, PasswordResetConfirm
from app.core import security
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory store for reset tokens (for demonstration purposes)
# In production, store this in Redis or Database with expiration
reset_tokens = {}

@router.post("/recover-password")
async def recover_password(
    request: PasswordRecoveryRequest,
    db: Session = Depends(get_db)
):
    """
    Initiate password recovery. 
    Since no email service is configured, the token will be logged to the console.
    """
    user = db.query(Usuario).filter(Usuario.email == request.email).first()
    if not user:
        # Return 200 even if user not found to prevent email enumeration
        return {"message": "If the email exists, a recovery link has been sent."}
    
    # Generate a simple token (in production use a secure, signed token)
    token = security.create_access_token(user.id, expires_delta=None) # Reusing access token logic for simplicity
    
    # Store token (simplified)
    reset_tokens[token] = user.id
    
    # Log the token
    print(f"============================================")
    print(f"PASSWORD RESET TOKEN FOR {request.email}:")
    print(f"{token}")
    print(f"Link: http://localhost:5173/reset-password?token={token}")
    print(f"============================================")
    
    return {"message": "If the email exists, a recovery link has been sent."}

@router.post("/reset-password")
async def reset_password(
    confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Reset password using the token.
    """
    user_id = reset_tokens.get(confirm.token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.contrasena_hash = security.get_password_hash(confirm.new_password)
    db.commit()
    
    # Remove token
    del reset_tokens[confirm.token]
    
    return {"message": "Password updated successfully"}
