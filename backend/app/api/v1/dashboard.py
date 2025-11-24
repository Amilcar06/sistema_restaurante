"""
Dashboard API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta, date
from typing import List

from app.schemas.dashboard import DashboardResponse, DashboardStats, TopDish, Alert
from app.core.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.inventory import InventoryItem
from app.models.recipe import Recipe
from app.services.inventory_service import InventoryService

router = APIRouter()

@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics and data from database
    """
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    week_ago = start_of_day - timedelta(days=7)
    yesterday_start = datetime.combine(today - timedelta(days=1), datetime.min.time())
    yesterday_end = datetime.combine(today - timedelta(days=1), datetime.max.time())
    
    # Today's sales
    sales_today = db.query(Sale).filter(
        and_(Sale.created_at >= start_of_day, Sale.created_at <= end_of_day)
    ).all()
    total_sales_today = sum(sale.total for sale in sales_today)
    
    # Yesterday's sales for comparison
    sales_yesterday = db.query(Sale).filter(
        and_(Sale.created_at >= yesterday_start, Sale.created_at <= yesterday_end)
    ).all()
    total_sales_yesterday = sum(sale.total for sale in sales_yesterday)
    sales_change = ((total_sales_today - total_sales_yesterday) / total_sales_yesterday * 100) if total_sales_yesterday > 0 else 0
    
    # Dishes sold today
    items_today = db.query(SaleItem).join(Sale).filter(
        and_(Sale.created_at >= start_of_day, Sale.created_at <= end_of_day)
    ).all()
    dishes_sold_today = sum(item.quantity for item in items_today)
    
    items_yesterday = db.query(SaleItem).join(Sale).filter(
        and_(Sale.created_at >= yesterday_start, Sale.created_at <= yesterday_end)
    ).all()
    dishes_sold_yesterday = sum(item.quantity for item in items_yesterday)
    dishes_change = ((dishes_sold_today - dishes_sold_yesterday) / dishes_sold_yesterday * 100) if dishes_sold_yesterday > 0 else 0
    
    # Critical inventory items (using service)
    critical_items = InventoryService.get_critical_stock_items(db)
    critical_count = len(critical_items)
    
    # Average margin from recipes
    recipes = db.query(Recipe).all()
    avg_margin = sum(recipe.margin for recipe in recipes) / len(recipes) if recipes else 0
    
    # Calculate margin change (simplified - compare with previous week average)
    week_recipes = db.query(Recipe).filter(Recipe.created_at >= week_ago).all()
    week_avg_margin = sum(r.margin for r in week_recipes) / len(week_recipes) if week_recipes else avg_margin
    margin_change = avg_margin - week_avg_margin if week_avg_margin > 0 else 0
    
    stats = DashboardStats(
        total_sales_today=total_sales_today,
        critical_inventory_count=critical_count,
        dishes_sold_today=dishes_sold_today,
        average_margin=round(avg_margin, 1),
        sales_change_percent=round(sales_change, 1),
        dishes_change_percent=round(dishes_change, 1),
        margin_change_percent=round(margin_change, 1)
    )
    
    # Top dishes (from sales in last 7 days)
    top_dishes_query = db.query(
        SaleItem.item_name,
        func.sum(SaleItem.quantity).label('sales_count'),
        func.sum(SaleItem.total).label('revenue')
    ).join(Sale).filter(
        Sale.created_at >= week_ago
    ).group_by(SaleItem.item_name).order_by(desc('sales_count')).limit(5).all()
    
    top_dishes = [
        TopDish(name=row.item_name, sales_count=int(row.sales_count), revenue=float(row.revenue))
        for row in top_dishes_query
    ]
    
    # Alerts from critical inventory
    alerts = []
    for item in critical_items[:4]:  # Limit to 4 alerts
        alerts.append(Alert(
            type="warning",
            message=f"{item.name} está por debajo del stock mínimo ({item.quantity}{item.unit} restantes, mínimo {item.min_stock}{item.unit})"
        ))
    
    # Add info alerts for high margin items
    high_margin_recipes = db.query(Recipe).filter(Recipe.margin >= 70).limit(2).all()
    for recipe in high_margin_recipes:
        alerts.append(Alert(
            type="info",
            message=f"{recipe.name} tiene un margen del {recipe.margin:.1f}% - excelente rentabilidad"
        ))
    
    # Sales by day (last 7 days)
    sales_by_day = []
    days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    for i in range(6, -1, -1):  # Last 7 days
        day_date = today - timedelta(days=i)
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        
        day_sales = db.query(Sale).filter(
            and_(Sale.created_at >= day_start, Sale.created_at <= day_end)
        ).all()
        day_total = sum(sale.total for sale in day_sales)
        
        sales_by_day.append({
            "day": days[day_date.weekday()],
            "ventas": round(day_total, 2)
        })
    
    # Category distribution (from recipes)
    category_counts = {}
    for recipe in recipes:
        category_counts[recipe.category] = category_counts.get(recipe.category, 0) + 1
    
    total_recipes = len(recipes)
    category_distribution = [
        {"name": cat, "value": round((count / total_recipes * 100) if total_recipes > 0 else 0)}
        for cat, count in category_counts.items()
    ]
    
    # If no categories, use default
    if not category_distribution:
        category_distribution = [
            {"name": "Platos Principales", "value": 45},
            {"name": "Bebidas", "value": 25},
            {"name": "Entradas", "value": 20},
            {"name": "Postres", "value": 10},
        ]
    
    return DashboardResponse(
        stats=stats,
        top_dishes=top_dishes,
        alerts=alerts,
        sales_by_day=sales_by_day,
        category_distribution=category_distribution
    )

