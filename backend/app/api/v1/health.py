"""
Health check endpoints including database status
"""
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import engine, get_db
from app.core.config import settings
from sqlalchemy import text

router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "GastroSmart AI API",
        "version": "1.0.0"
    }

@router.get("/database")
async def database_health():
    """Check database connection and status"""
    if settings.DATABASE_TYPE != "postgresql":
        return {
            "status": "not_configured",
            "database_type": settings.DATABASE_TYPE,
            "message": "PostgreSQL no está configurado como tipo de base de datos"
        }
    
    try:
        with engine.connect() as connection:
            # Test query
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
            
            # Get database version
            version_result = connection.execute(text("SELECT version()"))
            version = version_result.fetchone()[0]
            
            # Check tables
            tables_result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in tables_result]
            
            return {
                "status": "connected",
                "database_type": "postgresql",
                "version": version.split(",")[0] if version else "unknown",
                "tables_count": len(tables),
                "tables": tables
            }
    except Exception as e:
        return {
            "status": "error",
            "database_type": "postgresql",
            "error": str(e),
            "message": "No se pudo conectar a la base de datos"
        }

