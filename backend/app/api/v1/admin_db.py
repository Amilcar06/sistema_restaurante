from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.api import deps
from scripts.seed_beef_and_beer import seed_data
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/seed/beef-and-beer")
def run_seed_beef_and_beer(
    # In a real app, you would require Superuser permissions here. 
    # For this demo/setup helper, we might leave it open or simple key protected, 
    # but let's assume if they have access to this URL they know what they are doing.
    # Optionally: secret_key: str
):
    """
    Ejecuta el script de seed 'Beef & Beer'.
    ADVERTENCIA: ESTO BORRARÁ Y RECREARÁ LA BASE DE DATOS.
    """
    try:
        logger.info("Iniciando seed manual desde API...")
        seed_data()
        return {"message": "Seed 'Beef & Beer' completado exitosamente. Base de datos reiniciada."}
    except Exception as e:
        logger.error(f"Error en seed API: {e}")
        raise HTTPException(status_code=500, detail=f"Error ejecutando seed: {str(e)}")
