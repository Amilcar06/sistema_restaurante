import sys
import os
import shutil
from sqlalchemy import text

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base
# Import all models to ensure they are registered
from app.models import * 

def reset_database():
    print("🔄 Iniciando reset de base de datos...")
    
    # 1. Drop all tables
    print("🗑️  Eliminando tablas existentes...")
    try:
        # Reflect all tables from DB to ensure we drop everything, even old English tables
        Base.metadata.reflect(bind=engine)
        Base.metadata.drop_all(bind=engine)
        
        # Manually drop alembic_version if it persists
        with engine.connect() as connection:
            connection.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
            connection.commit()
        print("✅ Tablas eliminadas.")
    except Exception as e:
        print(f"⚠️  Advertencia al eliminar tablas: {e}")

    # 2. Delete migration files
    print("🗑️  Eliminando migraciones antiguas...")
    versions_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "alembic", "versions")
    if os.path.exists(versions_dir):
        for filename in os.listdir(versions_dir):
            if filename.endswith(".py") and filename != "__init__.py":
                file_path = os.path.join(versions_dir, filename)
                os.remove(file_path)
                print(f"   - Eliminado: {filename}")
    
    # 3. Generate new migration
    print("📝 Generando nueva migración en español...")
    # Use quotes for paths with spaces
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cmd_revision = f'cd "{base_dir}" && alembic revision --autogenerate -m "Refactor completo a español"'
    print(f"Exec: {cmd_revision}")
    exit_code = os.system(cmd_revision)
    if exit_code != 0:
        print("❌ Error al generar migración.")
        return

    # 4. Apply migration
    print("🚀 Aplicando migración...")
    cmd_upgrade = f'cd "{base_dir}" && alembic upgrade head'
    print(f"Exec: {cmd_upgrade}")
    exit_code = os.system(cmd_upgrade)
    if exit_code != 0:
        print("❌ Error al aplicar migración.")
        return
    
    print("✅ Base de datos reseteada y actualizada exitosamente.")

if __name__ == "__main__":
    from app.core.config import settings
    print(f"DEBUG: DATABASE_URL={settings.DATABASE_URL}")
    reset_database()
