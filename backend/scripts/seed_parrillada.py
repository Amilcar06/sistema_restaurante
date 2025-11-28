import sys
import os
import uuid
import random
from datetime import datetime, timedelta
from passlib.context import CryptContext

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models import *

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    print("🔥 Iniciando seed de Parrillada Boliviana...")
    
    # Recrear tablas
    print("🗑️  Limpiando base de datos...")
    try:
        # Intentar drop_all primero
        Base.metadata.drop_all(bind=engine)
    except Exception as e:
        print(f"⚠️  Error en drop_all ({e}), intentando limpieza forzada...")
        # Limpieza forzada para PostgreSQL
        from sqlalchemy import text
        with engine.connect() as connection:
            connection.execute(text("DROP SCHEMA public CASCADE;"))
            connection.execute(text("CREATE SCHEMA public;"))
            connection.commit()
            print("   ✅ Schema public recreado.")
            
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Permisos
        print("1️⃣  Creando permisos...")
        permisos_data = [
            {"nombre": "ver_dashboard", "recurso": "dashboard", "accion": "read", "descripcion": "Ver dashboard principal"},
            {"nombre": "gestionar_usuarios", "recurso": "usuarios", "accion": "manage", "descripcion": "Gestionar usuarios"},
            {"nombre": "gestionar_inventario", "recurso": "inventario", "accion": "manage", "descripcion": "Gestionar inventario"},
            {"nombre": "ver_reportes", "recurso": "reportes", "accion": "read", "descripcion": "Ver reportes"},
            {"nombre": "gestionar_ventas", "recurso": "ventas", "accion": "manage", "descripcion": "Registrar ventas"},
            {"nombre": "gestionar_configuracion", "recurso": "configuracion", "accion": "manage", "descripcion": "Configuración"},
            {"nombre": "gestionar_sucursales", "recurso": "sucursales", "accion": "manage", "descripcion": "Gestionar sucursales"},
            {"nombre": "gestionar_proveedores", "recurso": "proveedores", "accion": "manage", "descripcion": "Gestionar proveedores"},
            {"nombre": "gestionar_roles", "recurso": "roles", "accion": "manage", "descripcion": "Gestionar roles"},
            {"nombre": "gestionar_promociones", "recurso": "promociones", "accion": "manage", "descripcion": "Gestionar promociones"},
            {"nombre": "gestionar_recetas", "recurso": "recetas", "accion": "manage", "descripcion": "Gestionar recetas"},
            {"nombre": "gestionar_compras", "recurso": "ordenes_compra", "accion": "manage", "descripcion": "Gestionar compras"},
        ]
        
        permisos = {}
        for p in permisos_data:
            permiso = Permiso(id=str(uuid.uuid4()), **p)
            db.add(permiso)
            permisos[p["nombre"]] = permiso
        db.commit()

        # 2. Roles
        print("2️⃣  Creando roles...")
        roles_data = [
            {"nombre": "Administrador", "descripcion": "Dueño del negocio"},
            {"nombre": "Gerente", "descripcion": "Encargado de sucursal"},
            {"nombre": "Parrillero", "descripcion": "Jefe de cocina"},
            {"nombre": "Mesero", "descripcion": "Atención al cliente"},
            {"nombre": "Cajero", "descripcion": "Cobro y facturación"},
        ]
        
        roles = {}
        for r in roles_data:
            rol = Rol(id=str(uuid.uuid4()), **r, es_sistema=True)
            db.add(rol)
            roles[r["nombre"]] = rol
        db.commit()

        # Asignar permisos a Admin (Todos)
        for p in permisos.values():
            db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Administrador"].id, permiso_id=p.id))
        
        # Asignar permisos a otros roles (Simplificado)
        # Gerente: Todo menos config global
        for name, p in permisos.items():
            if name != "gestionar_configuracion":
                db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Gerente"].id, permiso_id=p.id))
        
        # Parrillero: Inventario, Recetas
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Parrillero"].id, permiso_id=permisos["gestionar_inventario"].id))
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Parrillero"].id, permiso_id=permisos["gestionar_recetas"].id))
        
        # Mesero: Ventas (Pedidos)
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Mesero"].id, permiso_id=permisos["gestionar_ventas"].id))
        
        # Cajero: Ventas, Reportes
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Cajero"].id, permiso_id=permisos["gestionar_ventas"].id))
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Cajero"].id, permiso_id=permisos["ver_reportes"].id))
        
        db.commit()

        # 3. Restaurante y Sucursal
        print("3️⃣  Creando restaurante 'Parrillada El Buen Gusto'...")
        
        # Crear usuario admin primero para ser propietario
        admin_user = Usuario(
            id=str(uuid.uuid4()),
            email="admin@parrillada.bo",
            nombre_usuario="admin",
            contrasena_hash=get_password_hash("admin123"),
            nombre_completo="Juan Pérez (Dueño)",
            activo=True,
            es_superusuario=True
        )
        db.add(admin_user)
        db.commit()

        restaurante = Restaurante(
            id=str(uuid.uuid4()),
            nombre="Parrillada El Buen Gusto",
            propietario_id=admin_user.id,
            moneda="BOB"
        )
        db.add(restaurante)
        db.commit()

        sucursal = Sucursal(
            id=str(uuid.uuid4()),
            nombre="Sucursal Central - Sopocachi",
            direccion="Av. Ecuador #2543",
            ciudad="La Paz",
            restaurante_id=restaurante.id,
            es_principal=True,
            activa=True,
            creado_por_id=admin_user.id
        )
        db.add(sucursal)
        db.commit()

        # Asignar sucursal a admin
        admin_user.sucursal_default_id = sucursal.id
        db.add(UsuarioRol(id=str(uuid.uuid4()), usuario_id=admin_user.id, rol_id=roles["Administrador"].id, sucursal_id=sucursal.id))
        db.commit()

        # 4. Empleados
        print("4️⃣  Contratando personal (5 empleados)...")
        empleados_data = [
            {"email": "gerente@parrillada.bo", "user": "gerente", "pass": "gerente123", "name": "Maria Lopez", "rol": "Gerente"},
            {"email": "chef@parrillada.bo", "user": "chef", "pass": "chef123", "name": "Carlos Mamani", "rol": "Parrillero"},
            {"email": "mesero1@parrillada.bo", "user": "mesero1", "pass": "mesero123", "name": "Pedro Quispe", "rol": "Mesero"},
            {"email": "mesero2@parrillada.bo", "user": "mesero2", "pass": "mesero123", "name": "Ana Condori", "rol": "Mesero"},
            {"email": "cajero@parrillada.bo", "user": "cajero", "pass": "cajero123", "name": "Luis Choque", "rol": "Cajero"},
        ]

        empleados_objs = []
        for emp in empleados_data:
            user = Usuario(
                id=str(uuid.uuid4()),
                email=emp["email"],
                nombre_usuario=emp["user"],
                contrasena_hash=get_password_hash(emp["pass"]),
                nombre_completo=emp["name"],
                activo=True,
                sucursal_default_id=sucursal.id
            )
            db.add(user)
            db.add(UsuarioRol(
                id=str(uuid.uuid4()), 
                usuario_id=user.id, 
                rol_id=roles[emp["rol"]].id, 
                sucursal_id=sucursal.id,
                asignado_por_id=admin_user.id
            ))
            empleados_objs.append(user)
        db.commit()

        # 5. Proveedores
        print("5️⃣  Registrando proveedores...")
        prov_carne = Proveedor(id=str(uuid.uuid4()), nombre="Frigorífico Los Andes", nombre_contacto="Roberto", telefono="77712345", email="ventas@losandes.bo")
        prov_mercado = Proveedor(id=str(uuid.uuid4()), nombre="Mercado Rodríguez", nombre_contacto="Casera Juana", telefono="60612345")
        prov_bebidas = Proveedor(id=str(uuid.uuid4()), nombre="CBN", nombre_contacto="Distribuidor Zona", telefono="800102030")
        db.add_all([prov_carne, prov_mercado, prov_bebidas])
        db.commit()

        # 6. Inventario (Insumos)
        print("6️⃣  Llenando la despensa...")
        insumos_data = [
            # Carnes
            {"nombre": "Bife Chorizo", "unidad": "kg", "costo": 45.0, "stock": 50, "min": 10, "cat": "Carnes", "prov": prov_carne.id},
            {"nombre": "Pollo Entero", "unidad": "kg", "costo": 18.0, "stock": 100, "min": 20, "cat": "Carnes", "prov": prov_carne.id},
            {"nombre": "Chorizo Parrillero", "unidad": "kg", "costo": 35.0, "stock": 40, "min": 10, "cat": "Carnes", "prov": prov_carne.id},
            {"nombre": "Carne de Res (Cuadril)", "unidad": "kg", "costo": 42.0, "stock": 60, "min": 15, "cat": "Carnes", "prov": prov_carne.id},
            # Guarniciones
            {"nombre": "Papa", "unidad": "kg", "costo": 5.0, "stock": 200, "min": 50, "cat": "Verduras", "prov": prov_mercado.id},
            {"nombre": "Yuca", "unidad": "kg", "costo": 6.0, "stock": 100, "min": 30, "cat": "Verduras", "prov": prov_mercado.id},
            {"nombre": "Arroz", "unidad": "kg", "costo": 8.0, "stock": 50, "min": 10, "cat": "Abarrotes", "prov": prov_mercado.id},
            {"nombre": "Queso", "unidad": "kg", "costo": 30.0, "stock": 20, "min": 5, "cat": "Lácteos", "prov": prov_mercado.id},
            {"nombre": "Lechuga", "unidad": "unid", "costo": 2.0, "stock": 30, "min": 10, "cat": "Verduras", "prov": prov_mercado.id},
            {"nombre": "Tomate", "unidad": "kg", "costo": 4.0, "stock": 20, "min": 5, "cat": "Verduras", "prov": prov_mercado.id},
            # Bebidas
            {"nombre": "Coca Cola 2L", "unidad": "botella", "costo": 10.0, "stock": 100, "min": 24, "cat": "Bebidas", "prov": prov_bebidas.id},
            {"nombre": "Cerveza Paceña", "unidad": "botella", "costo": 12.0, "stock": 200, "min": 48, "cat": "Bebidas", "prov": prov_bebidas.id},
        ]

        insumos_map = {}
        for item in insumos_data:
            insumo = ItemInventario(
                id=str(uuid.uuid4()),
                nombre=item["nombre"],
                unidad=item["unidad"],
                costo_unitario=item["costo"],
                cantidad=item["stock"],
                stock_minimo=item["min"],
                categoria=item["cat"],
                proveedor_id=item["prov"],
                sucursal_id=sucursal.id
            )
            db.add(insumo)
            insumos_map[item["nombre"]] = insumo
        db.commit()

        # 7. Recetas (Platos)
        print("7️⃣  Creando el menú...")
        platos_data = [
            {"nombre": "Parrillada Familiar (4 pers)", "precio": 180.0, "desc": "Carne, pollo, chorizo, guarniciones", "cat": "Platos Fuertes"},
            {"nombre": "Bife Chorizo", "precio": 65.0, "desc": "300g de bife con guarnición", "cat": "Platos Fuertes"},
            {"nombre": "Medio Pollo a la Parrilla", "precio": 45.0, "desc": "Con arroz con queso y ensalada", "cat": "Platos Fuertes"},
            {"nombre": "Pacumutu de Res", "precio": 55.0, "desc": "Brocheta de carne con vegetales", "cat": "Platos Fuertes"},
            {"nombre": "Choripán", "precio": 15.0, "desc": "Chorizo parrillero en pan francés", "cat": "Entradas"},
            {"nombre": "Coca Cola 2L", "precio": 18.0, "desc": "Gaseosa familiar", "cat": "Bebidas"},
            {"nombre": "Cerveza Paceña", "precio": 20.0, "desc": "Botella 620ml", "cat": "Bebidas"},
        ]

        platos_map = {}
        for p in platos_data:
            receta = Receta(
                id=str(uuid.uuid4()),
                nombre=p["nombre"],
                descripcion=p["desc"],
                precio=p["precio"],
                categoria=p["cat"],
                sucursal_id=sucursal.id,
                disponible=True
            )
            db.add(receta)
            platos_map[p["nombre"]] = receta
        db.commit()

        # 8. Ventas (200 ventas históricas)
        print("8️⃣  Simulando 200 ventas históricas...")
        
        metodos_pago = ["Efectivo", "QR", "Tarjeta"]
        clientes_frecuentes = ["Juan Perez", "Maria Gomez", "Carlos Lopez", "Ana Martinez", "Cliente Casual"]
        
        # Generar ventas en los últimos 30 días
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        ventas_count = 0
        for i in range(200):
            # Fecha aleatoria
            random_days = random.randint(0, 30)
            random_seconds = random.randint(0, 86400)
            fecha_venta = start_date + timedelta(days=random_days, seconds=random_seconds)
            
            # Empleado aleatorio (Mesero o Cajero)
            vendedor = random.choice([e for e in empleados_objs if e.nombre_usuario in ["mesero1", "mesero2", "cajero"]])
            
            # Items de la venta (1 a 4 items)
            num_items = random.randint(1, 4)
            items_venta_seleccionados = random.sample(list(platos_map.values()), num_items)
            
            total_venta = 0.0
            
            # Crear objeto Venta
            venta_id = str(uuid.uuid4())
            venta = Venta(
                id=venta_id,
                numero_venta=f"V-{i+1:05d}",
                fecha_creacion=fecha_venta,
                subtotal=0, # Se actualiza luego
                total=0, # Se actualiza luego
                metodo_pago=random.choice(metodos_pago),
                estado="COMPLETADA",
                nombre_cliente=random.choice(clientes_frecuentes),
                usuario_id=vendedor.id,
                sucursal_id=sucursal.id,
                tipo_venta="LOCAL"
            )
            db.add(venta)
            
            # Agregar detalles (ItemVenta)
            for plato in items_venta_seleccionados:
                cantidad = random.randint(1, 2)
                precio = plato.precio
                subtotal_item = precio * cantidad
                total_venta += subtotal_item
                
                item_venta = ItemVenta(
                    id=str(uuid.uuid4()),
                    venta_id=venta_id,
                    receta_id=plato.id,
                    nombre_item=plato.nombre,
                    cantidad=cantidad,
                    precio_unitario=precio,
                    total=subtotal_item
                )
                db.add(item_venta)
            
            venta.subtotal = total_venta
            venta.total = total_venta
            ventas_count += 1
            
            # Commit cada 20 ventas para no saturar
            if ventas_count % 20 == 0:
                db.commit()
                print(f"   ... {ventas_count} ventas registradas")
        
        db.commit()
        print(f"✅ Seed completado! {ventas_count} ventas generadas.")
        print("\n🔑 Credenciales de Acceso:")
        print("   Admin: admin@parrillada.bo / admin123")
        print("   Gerente: gerente@parrillada.bo / gerente123")
        print("   Mesero: mesero1@parrillada.bo / mesero123")
        print("   Cajero: cajero@parrillada.bo / cajero123")

    except Exception as e:
        print(f"❌ Error en seed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
