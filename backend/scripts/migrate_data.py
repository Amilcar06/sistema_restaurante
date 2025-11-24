"""
Script de migración de datos para la nueva estructura de base de datos
Ejecutar después de aplicar las migraciones de Alembic
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.business_location import BusinessLocation
from app.models.unit import Unit
from app.models.inventory import InventoryItem
from app.models.recipe import Recipe
from app.models.sale import Sale
from app.models.inventory_cost_history import InventoryCostHistory
from datetime import datetime
import uuid

def create_default_location(db: Session) -> str:
    """Crea una ubicación por defecto si no existe"""
    default_location = db.query(BusinessLocation).filter(BusinessLocation.is_main == True).first()
    
    if not default_location:
        default_location = BusinessLocation(
            id=str(uuid.uuid4()),
            name="Sucursal Principal",
            address="La Paz, Bolivia",
            city="La Paz",
            is_main=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(default_location)
        db.commit()
        db.refresh(default_location)
        print(f"✅ Creada ubicación por defecto: {default_location.name} (ID: {default_location.id})")
    else:
        print(f"ℹ️  Ubicación por defecto ya existe: {default_location.name} (ID: {default_location.id})")
    
    return default_location.id

def create_default_units(db: Session):
    """Crea unidades base si no existen"""
    units_data = [
        {"code": "g", "name": "Gramo", "type": "weight", "factor_to_base": 1.0},
        {"code": "kg", "name": "Kilogramo", "type": "weight", "factor_to_base": 1000.0},
        {"code": "lb", "name": "Libra", "type": "weight", "factor_to_base": 453.592},
        {"code": "L", "name": "Litro", "type": "volume", "factor_to_base": 1000.0},
        {"code": "mL", "name": "Mililitro", "type": "volume", "factor_to_base": 1.0},
        {"code": "unid", "name": "Unidad", "type": "piece", "factor_to_base": 1.0},
        {"code": "pza", "name": "Pieza", "type": "piece", "factor_to_base": 1.0},
        {"code": "oz", "name": "Onza", "type": "weight", "factor_to_base": 28.3495},
        {"code": "cucharada", "name": "Cucharada", "type": "volume", "factor_to_base": 15.0},
        {"code": "cucharadita", "name": "Cucharadita", "type": "volume", "factor_to_base": 5.0},
    ]
    
    created_count = 0
    for unit_data in units_data:
        existing_unit = db.query(Unit).filter(Unit.code == unit_data["code"]).first()
        if not existing_unit:
            # Buscar unidad base si existe
            base_unit = None
            if unit_data["code"] != "g" and unit_data["code"] != "mL" and unit_data["code"] != "unid":
                if unit_data["type"] == "weight":
                    base_unit = db.query(Unit).filter(Unit.code == "g").first()
                elif unit_data["type"] == "volume":
                    base_unit = db.query(Unit).filter(Unit.code == "mL").first()
            
            unit = Unit(
                id=str(uuid.uuid4()),
                code=unit_data["code"],
                name=unit_data["name"],
                type=unit_data["type"],
                base_unit_id=base_unit.id if base_unit else None,
                factor_to_base=unit_data["factor_to_base"],
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(unit)
            created_count += 1
        else:
            print(f"ℹ️  Unidad ya existe: {unit_data['code']}")
    
    if created_count > 0:
        db.commit()
        print(f"✅ Creadas {created_count} unidades por defecto")
    else:
        print("ℹ️  Todas las unidades ya existen")

def migrate_inventory_items(db: Session, default_location_id: str):
    """Asigna location_id a items de inventario existentes"""
    items_without_location = db.query(InventoryItem).filter(
        (InventoryItem.location_id == None) | (InventoryItem.location_id == "")
    ).all()
    
    if not items_without_location:
        print("ℹ️  Todos los items de inventario ya tienen location_id")
        return
    
    updated_count = 0
    for item in items_without_location:
        item.location_id = default_location_id
        updated_count += 1
        
        # Crear entrada en cost_history si no existe
        existing_history = db.query(InventoryCostHistory).filter(
            InventoryCostHistory.inventory_item_id == item.id
        ).first()
        
        if not existing_history and item.cost_per_unit > 0:
            cost_history = InventoryCostHistory(
                id=str(uuid.uuid4()),
                inventory_item_id=item.id,
                cost_per_unit=item.cost_per_unit,
                date=item.last_updated or datetime.utcnow(),
                reason="migración"
            )
            db.add(cost_history)
    
    db.commit()
    print(f"✅ Actualizados {updated_count} items de inventario con location_id")
    print(f"✅ Creadas entradas en cost_history para items existentes")

def migrate_recipes(db: Session, default_location_id: str):
    """Asigna location_id a recetas existentes"""
    recipes_without_location = db.query(Recipe).filter(
        Recipe.location_id == None
    ).all()
    
    if not recipes_without_location:
        print("ℹ️  Todas las recetas ya tienen location_id")
        return
    
    updated_count = 0
    for recipe in recipes_without_location:
        recipe.location_id = default_location_id
        updated_count += 1
    
    db.commit()
    print(f"✅ Actualizadas {updated_count} recetas con location_id")

def migrate_sales(db: Session, default_location_id: str):
    """Asigna location_id a ventas existentes"""
    sales_without_location = db.query(Sale).filter(
        Sale.location_id == None
    ).all()
    
    if not sales_without_location:
        print("ℹ️  Todas las ventas ya tienen location_id")
        return
    
    updated_count = 0
    for sale in sales_without_location:
        sale.location_id = default_location_id
        # Generar sale_number si no existe
        if not sale.sale_number:
            sale.sale_number = f"V-{sale.created_at.strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        updated_count += 1
    
    db.commit()
    print(f"✅ Actualizadas {updated_count} ventas con location_id y sale_number")

def main():
    """Ejecuta todas las migraciones de datos"""
    print("🚀 Iniciando migración de datos...")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        # 1. Crear ubicación por defecto
        print("\n1️⃣  Creando ubicación por defecto...")
        default_location_id = create_default_location(db)
        
        # 2. Crear unidades base
        print("\n2️⃣  Creando unidades base...")
        create_default_units(db)
        
        # 3. Migrar items de inventario
        print("\n3️⃣  Migrando items de inventario...")
        migrate_inventory_items(db, default_location_id)
        
        # 4. Migrar recetas
        print("\n4️⃣  Migrando recetas...")
        migrate_recipes(db, default_location_id)
        
        # 5. Migrar ventas
        print("\n5️⃣  Migrando ventas...")
        migrate_sales(db, default_location_id)
        
        print("\n" + "=" * 60)
        print("✅ Migración de datos completada exitosamente!")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error durante la migración: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

