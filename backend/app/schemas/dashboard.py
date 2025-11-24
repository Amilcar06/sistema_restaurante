"""
Dashboard Pydantic schemas
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStats(BaseModel):
    total_sales_today: float
    critical_inventory_count: int
    dishes_sold_today: int
    average_margin: float
    sales_change_percent: float
    dishes_change_percent: float
    margin_change_percent: float

class TopDish(BaseModel):
    name: str
    sales_count: int
    revenue: float

class Alert(BaseModel):
    type: str  # warning, info, success
    message: str

class DashboardResponse(BaseModel):
    stats: DashboardStats
    top_dishes: List[TopDish]
    alerts: List[Alert]
    sales_by_day: List[dict]  # [{day: str, ventas: float}]
    category_distribution: List[dict]  # [{name: str, value: float}]

