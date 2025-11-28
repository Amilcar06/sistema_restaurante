"""
API v1 routes
"""
from fastapi import APIRouter
from app.api.v1 import (
    usuarios, 
    sucursales, 
    inventario, 
    recetas, 
    ventas, 
    promociones, 
    proveedores, 
    movimientos_inventario, 
    ordenes_compra,
    onboarding,
    health,
    enums,
    chatbot, 
    dashboard, 
    reports, 
    roles,
    configuracion,
    auth,
    password_recovery,
    # alerts 
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(enums.router, prefix="/enums", tags=["enums"])

# Nuevos routers en español
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["usuarios"])
api_router.include_router(sucursales.router, prefix="/sucursales", tags=["sucursales"])
api_router.include_router(inventario.router, prefix="/inventario", tags=["inventario"])
api_router.include_router(recetas.router, prefix="/recetas", tags=["recetas"])
api_router.include_router(ventas.router, prefix="/ventas", tags=["ventas"])
api_router.include_router(promociones.router, prefix="/promociones", tags=["promociones"])
api_router.include_router(proveedores.router, prefix="/proveedores", tags=["proveedores"])
api_router.include_router(movimientos_inventario.router, prefix="/movimientos-inventario", tags=["movimientos-inventario"])
api_router.include_router(ordenes_compra.router, prefix="/ordenes-compra", tags=["ordenes-compra"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(configuracion.router, prefix="/configuracion", tags=["configuracion"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(password_recovery.router, tags=["password-recovery"])

# Pendientes
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
# api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
