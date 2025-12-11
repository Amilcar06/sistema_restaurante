import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.core.config import settings
from app.core import security
from app.models.usuario import Usuario

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db() -> Generator:
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client() -> Generator:
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Generator) -> dict:
    email = "test_user@example.com"
    password = "testpassword"
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        import uuid
        user = Usuario(
            id=str(uuid.uuid4()),
            email=email,
            nombre_usuario="test_user",
            contrasena_hash=security.get_password_hash(password),
            nombre_completo="Test User",
            activo=True
        )
        db.add(user)
        db.commit()
    
    return security.create_access_token(user.id)
