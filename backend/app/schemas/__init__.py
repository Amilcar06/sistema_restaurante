"""
Pydantic schemas for request/response validation
"""
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemResponse
from app.schemas.recipe import RecipeCreate, RecipeUpdate, RecipeResponse, RecipeIngredientCreate
from app.schemas.sale import SaleCreate, SaleResponse, SaleItemCreate
from app.schemas.chatbot import ChatMessage, ChatResponse
from app.schemas.dashboard import DashboardStats, DashboardResponse

__all__ = [
    "InventoryItemCreate", "InventoryItemUpdate", "InventoryItemResponse",
    "RecipeCreate", "RecipeUpdate", "RecipeResponse", "RecipeIngredientCreate",
    "SaleCreate", "SaleResponse", "SaleItemCreate",
    "ChatMessage", "ChatResponse",
    "DashboardStats", "DashboardResponse"
]

