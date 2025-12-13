"""
API de Roles en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.rol import RolCreate, RolUpdate, RolResponse, PermisoResponse
from app.core.database import get_db
from app.models.rol import Rol, Permiso, PermisoRol

router = APIRouter()

@router.get("/permisos", response_model=List[PermisoResponse])
async def obtener_permisos(db: Session = Depends(get_db)):
    """Obtener todos los permisos disponibles"""
    permisos = db.query(Permiso).order_by(Permiso.recurso, Permiso.nombre).all()
    return permisos

@router.get("/", response_model=List[RolResponse])
async def obtener_roles(db: Session = Depends(get_db)):
    """Obtener todos los roles"""
    roles = db.query(Rol).order_by(desc(Rol.fecha_creacion)).all()
    return roles

@router.get("/{rol_id}", response_model=RolResponse)
async def obtener_rol(rol_id: str, db: Session = Depends(get_db)):
    """Obtener un rol específico"""
    rol = db.query(Rol).filter(Rol.id == rol_id).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol

@router.post("/", response_model=RolResponse, status_code=201)
async def crear_rol(rol: RolCreate, db: Session = Depends(get_db)):
    """Crear un nuevo rol"""
    rol_existente = db.query(Rol).filter(Rol.nombre == rol.nombre).first()
    if rol_existente:
        raise HTTPException(status_code=400, detail="El nombre del rol ya existe")
    
    db_rol = Rol(
        id=str(uuid.uuid4()),
        nombre=rol.nombre,
        descripcion=rol.descripcion,
        es_sistema=rol.es_sistema,
        fecha_creacion=datetime.utcnow()
    )
    db.add(db_rol)
    db.commit()
    db.refresh(db_rol)

    # Asignar permisos
    if rol.permisos:
        for permiso_id in rol.permisos:
            permiso = db.query(Permiso).filter(Permiso.id == permiso_id).first()
            if permiso:
                permiso_rol = PermisoRol(
                    id=str(uuid.uuid4()),
                    rol_id=db_rol.id,
                    permiso_id=permiso.id
                )
                db.add(permiso_rol)
        db.commit()
        db.refresh(db_rol)
    
    return db_rol

@router.put("/{rol_id}", response_model=RolResponse)
async def actualizar_rol(
    rol_id: str,
    rol_update: RolUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un rol"""
    db_rol = db.query(Rol).filter(Rol.id == rol_id).first()
    if not db_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    
    # Permitir editar roles de sistema, pero con restricciones
    if db_rol.es_sistema:
        # No permitir cambiar nombre ni descripción de roles de sistema para mantener consistencia
        if rol_update.nombre and rol_update.nombre != db_rol.nombre:
             raise HTTPException(status_code=400, detail="No se puede cambiar el nombre de un rol de sistema")
        
        # Solo permitir actualizar permisos
        if rol_update.permisos is not None:
             pass # Continuar a la lógica de permisos
        else:
             # Si intenta cambiar otra cosa y es sistema, pero no permisos (y pasó la validación de nombre arriba si era igual)
             # En realidad, permitamos cambiar descripción si quieren.
             pass

    if rol_update.nombre and rol_update.nombre != db_rol.nombre:
        rol_existente = db.query(Rol).filter(Rol.nombre == rol_update.nombre).first()
        if rol_existente:
            raise HTTPException(status_code=400, detail="El nombre del rol ya existe")
    
    update_data = rol_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        # Protegemos campos críticos en roles de sistema
        if db_rol.es_sistema and key in ["nombre", "es_sistema"]:
            continue
            
        if key != "permisos":
            setattr(db_rol, key, value)
    
    # Actualizar permisos si se proporcionan
    if rol_update.permisos is not None:
        # Eliminar permisos existentes
        db.query(PermisoRol).filter(PermisoRol.rol_id == rol_id).delete()
        
        # Asignar nuevos permisos
        for permiso_id in rol_update.permisos:
            permiso = db.query(Permiso).filter(Permiso.id == permiso_id).first()
            if permiso:
                permiso_rol = PermisoRol(
                    id=str(uuid.uuid4()),
                    rol_id=db_rol.id,
                    permiso_id=permiso.id
                )
                db.add(permiso_rol)
    
    db.commit()
    db.refresh(db_rol)
    return db_rol

@router.delete("/{rol_id}", status_code=204)
async def eliminar_rol(rol_id: str, db: Session = Depends(get_db)):
    """Eliminar un rol"""
    db_rol = db.query(Rol).filter(Rol.id == rol_id).first()
    if not db_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    
    if db_rol.es_sistema:
        raise HTTPException(status_code=400, detail="No se pueden eliminar roles del sistema")
    
    db.delete(db_rol)
    db.commit()
    return {"message": "Rol eliminado exitosamente"}
