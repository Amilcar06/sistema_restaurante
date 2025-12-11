from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.usuario import Usuario
from app.models.restaurante import Restaurante
from app.models.sucursal import Sucursal
from app.schemas.onboarding import OnboardingRestauranteRequest, OnboardingSucursalRequest
from app.schemas.restaurante import RestauranteResponse
from app.schemas.sucursal import SucursalResponse
import uuid
from datetime import datetime

router = APIRouter()

# TODO: Reemplazar con dependencia real de autenticación cuando se migre
async def get_current_user_mock(db: Session = Depends(get_db)):
    # Retorna el primer usuario encontrado para pruebas
    user = db.query(Usuario).first()
    if not user:
        # Si no hay usuarios, no podemos continuar
        raise HTTPException(status_code=401, detail="No hay usuarios en el sistema. Cree uno primero.")
    return user

@router.post("/restaurante", response_model=RestauranteResponse)
async def crear_restaurante(
    request: OnboardingRestauranteRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user_mock)
):
    """
    Crea el restaurante inicial para el usuario (Dueño).
    """
    # Verificar si el usuario ya tiene restaurante
    existing = db.query(Restaurante).filter(Restaurante.propietario_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya tiene un restaurante registrado")
    
    restaurante = Restaurante(
        id=str(uuid.uuid4()),
        nombre=request.nombre,
        razon_social=request.razon_social,
        nit=request.nit,
        moneda=request.moneda,
        propietario_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(restaurante)
    db.commit()
    db.refresh(restaurante)
    return restaurante

@router.post("/sucursal", response_model=SucursalResponse)
async def crear_sucursal_inicial(
    request: OnboardingSucursalRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user_mock)
):
    """
    Crea la primera sucursal del restaurante.
    """
    # Buscar el restaurante del usuario
    restaurante = db.query(Restaurante).filter(Restaurante.propietario_id == current_user.id).first()
    if not restaurante:
        raise HTTPException(status_code=400, detail="Primero debe crear un restaurante")
    
    sucursal = Sucursal(
        id=str(uuid.uuid4()),
        nombre=request.nombre,
        direccion=request.direccion,
        ciudad=request.ciudad,
        telefono=request.telefono,
        restaurante_id=restaurante.id,
        es_principal=True, # Primera sucursal es principal por defecto
        creado_por_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(sucursal)
    
    # Asignar como sucursal default del usuario si no tiene una
    if not current_user.sucursal_default_id:
        current_user.sucursal_default_id = sucursal.id
        db.add(current_user)
    
    db.commit()
    db.refresh(sucursal)
    return sucursal
