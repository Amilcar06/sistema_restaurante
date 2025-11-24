"""
Database models for GastroSmart AI
"""
from app.core.database import Base

# Import all models here
if Base:
    from app.models.user import User
    from app.models.inventory import InventoryItem
    from app.models.recipe import Recipe, RecipeIngredient
    from app.models.sale import Sale, SaleItem
    from app.models.unit import Unit
    from app.models.supplier import Supplier
    from app.models.business_location import BusinessLocation
    from app.models.inventory_cost_history import InventoryCostHistory
    from app.models.inventory_movement import InventoryMovement
    from app.models.recipe_version import RecipeVersion
    from app.models.recipe_component import RecipeComponent
    from app.models.chatbot_log import ChatbotLog
    from app.models.role import Role, Permission, RolePermission, UserRole
    from app.models.promotion import Promotion, SaleDiscount
    from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem

__all__ = [
    "User",
    "InventoryItem",
    "Recipe",
    "RecipeIngredient",
    "Sale",
    "SaleItem",
    "Unit",
    "Supplier",
    "BusinessLocation",
    "InventoryCostHistory",
    "InventoryMovement",
    "RecipeVersion",
    "RecipeComponent",
    "ChatbotLog",
    "Role",
    "Permission",
    "RolePermission",
    "UserRole",
    "Promotion",
    "SaleDiscount",
    "PurchaseOrder",
    "PurchaseOrderItem"
]

