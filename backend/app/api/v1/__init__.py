"""
API v1 routes
"""
from fastapi import APIRouter
from app.api.v1 import inventory, recipes, sales, chatbot, dashboard, health, reports, alerts, enums, business_locations, suppliers, users, promotions, inventory_movements

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(enums.router, prefix="/enums", tags=["enums"])
api_router.include_router(business_locations.router, prefix="/business-locations", tags=["business-locations"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(promotions.router, prefix="/promotions", tags=["promotions"])
api_router.include_router(inventory_movements.router, prefix="/inventory-movements", tags=["inventory-movements"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])

