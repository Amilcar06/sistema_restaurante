"""
Alerts API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.inventory_service import InventoryService
from app.models.recipe import Recipe

router = APIRouter()

@router.get("/stock-critical")
async def get_critical_stock_alerts(db: Session = Depends(get_db)):
    """
    Get all inventory items with critical stock (quantity <= min_stock)
    """
    critical_items = InventoryService.get_critical_stock_items(db)
    
    alerts = []
    for item in critical_items:
        percentage = (item.quantity / item.min_stock * 100) if item.min_stock > 0 else 0
        alerts.append({
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "quantity": item.quantity,
            "min_stock": item.min_stock,
            "unit": item.unit,
            "percentage": round(percentage, 1),
            "shortage": round(item.min_stock - item.quantity, 2),
            "severity": "critical" if percentage <= 50 else "warning"
        })
    
    return {
        "count": len(alerts),
        "alerts": alerts
    }

@router.get("/stock-low")
async def get_low_stock_alerts(
    threshold: float = 1.2,
    db: Session = Depends(get_db)
):
    """
    Get items with low stock (quantity <= min_stock * threshold)
    Default threshold is 1.2 (20% above minimum)
    """
    low_stock_items = InventoryService.get_low_stock_items(db, threshold)
    
    alerts = []
    for item in low_stock_items:
        percentage = (item.quantity / item.min_stock * 100) if item.min_stock > 0 else 0
        alerts.append({
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "quantity": item.quantity,
            "min_stock": item.min_stock,
            "unit": item.unit,
            "percentage": round(percentage, 1),
            "severity": "warning"
        })
    
    return {
        "count": len(alerts),
        "alerts": alerts
    }

@router.get("/recipes-low-margin")
async def get_low_margin_recipes(
    min_margin: float = 30.0,
    db: Session = Depends(get_db)
):
    """
    Get recipes with low profit margins (below threshold)
    Default threshold is 30%
    """
    recipes = db.query(Recipe).filter(Recipe.margin < min_margin).all()
    
    alerts = []
    for recipe in recipes:
        alerts.append({
            "id": recipe.id,
            "name": recipe.name,
            "category": recipe.category,
            "price": recipe.price,
            "cost": recipe.cost,
            "margin": round(recipe.margin, 1),
            "recommended_price": round(recipe.cost * 1.3, 2),  # 30% margin
            "severity": "warning" if recipe.margin >= 10 else "critical"
        })
    
    return {
        "count": len(alerts),
        "alerts": alerts
    }

@router.get("/all")
async def get_all_alerts(db: Session = Depends(get_db)):
    """
    Get all alerts (critical stock, low stock, low margin recipes)
    """
    critical_stock = await get_critical_stock_alerts(db)
    low_stock = await get_low_stock_alerts(db)
    low_margin = await get_low_margin_recipes(db)
    
    return {
        "critical_stock": critical_stock,
        "low_stock": low_stock,
        "low_margin_recipes": low_margin,
        "total_alerts": critical_stock["count"] + low_stock["count"] + low_margin["count"]
    }

