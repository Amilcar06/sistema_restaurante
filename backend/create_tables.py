import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base
from app.models.usuario import Usuario
from app.models.rol import Rol, Permiso, PermisoRol, UsuarioRol
from app.models.configuracion import Configuracion
# Import other models as needed to ensure they are registered with Base
from app.models.sucursal import Sucursal
from app.models.restaurante import Restaurante
from app.models.proveedor import Proveedor
from app.models.unidad import Unidad
from app.models.item_inventario import ItemInventario
from app.models.receta import Receta
from app.models.venta import Venta
from app.models.promocion import Promocion
from app.models.orden_compra import OrdenCompra
from app.models.movimiento_inventario import MovimientoInventario

def create_tables():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_tables()
