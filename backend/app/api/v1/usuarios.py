"""
API de Usuarios en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid
import bcrypt

from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.core.database import get_db
from app.models.usuario import Usuario

router = APIRouter()

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

@router.get("/", response_model=List[UsuarioResponse])
async def obtener_usuarios(db: Session = Depends(get_db)):
    """Obtener todos los usuarios"""
    usuarios = db.query(Usuario).order_by(desc(Usuario.created_at)).all()
    return usuarios

@router.get("/{usuario_id}", response_model=UsuarioResponse)
async def obtener_usuario(usuario_id: str, db: Session = Depends(get_db)):
    """Obtener un usuario específico"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.post("/", response_model=UsuarioResponse, status_code=201)
async def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """Crear un nuevo usuario"""
    # Verificar email
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Verificar nombre de usuario
    nombre_usuario_existente = db.query(Usuario).filter(Usuario.nombre_usuario == usuario.nombre_usuario).first()
    if nombre_usuario_existente:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
    
    db_usuario = Usuario(
        id=str(uuid.uuid4()),
        email=usuario.email,
        nombre_usuario=usuario.nombre_usuario,
        contrasena_hash=get_password_hash(usuario.contrasena),
        nombre_completo=usuario.nombre_completo,
        telefono=usuario.telefono,
        activo=usuario.activo,
        es_superusuario=usuario.es_superusuario,
        sucursal_default_id=usuario.sucursal_default_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.put("/{usuario_id}", response_model=UsuarioResponse)
async def actualizar_usuario(
    usuario_id: str,
    usuario_update: UsuarioUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un usuario"""
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if usuario_update.email and usuario_update.email != db_usuario.email:
        usuario_existente = db.query(Usuario).filter(Usuario.email == usuario_update.email).first()
        if usuario_existente:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    if usuario_update.nombre_usuario and usuario_update.nombre_usuario != db_usuario.nombre_usuario:
        nombre_usuario_existente = db.query(Usuario).filter(Usuario.nombre_usuario == usuario_update.nombre_usuario).first()
        if nombre_usuario_existente:
            raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
    
    update_data = usuario_update.model_dump(exclude_unset=True, exclude={"contrasena"})
    for key, value in update_data.items():
        setattr(db_usuario, key, value)
    
    if usuario_update.contrasena:
        db_usuario.contrasena_hash = get_password_hash(usuario_update.contrasena)
    
    db_usuario.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.delete("/{usuario_id}", status_code=204)
async def eliminar_usuario(usuario_id: str, db: Session = Depends(get_db)):
    """Eliminar un usuario"""
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if db_usuario.es_superusuario:
        raise HTTPException(status_code=400, detail="No se puede eliminar un superusuario")
    
    db.delete(db_usuario)
    db.commit()
    return {"message": "Usuario eliminado exitosamente"}
