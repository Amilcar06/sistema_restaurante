"""
Role and Permission models for PostgreSQL
Sistema de roles y permisos
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)  # admin, manager, cashier, cook, waiter
    description = Column(Text)
    is_system = Column(Boolean, default=False)  # Roles del sistema no se pueden eliminar
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    users = relationship("UserRole", back_populates="role")
    permissions = relationship("RolePermission", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)  # inventory.create, sales.delete, etc.
    resource = Column(String, nullable=False)  # inventory, sales, recipes, etc.
    action = Column(String, nullable=False)  # create, read, update, delete, export
    description = Column(Text)
    
    # Relaciones
    roles = relationship("RolePermission", back_populates="permission")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    id = Column(String, primary_key=True, index=True)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(String, ForeignKey("permissions.id"), nullable=False)
    
    # Relaciones
    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="roles")
    
    __table_args__ = (UniqueConstraint('role_id', 'permission_id'),)

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    location_id = Column(String, ForeignKey("business_locations.id"))  # Rol específico por sucursal
    assigned_at = Column(DateTime, default=datetime.utcnow)
    assigned_by = Column(String, ForeignKey("users.id"))
    
    # Relaciones
    user = relationship("User", foreign_keys=[user_id], back_populates="roles")
    role = relationship("Role", back_populates="users")
    location = relationship("BusinessLocation", back_populates="user_roles")
    assigner = relationship("User", foreign_keys=[assigned_by])
    
    __table_args__ = (UniqueConstraint('user_id', 'role_id', 'location_id'),)

