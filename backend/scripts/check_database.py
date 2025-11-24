#!/usr/bin/env python3
"""
Script para verificar la conexión a PostgreSQL y crear las tablas
"""
import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import engine, Base
from app.models import InventoryItem, Recipe, RecipeIngredient, Sale, SaleItem, User

def check_database_connection():
    """Verifica la conexión a la base de datos"""
    print("=" * 60)
    print("VERIFICACIÓN DE BASE DE DATOS POSTGRESQL")
    print("=" * 60)
    
    # Verificar configuración
    print(f"\n📋 Configuración:")
    print(f"   Tipo de BD: {settings.DATABASE_TYPE}")
    print(f"   URL de BD: {settings.DATABASE_URL}")
    
    if settings.DATABASE_TYPE != "postgresql":
        print("\n❌ ERROR: DATABASE_TYPE no está configurado como 'postgresql'")
        print(f"   Valor actual: {settings.DATABASE_TYPE}")
        print("   Edita el archivo .env y cambia DATABASE_TYPE=postgresql")
        return False
    
    # Intentar conectar
    print(f"\n🔌 Intentando conectar a PostgreSQL...")
    try:
        with engine.connect() as connection:
            print("   ✅ Conexión exitosa a PostgreSQL!")
            
            # Verificar que la base de datos existe
            result = connection.execute("SELECT version();")
            version = result.fetchone()[0]
            print(f"   📊 Versión de PostgreSQL: {version.split(',')[0]}")
            
            return True
    except Exception as e:
        print(f"   ❌ ERROR al conectar a PostgreSQL:")
        print(f"   {str(e)}")
        print("\n💡 Soluciones posibles:")
        print("   1. Verifica que PostgreSQL esté corriendo:")
        print("      - macOS: brew services start postgresql")
        print("      - Linux: sudo systemctl start postgresql")
        print("      - Windows: Verifica el servicio en Services")
        print("   2. Verifica las credenciales en .env:")
        print(f"      DATABASE_URL={settings.DATABASE_URL}")
        print("   3. Crea la base de datos si no existe:")
        print("      createdb gastrosmart")
        return False

def check_tables():
    """Verifica si las tablas existen"""
    print(f"\n📊 Verificando tablas...")
    try:
        with engine.connect() as connection:
            # Obtener lista de tablas
            result = connection.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            tables = [row[0] for row in result]
            
            expected_tables = [
                'users',
                'inventory_items',
                'recipes',
                'recipe_ingredients',
                'sales',
                'sale_items'
            ]
            
            print(f"   Tablas encontradas: {len(tables)}")
            for table in expected_tables:
                if table in tables:
                    print(f"   ✅ {table}")
                else:
                    print(f"   ❌ {table} (no existe)")
            
            if len(tables) == 0:
                print("\n   ⚠️  No hay tablas. Necesitas ejecutar las migraciones.")
                print("   Ejecuta: alembic upgrade head")
                return False
            
            return True
    except Exception as e:
        print(f"   ❌ Error al verificar tablas: {str(e)}")
        return False

def create_tables():
    """Crea las tablas si no existen"""
    print(f"\n🔨 Creando tablas...")
    try:
        Base.metadata.create_all(bind=engine)
        print("   ✅ Tablas creadas exitosamente!")
        return True
    except Exception as e:
        print(f"   ❌ Error al crear tablas: {str(e)}")
        return False

def main():
    """Función principal"""
    print("\n" + "=" * 60)
    print("GASTROSMART AI - VERIFICACIÓN DE BASE DE DATOS")
    print("=" * 60 + "\n")
    
    # Verificar conexión
    if not check_database_connection():
        sys.exit(1)
    
    # Verificar tablas
    tables_exist = check_tables()
    
    if not tables_exist:
        print("\n💡 ¿Deseas crear las tablas ahora? (s/n): ", end="")
        response = input().strip().lower()
        if response == 's':
            if create_tables():
                print("\n✅ ¡Base de datos configurada correctamente!")
            else:
                sys.exit(1)
        else:
            print("\n⚠️  Las tablas no están creadas. Ejecuta 'alembic upgrade head' o este script nuevamente.")
            sys.exit(1)
    else:
        print("\n✅ ¡Base de datos configurada correctamente!")
        print("\n" + "=" * 60)

if __name__ == "__main__":
    main()

