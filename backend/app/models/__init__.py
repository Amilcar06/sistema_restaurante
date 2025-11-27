"""
Database models for GastroSmart AI
"""
from app.core.database import Base

# Import all models here
if Base:
    from app.models.usuario import Usuario
    from app.models.sucursal import Sucursal
    from app.models.restaurante import Restaurante
    from app.models.unidad import Unidad
    from app.models.proveedor import Proveedor
    from app.models.item_inventario import ItemInventario
    from app.models.movimiento_inventario import MovimientoInventario
    from app.models.historial_costo_inventario import HistorialCostoInventario
    from app.models.receta import Receta, IngredienteReceta
    from app.models.version_receta import VersionReceta
    from app.models.venta import Venta, ItemVenta
    from app.models.promocion import Promocion, DescuentoVenta
    from app.models.orden_compra import OrdenCompra, ItemOrdenCompra
    from app.models.rol import Rol, Permiso, PermisoRol, UsuarioRol
    # from app.models.chatbot_log import ChatbotLog # Pendiente

__all__ = [
    "Usuario",
    "Sucursal",
    "Restaurante",
    "Unidad",
    "Proveedor",
    "ItemInventario",
    "MovimientoInventario",
    "HistorialCostoInventario",
    "Receta",
    "IngredienteReceta",
    "VersionReceta",
    "Venta",
    "ItemVenta",
    "Promocion",
    "DescuentoVenta",
    "OrdenCompra",
    "ItemOrdenCompra",
    "Rol",
    "Permiso",
    "PermisoRol",
    "UsuarioRol"
]
