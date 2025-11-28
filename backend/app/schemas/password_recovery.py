from pydantic import BaseModel, EmailStr

class PasswordRecoveryRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
