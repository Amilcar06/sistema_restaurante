"""
Modelo de Usuario en Español
"""
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nombre_usuario = Column(String, unique=True, index=True, nullable=False)
    contrasena_hash = Column(String, nullable=False)
    nombre_completo = Column(String)
    telefono = Column(String)
    activo = Column(Boolean, default=True)
    es_superusuario = Column(Boolean, default=False)
    
    # Sucursal por defecto al iniciar sesión
    sucursal_default_id = Column(String, ForeignKey("sucursales.id", use_alter=True, name="fk_usuario_sucursal_default"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ultimo_acceso = Column(DateTime)
    
    # Relaciones
    sucursal_default = relationship("Sucursal", foreign_keys=[sucursal_default_id], back_populates="usuarios_default")
    roles = relationship("UsuarioRol", foreign_keys="UsuarioRol.usuario_id", back_populates="usuario")
    restaurantes_propios = relationship("Restaurante", back_populates="propietario")
    # chatbot_logs = relationship("ChatbotLog", back_populates="usuario") # Pendiente refactorizar ChatbotLog

    @property
    def permisos(self):
        """
        Retorna una lista plana de los nombres de permisos asignados al usuario
        a través de sus roles.
        """
        perms = set()
        if self.es_superusuario:
            # Superusuario tiene todos los permisos (esto es una simplificación, 
            # idealmente deberíamos listar todos los permisos existentes o manejarlo en la lógica)
            # Por ahora retornamos una lista especial o todos los permisos si los consultamos.
            # Para mantenerlo simple y compatible con el frontend, retornamos un permiso especial 'admin'
            # y también podríamos consultar todos los permisos de la BD si fuera necesario.
            perms.add("admin")
            perms.add("all")
        
        for usuario_rol in self.roles:
            if usuario_rol.rol:
                for permiso_rol in usuario_rol.rol.permisos:
                    if permiso_rol.permiso:
                        perms.add(permiso_rol.permiso.nombre)
        return list(perms)

    @property
    def rol_id(self):
        """
        Retorna el ID del primer rol asignado (para compatibilidad con frontend simple).
        """
        if self.roles and len(self.roles) > 0:
            return self.roles[0].rol_id
        return None
