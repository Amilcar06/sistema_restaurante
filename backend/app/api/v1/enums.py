"""
API endpoint to get available enums for frontend
"""
from fastapi import APIRouter
from app.core.enums import (
    INVENTORY_CATEGORIES,
    INVENTORY_UNITS,
    RECIPE_CATEGORIES,
    RECIPE_INGREDIENT_UNITS,
    PAYMENT_METHODS
)

router = APIRouter()

@router.get("/")
async def get_all_enums():
    """
    Get all available enums for frontend forms
    """
    return {
        "inventory_categories": INVENTORY_CATEGORIES,
        "inventory_units": INVENTORY_UNITS,
        "recipe_categories": RECIPE_CATEGORIES,
        "recipe_ingredient_units": RECIPE_INGREDIENT_UNITS,
        "payment_methods": PAYMENT_METHODS
    }

@router.get("/inventory/categories")
async def get_inventory_categories():
    """Get inventory categories"""
    return {"categories": INVENTORY_CATEGORIES}

@router.get("/inventory/units")
async def get_inventory_units():
    """Get inventory units"""
    return {"units": INVENTORY_UNITS}

@router.get("/recipe/categories")
async def get_recipe_categories():
    """Get recipe categories"""
    return {"categories": RECIPE_CATEGORIES}

@router.get("/recipe/ingredient-units")
async def get_recipe_ingredient_units():
    """Get recipe ingredient units"""
    return {"units": RECIPE_INGREDIENT_UNITS}

@router.get("/payment/methods")
async def get_payment_methods():
    """Get payment methods"""
    return {"methods": PAYMENT_METHODS}

