import sys
import os
import uuid
from datetime import datetime
from passlib.context import CryptContext

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models import *

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    print("🌱 Iniciando seed de datos...")
    db = SessionLocal()
    try:
        # 1. Crear Permisos Básicos
        print("1️⃣  Creando permisos...")
        permisos = [
            {"nombre": "ver_dashboard", "recurso": "dashboard", "accion": "read", "descripcion": "Ver dashboard principal"},
            {"nombre": "gestionar_usuarios", "recurso": "usuarios", "accion": "manage", "descripcion": "Crear, editar y eliminar usuarios"},
            {"nombre": "gestionar_inventario", "recurso": "inventario", "accion": "manage", "descripcion": "Gestionar inventario"},
            {"nombre": "ver_reportes", "recurso": "reportes", "accion": "read", "descripcion": "Ver reportes"},
            {"nombre": "gestionar_ventas", "recurso": "ventas", "accion": "manage", "descripcion": "Registrar ventas"},
            {"nombre": "gestionar_configuracion", "recurso": "configuracion", "accion": "manage", "descripcion": "Gestionar configuración del sistema"},
            {"nombre": "gestionar_sucursales", "recurso": "sucursales", "accion": "manage", "descripcion": "Gestionar sucursales"},
            {"nombre": "gestionar_proveedores", "recurso": "proveedores", "accion": "manage", "descripcion": "Gestionar proveedores"},
            {"nombre": "gestionar_roles", "recurso": "roles", "accion": "manage", "descripcion": "Gestionar roles y permisos"},
            {"nombre": "gestionar_promociones", "recurso": "promociones", "accion": "manage", "descripcion": "Gestionar promociones"},
            {"nombre": "gestionar_recetas", "recurso": "recetas", "accion": "manage", "descripcion": "Gestionar recetas"},
            {"nombre": "gestionar_compras", "recurso": "ordenes_compra", "accion": "manage", "descripcion": "Gestionar órdenes de compra"},
        ]
        
        permisos_db = []
        for p in permisos:
            permiso = db.query(Permiso).filter(Permiso.nombre == p["nombre"]).first()
            if not permiso:
                permiso = Permiso(id=str(uuid.uuid4()), **p)
                db.add(permiso)
            permisos_db.append(permiso)
        db.commit()

        # 2. Crear Roles
        print("2️⃣  Creando roles...")
        roles = [
            {"nombre": "Administrador", "descripcion": "Acceso total al sistema", "es_sistema": True},
            {"nombre": "Gerente", "descripcion": "Gestión de sucursal", "es_sistema": True},
            {"nombre": "Cajero", "descripcion": "Registro de ventas", "es_sistema": True},
            {"nombre": "Cocinero", "descripcion": "Gestión de cocina e inventario", "es_sistema": True},
            {"nombre": "Mesero", "descripcion": "Toma de pedidos", "es_sistema": True},
        ]
        
        roles_db = {}
        for r in roles:
            rol = db.query(Rol).filter(Rol.nombre == r["nombre"]).first()
            if not rol:
                rol = Rol(id=str(uuid.uuid4()), **r)
                db.add(rol)
            roles_db[r["nombre"]] = rol
        db.commit()

        # 3. Asignar permisos a Admin (todos)
        admin_rol = roles_db["Administrador"]
        for permiso in permisos_db:
            exists = db.query(PermisoRol).filter_by(rol_id=admin_rol.id, permiso_id=permiso.id).first()
            if not exists:
                db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=admin_rol.id, permiso_id=permiso.id))
        db.commit()

        # 4. Crear Superusuario
        print("3️⃣  Creando superusuario...")
        email = "admin@gastrosmart.ai"
        user = db.query(Usuario).filter(Usuario.email == email).first()
        if not user:
            user = Usuario(
                id=str(uuid.uuid4()),
                email=email,
                nombre_usuario="admin",
                contrasena_hash=get_password_hash("admin123"),
                nombre_completo="Administrador Sistema",
                activo=True,
                es_superusuario=True
            )
            db.add(user)
            db.commit()
            print(f"   ✅ Usuario creado: {email} / admin123")
        else:
            print(f"   ℹ️  Usuario ya existe: {email}")

        # 5. Crear Restaurante Demo
        print("4️⃣  Creando restaurante demo...")
        restaurante = db.query(Restaurante).filter(Restaurante.nombre == "GastroSmart Demo").first()
        if not restaurante:
            restaurante = Restaurante(
                id=str(uuid.uuid4()),
                nombre="GastroSmart Demo",
                propietario_id=user.id,
                moneda="BOB"
            )
            db.add(restaurante)
            db.commit()
        
        # 6. Crear Sucursal Principal
        print("5️⃣  Creando sucursal principal...")
        sucursal = db.query(Sucursal).filter(Sucursal.restaurante_id == restaurante.id, Sucursal.es_principal == True).first()
        if not sucursal:
            sucursal = Sucursal(
                id=str(uuid.uuid4()),
                nombre="Sucursal Central",
                direccion="Av. Principal 123",
                ciudad="La Paz",
                restaurante_id=restaurante.id,
                es_principal=True,
                activa=True,
                creado_por_id=user.id
            )
            db.add(sucursal)
            db.commit()

        # Asignar sucursal default al usuario
        user.sucursal_default_id = sucursal.id
        db.add(user)
        
        # Asignar Rol Admin al usuario en la sucursal
        exists = db.query(UsuarioRol).filter_by(usuario_id=user.id, rol_id=admin_rol.id, sucursal_id=sucursal.id).first()
        if not exists:
            db.add(UsuarioRol(
                id=str(uuid.uuid4()),
                usuario_id=user.id,
                rol_id=admin_rol.id,
                sucursal_id=sucursal.id,
                asignado_por_id=user.id
            ))
        
        db.commit()
        print("✅ Seed completado exitosamente.")

    except Exception as e:
        print(f"❌ Error en seed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
