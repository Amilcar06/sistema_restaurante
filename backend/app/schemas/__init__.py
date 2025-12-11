"""
Pydantic schemas for request/response validation
"""
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.schemas.sucursal import SucursalCreate, SucursalUpdate, SucursalResponse
from app.schemas.restaurante import RestauranteCreate, RestauranteUpdate, RestauranteResponse
from app.schemas.item_inventario import ItemInventarioCreate, ItemInventarioUpdate, ItemInventarioResponse
from app.schemas.receta import RecetaCreate, RecetaUpdate, RecetaResponse
from app.schemas.venta import VentaCreate, VentaResponse
from app.schemas.dashboard import EstadisticasDashboard, DashboardResponse

from app.schemas.chatbot import MensajeChat, RespuestaChat

__all__ = [
    "UsuarioCreate", "UsuarioUpdate", "UsuarioResponse",
    "SucursalCreate", "SucursalUpdate", "SucursalResponse",
    "RestauranteCreate", "RestauranteUpdate", "RestauranteResponse",
    "ItemInventarioCreate", "ItemInventarioUpdate", "ItemInventarioResponse",
    "RecetaCreate", "RecetaUpdate", "RecetaResponse",
    "VentaCreate", "VentaResponse",
    "EstadisticasDashboard", "DashboardResponse",
    "MensajeChat", "RespuestaChat"
]
