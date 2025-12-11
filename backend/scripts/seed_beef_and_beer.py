
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
from sqlalchemy import text

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    print("🥩🍺 Iniciando seed de 'Beef & Beer' (La Paz, Bolivia)...")
    
    # Clean Database
    print("🗑️  Limpiando base de datos...")
    try:
        Base.metadata.drop_all(bind=engine)
        print("   ✅ Tablas eliminadas.")
    except Exception as e:
        print(f"⚠️  Error en drop_all ({e}), intentando limpieza forzada...")
        with engine.connect() as connection:
            connection.execute(text("DROP SCHEMA public CASCADE;"))
            connection.execute(text("CREATE SCHEMA public;"))
            connection.commit()
            print("   ✅ Schema public recreado.")
            
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Permisos
        print("1️⃣  Creando permisos del sistema...")
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
        print("2️⃣  Definiendo roles de personal...")
        roles_data = [
            {"nombre": "Administrador", "descripcion": "Acceso total - Dueño"},
            {"nombre": "Gerente", "descripcion": "Encargado de sucursal"},
            {"nombre": "Chef Parrillero", "descripcion": "Jefe de cocina y recetas"},
            {"nombre": "Bartender", "descripcion": "Encargado de barra y bebidas"},
            {"nombre": "Mesero", "descripcion": "Atención al cliente"},
            {"nombre": "Cajero", "descripcion": "Cobro y facturación"},
        ]
        
        roles = {}
        for r in roles_data:
            rol = Rol(id=str(uuid.uuid4()), **r, es_sistema=True)
            db.add(rol)
            roles[r["nombre"]] = rol
        db.commit()

        # Asignar permisos a Roles
        # Admin: Todo
        for p in permisos.values():
            db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Administrador"].id, permiso_id=p.id))
        
        # Gerente: Todo menos config global
        for name, p in permisos.items():
            if name != "gestionar_configuracion":
                db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Gerente"].id, permiso_id=p.id))
        
        # Chef: Inventario, Recetas, Compras
        for p_name in ["gestionar_inventario", "gestionar_recetas", "gestionar_compras"]:
            db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Chef Parrillero"].id, permiso_id=permisos[p_name].id))
            
        # Bartender: Inventario (Bebidas) - simplificado acceso a inventario general por ahora
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Bartender"].id, permiso_id=permisos["gestionar_inventario"].id))
        
        # Mesero: Ventas
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Mesero"].id, permiso_id=permisos["gestionar_ventas"].id))
        
        # Cajero: Ventas, Reportes
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Cajero"].id, permiso_id=permisos["gestionar_ventas"].id))
        db.add(PermisoRol(id=str(uuid.uuid4()), rol_id=roles["Cajero"].id, permiso_id=permisos["ver_reportes"].id))
        
        db.commit()

        # 3. Restaurante y Sucursal
        print("3️⃣  Inaugurando 'Beef & Beer'...")
        
        admin_user = Usuario(
            id="usr-admin-001", # Fixed ID
            email="admin@beefandbeer.bo",
            nombre_usuario="admin",
            contrasena_hash=get_password_hash("admin123"),
            nombre_completo="Carlos Dueñas (Propietario)",
            activo=True,
            es_superusuario=True
        )
        db.add(admin_user)
        db.commit()

        restaurante = Restaurante(
            id="rest-001", # Fixed ID
            nombre="Beef & Beer",
            propietario_id=admin_user.id,
            moneda="BOB"
        )
        db.add(restaurante)
        db.commit()

        sucursal = Sucursal(
            id="suc-001", # Fixed ID MATCHING FRONTEND FALLBACK
            nombre="Beef & Beer - Zona Sur",
            direccion="Av. Ballivián esq. Calle 21, Calacoto",
            ciudad="La Paz",
            restaurante_id=restaurante.id,
            es_principal=True,
            activa=True,
            creado_por_id=admin_user.id
        )
        db.add(sucursal)
        db.commit()

        admin_user.sucursal_default_id = sucursal.id
        db.add(UsuarioRol(id=str(uuid.uuid4()), usuario_id=admin_user.id, rol_id=roles["Administrador"].id, sucursal_id=sucursal.id))
        db.commit()
        
        # Configuración inicial
        config = Configuracion(
            id=str(uuid.uuid4()),
            moneda="BOB",
            impuesto_porcentaje=13.0,
            nombre_empresa="Beef & Beer",
            direccion="Av. Ballivián esq. Calle 21, Calacoto",
            telefono="2790000",
            email_contacto="contacto@beefandbeer.bo",
            notif_stock_critico=True,
            notif_reporte_diario=True,
            notif_sugerencias_ia=True,
            notif_margen_bajo=True,
            updated_at=datetime.utcnow()
        )
        db.add(config)
        db.commit()


        # 4. Empleados
        print("4️⃣  Contratando el equipo...")
        empleados_data = [
            {"email": "gerente@beefandbeer.bo", "user": "gerente", "pass": "gerente123", "name": "Sofia Montes", "rol": "Gerente"},
            {"email": "chef@beefandbeer.bo", "user": "chef", "pass": "chef123", "name": "Mario Parrilla", "rol": "Chef Parrillero"},
            {"email": "barra@beefandbeer.bo", "user": "barman", "pass": "bar123", "name": "Jorge Copas", "rol": "Bartender"},
            {"email": "mesero1@beefandbeer.bo", "user": "mesero1", "pass": "mesero123", "name": "Ana Limbert", "rol": "Mesero"},
            {"email": "mesero2@beefandbeer.bo", "user": "mesero2", "pass": "mesero123", "name": "Luis Poma", "rol": "Mesero"},
            {"email": "cajero@beefandbeer.bo", "user": "cajero", "pass": "cajero123", "name": "Carla Cuentas", "rol": "Cajero"},
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
            user_rol = roles.get(emp["rol"]) or roles["Mesero"] # Fallback
            db.add(UsuarioRol(
                id=str(uuid.uuid4()), 
                usuario_id=user.id, 
                rol_id=user_rol.id, 
                sucursal_id=sucursal.id,
                asignado_por_id=admin_user.id
            ))
            empleados_objs.append(user)
        db.commit()

        # 5. Proveedores
        print("5️⃣  Estableciendo proveedores...")
        prov_carne = Proveedor(id=str(uuid.uuid4()), nombre="Frigorífico BFC", nombre_contacto="Roberto Carnes", telefono="77700001", email="ventas@bfc.bo")
        prov_mercado = Proveedor(id=str(uuid.uuid4()), nombre="Mercado Rodríguez", nombre_contacto="Casera Juana", telefono="60612345", email="juana@mercado.bo")
        prov_bebidas = Proveedor(id=str(uuid.uuid4()), nombre="CBN Distribuidora", nombre_contacto="Agente Zona Sur", telefono="800102030", email="pedidos@cbn.bo")
        prov_vinos = Proveedor(id=str(uuid.uuid4()), nombre="Vinos Aranjuez", nombre_contacto="Distribuidor Tarija", telefono="71234567", email="ventas@aranjuez.com")
        prov_panaderia = Proveedor(id=str(uuid.uuid4()), nombre="Panadería Victoria", nombre_contacto="Don Pedro", telefono="22334455", email="pedidos@victoria.bo")
        
        db.add_all([prov_carne, prov_mercado, prov_bebidas, prov_vinos, prov_panaderia])
        db.commit()

        # 6. Inventario (Insumos)
        print("6️⃣  Llenando cámaras de frío y despensa...")
        insumos_data = [
            # Carnes Premium
            {"nombre": "T-Bone Steak (Madurado)", "unidad": "kg", "costo": 85.0, "stock": 40, "min": 10, "cat": "Carnes", "prov": prov_carne.id},
            {"nombre": "Picanha Importada", "unidad": "kg", "costo": 90.0, "stock": 35, "min": 8, "cat": "Carnes", "prov": prov_carne.id},
            {"nombre": "Bife Chorizo", "unidad": "kg", "costo": 65.0, "stock": 50, "min": 12, "cat": "Carnes", "prov": prov_carne.id},
            {"nombre": "Costillar de Cerdo", "unidad": "kg", "costo": 45.0, "stock": 40, "min": 10, "cat": "Carnes", "prov": prov_carne.id},
            {"nombre": "Chorizo Parrillero Artesanal", "unidad": "kg", "costo": 35.0, "stock": 60, "min": 15, "cat": "Carnes", "prov": prov_carne.id},
            
            # Guarniciones
            {"nombre": "Papa Holandesa", "unidad": "kg", "costo": 6.0, "stock": 150, "min": 30, "cat": "Verduras", "prov": prov_mercado.id},
            {"nombre": "Yuca", "unidad": "kg", "costo": 5.0, "stock": 100, "min": 25, "cat": "Verduras", "prov": prov_mercado.id},
            {"nombre": "Arroz", "unidad": "kg", "costo": 8.0, "stock": 50, "min": 10, "cat": "Abarrotes", "prov": prov_mercado.id},
            {"nombre": "Queso Chaqueño", "unidad": "kg", "costo": 45.0, "stock": 20, "min": 5, "cat": "Lácteos", "prov": prov_mercado.id},
            {"nombre": "Lechuga Crespa", "unidad": "unid", "costo": 3.0, "stock": 40, "min": 10, "cat": "Verduras", "prov": prov_mercado.id},
            {"nombre": "Tomate Perita", "unidad": "kg", "costo": 5.0, "stock": 30, "min": 8, "cat": "Verduras", "prov": prov_mercado.id},
            
            # Pan
            {"nombre": "Pan Francés (Baguette)", "unidad": "unid", "costo": 1.0, "stock": 100, "min": 20, "cat": "Panadería", "prov": prov_panaderia.id},
            {"nombre": "Pan de Ajo (Prep)", "unidad": "unid", "costo": 2.5, "stock": 50, "min": 10, "cat": "Panadería", "prov": prov_panaderia.id},
            
            # Bebidas (Beer & More)
            {"nombre": "Huari Tradicional", "unidad": "botella", "costo": 12.0, "stock": 200, "min": 48, "cat": "Bebidas Alcohólicas", "prov": prov_bebidas.id},
            {"nombre": "Huari Miel", "unidad": "botella", "costo": 13.0, "stock": 100, "min": 24, "cat": "Bebidas Alcohólicas", "prov": prov_bebidas.id},
            {"nombre": "Paceña Pico de Oro", "unidad": "botella", "costo": 11.0, "stock": 250, "min": 60, "cat": "Bebidas Alcohólicas", "prov": prov_bebidas.id},
            {"nombre": "Coca Cola 2L", "unidad": "botella", "costo": 11.0, "stock": 80, "min": 12, "cat": "Bebidas", "prov": prov_bebidas.id},
            {"nombre": "Vino Aranjuez Tannat", "unidad": "botella", "costo": 60.0, "stock": 24, "min": 6, "cat": "Bebidas Alcohólicas", "prov": prov_vinos.id},
            
            # Insumos varios
            {"nombre": "Carbón Vegetal", "unidad": "kg", "costo": 4.0, "stock": 500, "min": 100, "cat": "Suministros", "prov": prov_mercado.id},
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

        # 7. Recetas (Menú)
        print("7️⃣  Diseñando el Menú 'Beef & Beer'...")
        # Definir recetas con sus ingredientes (cantidad en unidad del inventario)
        # Formato: {"nombre_receta": { "ingrediente_nombre": cantidad, ... }}
        recetas_ingredientes_map = {
            "T-Bone Steak Especial (500g)": {
                "T-Bone Steak (Madurado)": 0.5, # 500g
                "Papa Holandesa": 0.3,
                "Carbón Vegetal": 0.5
            },
            "Picanha a la Espada": {
                "Picanha Importada": 0.4,
                "Carbón Vegetal": 0.4
            },
            "Bife de Chorizo Clásico": {
                "Bife Chorizo": 0.4,
                "Papa Holandesa": 0.3,
                "Carbón Vegetal": 0.4
            },
            "Costillar BBQ": {
                "Costillar de Cerdo": 0.5,
                "Carbón Vegetal": 0.4
            },
            "Tabla Beef & Beer (4 pers)": {
                "T-Bone Steak (Madurado)": 0.5,
                "Picanha Importada": 0.4,
                "Costillar de Cerdo": 0.4,
                "Chorizo Parrillero Artesanal": 0.4,
                "Papa Holandesa": 0.8,
                "Yuca": 0.5,
                "Carbón Vegetal": 1.5
            },
            "Parrillada Paceña (2 pers)": {
                "Bife Chorizo": 0.3,
                "Chorizo Parrillero Artesanal": 0.2,
                "Papa Holandesa": 0.4,
                "Carbón Vegetal": 0.8
            },
            "Choripán Gourmet": {
                "Chorizo Parrillero Artesanal": 0.15,
                "Pan Francés (Baguette)": 1.0,
                "Carbón Vegetal": 0.1
            },
            "Provoleta Asada": {
                "Queso Chaqueño": 0.2,
                "Pan de Ajo (Prep)": 1.0, # Acompañamiento
                "Carbón Vegetal": 0.2
            },
            "Porción de Papas Fritas": {
                "Papa Holandesa": 0.4
            },
            "Huari Tradicional": { "Huari Tradicional": 1.0 },
            "Huari Miel": { "Huari Miel": 1.0 },
            "Paceña Pico de Oro": { "Paceña Pico de Oro": 1.0 },
            "Jarra de Coca Cola": { "Coca Cola 2L": 0.5 }, # Media botella
            "Vino Aranjuez Tannat": { "Vino Aranjuez Tannat": 1.0 }
        }

        platos_data = [
            # Cortes
            {"nombre": "T-Bone Steak Especial (500g)", "precio": 120.0, "desc": "Corte premium madurado con hueso en T. Incluye 2 guarniciones.", "cat": "Cortes Premium"},
            {"nombre": "Picanha a la Espada", "precio": 95.0, "desc": "Jugosa picanha importada, servida con piña asada.", "cat": "Cortes Premium"},
            {"nombre": "Bife de Chorizo Clásico", "precio": 85.0, "desc": "400g de bife ancho con borde de grasa perfecto.", "cat": "Cortes Tradicionales"},
            {"nombre": "Costillar BBQ", "precio": 75.0, "desc": "Costillas de cerdo bañadas en salsa barbacoa casera.", "cat": "Cortes Tradicionales"},
            
            # Compartir
            {"nombre": "Tabla Beef & Beer (4 pers)", "precio": 350.0, "desc": "Mix de carnes premium, chorizos, morcillas y 4 guarniciones.", "cat": "Para Compartir"},
            {"nombre": "Parrillada Paceña (2 pers)", "precio": 160.0, "desc": "Bife, chuleta, chorizo y corazón de pollo.", "cat": "Para Compartir"},
            
            # Entradas y Guarniciones
            {"nombre": "Choripán Gourmet", "precio": 25.0, "desc": "Chorizo artesanal con chimichurri y salsa criolla.", "cat": "Entradas"},
            {"nombre": "Provoleta Asada", "precio": 45.0, "desc": "Queso fundido con orégano y aceite de oliva.", "cat": "Entradas"},
            {"nombre": "Porción de Papas Fritas", "precio": 20.0, "desc": "Papas bastón crujientes.", "cat": "Guarniciones"},
            
            # Bebidas
            {"nombre": "Huari Tradicional", "precio": 25.0, "desc": "Cerveza premium local.", "cat": "Cervezas"},
            {"nombre": "Huari Miel", "precio": 28.0, "desc": "Cerveza con toque de miel.", "cat": "Cervezas"},
            {"nombre": "Paceña Pico de Oro", "precio": 22.0, "desc": "La clásica de La Paz.", "cat": "Cervezas"},
            {"nombre": "Jarra de Coca Cola", "precio": 25.0, "desc": "Ideal para compartir.", "cat": "Refrescos"},
            {"nombre": "Vino Aranjuez Tannat", "precio": 140.0, "desc": "Botella de vino tinto reserva.", "cat": "Vinos"},
        ]

        platos_map = {}
        for p in platos_data:
            costo_receta = 0
            receta_id = str(uuid.uuid4())
            
            # Calcular costo basado en ingredientes
            ingredientes_map = recetas_ingredientes_map.get(p["nombre"], {})
            
            receta = Receta(
                id=receta_id,
                nombre=p["nombre"],
                descripcion=p["desc"],
                precio=p["precio"],
                categoria=p["cat"],
                sucursal_id=sucursal.id,
                disponible=True
            )
            db.add(receta)
            platos_map[p["nombre"]] = receta
            
            # Crear IngredienteReceta y sumar costo
            for ing_nombre, cantidad in ingredientes_map.items():
                insumo = insumos_map.get(ing_nombre)
                if insumo:
                    costo_ingrediente = insumo.costo_unitario * cantidad
                    costo_receta += costo_ingrediente
                    
                    ing_receta = IngredienteReceta(
                        id=str(uuid.uuid4()),
                        receta_id=receta_id,
                        item_inventario_id=insumo.id,
                        nombre_ingrediente=insumo.nombre,
                        cantidad=cantidad,
                        unidad=insumo.unidad,
                        costo=costo_ingrediente
                    )
                    db.add(ing_receta)
                else:
                    print(f"⚠️  Advertencia: Insumo '{ing_nombre}' no encontrado para receta '{p['nombre']}'")

            # Actualizar costo y margen de la receta
            receta.costo = costo_receta
            if p["precio"] > 0:
                receta.margen = ((p["precio"] - costo_receta) / p["precio"]) * 100
            else:
                receta.margen = 0

        db.commit()

        # 8. Ventas Históricas
        print("8️⃣  Generando historial de ventas (300 ventas)...")
        
        metodos_pago = ["Efectivo", "QR Simple", "Tarjeta Débito/Crédito"]
        clientes_frecuentes = ["Juan Perez", "Maria Gomez", "Carlos Lopez", "Ana Martinez", "Pedro Aliaga", "Claudia Ruiz", "Cliente Casual"]
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=60) # 2 meses de historia
        
        ventas_count = 0
        total_ingresos = 0
        
        for i in range(300):
            # Fecha aleatoria con distribución realista (más ventas vie-sab-dom)
            random_days = random.randint(0, 60)
            fecha_base = start_date + timedelta(days=random_days)
            
            # Si es fin de semana, más probabilidad de venta (simple logic: just random time)
            # Hora almuerzo (12-15) o cena (19-23)
            if random.random() < 0.4: # Almuerzo
                hour = random.randint(12, 15)
            else: # Cena
                hour = random.randint(19, 23)
                
            minute = random.randint(0, 59)
            fecha_venta = fecha_base.replace(hour=hour, minute=minute)
            
            if fecha_venta > end_date:
                continue

            vendedor = random.choice([e for e in empleados_objs if e.nombre_usuario in ["mesero1", "mesero2", "cajero", "barman"]])
            
            # Items de la venta
            is_big_table = random.random() < 0.2
            num_items = random.randint(3, 8) if is_big_table else random.randint(1, 4)
            
            items_venta_seleccionados = []
            for _ in range(num_items):
                # Peso hacia cervezas y cortes
                items_venta_seleccionados.append(random.choice(list(platos_map.values())))

            total_venta = 0.0
            
            venta_id = str(uuid.uuid4())
            venta = Venta(
                id=venta_id,
                numero_venta=f"V-{i+1:05d}",
                fecha_creacion=fecha_venta,
                subtotal=0,
                total=0,
                metodo_pago=random.choice(metodos_pago),
                estado="COMPLETADA",
                nombre_cliente=random.choice(clientes_frecuentes),
                usuario_id=vendedor.id,
                sucursal_id=sucursal.id,
                tipo_venta="LOCAL"
            )
            db.add(venta)
            
            for plato in items_venta_seleccionados:
                cantidad = 1
                if plato.categoria == "Cervezas":
                    cantidad = random.randint(1, 4)
                
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
            
            # Propina aleatoria
            if total_venta > 0:
                propina_calc = total_venta * 0.10
                venta.propina = propina_calc
                venta.total = total_venta + propina_calc
                venta.subtotal = total_venta
            
            total_ingresos += venta.total
            ventas_count += 1
            
            if ventas_count % 50 == 0:
                db.commit()
                print(f"   ... {ventas_count} ventas procesadas")
        
        db.commit()
        print(f"✅ Seed completado! {ventas_count} ventas generadas.")
        print(f"💰 Ingresos aproximados generados: Bs. {total_ingresos:,.2f}")
        
        print("\n🔑 CREDENCIALES DE ACCESO:")
        print("   Admin (Dueño):    admin@beefandbeer.bo / admin123")
        print("   Gerente:          gerente@beefandbeer.bo / gerente123")
        print("   Chef Parrillero:  chef@beefandbeer.bo / chef123")
        print("   Bartender:        barra@beefandbeer.bo / bar123")
        print("   Meseros:          mesero1@beefandbeer.bo / mesero123")
        print("   Cajero:           cajero@beefandbeer.bo / cajero123")

    except Exception as e:
        print(f"❌ Error en seed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
