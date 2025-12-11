from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.core import security
from app.models.usuario import Usuario
from app.core.config import settings
from jose import jwt
from datetime import datetime, timedelta

def test_recover_password_valid_email(
    client: TestClient, db: Session, normal_user_token_headers
):
    # Create a user first (if not exists)
    email = "test_recover@example.com"
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        import uuid
        user = Usuario(
            id=str(uuid.uuid4()),
            email=email,
            nombre_usuario="test_recover",
            contrasena_hash=security.get_password_hash("password123"),
            nombre_completo="Test Recover",
            activo=True
        )
        db.add(user)
        db.commit()

    # Mock the email service
    with patch("app.api.v1.password_recovery.email_service.send_password_recovery_email") as mock_send:
        response = client.post(
            f"{settings.API_V1_PREFIX}/recover-password",
            json={"email": email},
        )
        
        assert response.status_code == 200
        assert response.json() == {"message": "If the email exists, a recovery link has been sent."}
        
        # Verify email was sent
        mock_send.assert_called_once()
        args, _ = mock_send.call_args
        assert args[0] == email
        assert args[1] is not None # Token

def test_recover_password_invalid_email(client: TestClient):
    email = "nonexistent@example.com"
    
    with patch("app.api.v1.password_recovery.email_service.send_password_recovery_email") as mock_send:
        response = client.post(
            f"{settings.API_V1_PREFIX}/recover-password",
            json={"email": email},
        )
        
        assert response.status_code == 200
        # Should return same message for security
        assert response.json() == {"message": "If the email exists, a recovery link has been sent."}
        
        # Verify email was NOT sent
        mock_send.assert_not_called()

def test_reset_password_valid_token(client: TestClient, db: Session):
    # Create a user
    email = "test_reset@example.com"
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        import uuid
        user = Usuario(
            id=str(uuid.uuid4()),
            email=email,
            nombre_usuario="test_reset",
            contrasena_hash=security.get_password_hash("oldpassword"),
            nombre_completo="Test Reset",
            activo=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate a valid token
    token = security.create_access_token(user.id)
    new_password = "newpassword123"

    response = client.post(
        f"{settings.API_V1_PREFIX}/reset-password",
        json={"token": token, "new_password": new_password},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Password updated successfully"}

    # Verify password was updated
    db.refresh(user)
    assert security.verify_password(new_password, user.contrasena_hash)

def test_reset_password_invalid_token(client: TestClient):
    response = client.post(
        f"{settings.API_V1_PREFIX}/reset-password",
        json={"token": "invalid_token_string", "new_password": "newpassword123"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid or expired token"
