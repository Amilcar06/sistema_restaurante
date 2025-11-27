"""
Modelos de Roles y Permisos en Español
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Rol(Base):
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False, index=True)  # admin, gerente, cajero, cocinero, mesero
    descripcion = Column(Text)
    es_sistema = Column(Boolean, default=False)  # Roles del sistema no se pueden eliminar
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    usuarios = relationship("UsuarioRol", back_populates="rol")
    permisos = relationship("PermisoRol", back_populates="rol")

class Permiso(Base):
    __tablename__ = "permisos"
    
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False, index=True)  # inventario.crear, ventas.eliminar
    recurso = Column(String, nullable=False)  # inventario, ventas, recetas
    accion = Column(String, nullable=False)  # crear, leer, actualizar, eliminar, exportar
    descripcion = Column(Text)
    
    # Relaciones
    roles = relationship("PermisoRol", back_populates="permiso")

class PermisoRol(Base):
    __tablename__ = "permisos_rol"
    
    id = Column(String, primary_key=True, index=True)
    rol_id = Column(String, ForeignKey("roles.id"), nullable=False)
    permiso_id = Column(String, ForeignKey("permisos.id"), nullable=False)
    
    # Relaciones
    rol = relationship("Rol", back_populates="permisos")
    permiso = relationship("Permiso", back_populates="roles")
    
    __table_args__ = (UniqueConstraint('rol_id', 'permiso_id'),)

class UsuarioRol(Base):
    __tablename__ = "usuarios_rol"
    
    id = Column(String, primary_key=True, index=True)
    usuario_id = Column(String, ForeignKey("usuarios.id"), nullable=False)
    rol_id = Column(String, ForeignKey("roles.id"), nullable=False)
    sucursal_id = Column(String, ForeignKey("sucursales.id"))  # Rol específico por sucursal
    fecha_asignacion = Column(DateTime, default=datetime.utcnow)
    asignado_por_id = Column(String, ForeignKey("usuarios.id"))
    
    # Relaciones
    usuario = relationship("Usuario", foreign_keys=[usuario_id], back_populates="roles")
    rol = relationship("Rol", back_populates="usuarios")
    sucursal = relationship("Sucursal") # back_populates="usuarios_rol" (pendiente en Sucursal)
    asignador = relationship("Usuario", foreign_keys=[asignado_por_id])
    
    __table_args__ = (UniqueConstraint('usuario_id', 'rol_id', 'sucursal_id'),)
