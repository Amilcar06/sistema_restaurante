"""
Reports API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta, date
from typing import Optional, List
from fastapi.responses import JSONResponse

from app.core.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.recipe import Recipe
from app.models.inventory import InventoryItem
from app.schemas.sale import SaleResponse

router = APIRouter()

@router.get("/monthly")
async def get_monthly_report(
    months: int = 6,
    db: Session = Depends(get_db)
):
    """
    Get monthly sales, costs, and profit report
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=months * 30)
    
    # Get sales grouped by month
    monthly_sales = db.query(
        extract('year', Sale.created_at).label('year'),
        extract('month', Sale.created_at).label('month'),
        func.sum(Sale.total).label('ventas'),
        func.count(Sale.id).label('count')
    ).filter(
        Sale.created_at >= start_date
    ).group_by(
        extract('year', Sale.created_at),
        extract('month', Sale.created_at)
    ).order_by(
        extract('year', Sale.created_at),
        extract('month', Sale.created_at)
    ).all()
    
    # Calculate costs and profit for each month
    result = []
    month_names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
    for row in monthly_sales:
        # Get sales for this month to calculate costs
        month_start = datetime(int(row.year), int(row.month), 1)
        if row.month == 12:
            month_end = datetime(int(row.year) + 1, 1, 1)
        else:
            month_end = datetime(int(row.year), int(row.month) + 1, 1)
        
        # Get all sales items for this month
        month_sales = db.query(Sale).filter(
            and_(
                Sale.created_at >= month_start,
                Sale.created_at < month_end
            )
        ).all()
        
        # Calculate total costs from recipes
        total_cost = 0
        for sale in month_sales:
            for item in sale.items:
                if item.recipe_id:
                    recipe = db.query(Recipe).filter(Recipe.id == item.recipe_id).first()
                    if recipe:
                        # Cost per unit of recipe
                        cost_per_unit = recipe.cost / recipe.servings if recipe.servings > 0 else recipe.cost
                        total_cost += cost_per_unit * item.quantity
        
        ventas = float(row.ventas) if row.ventas else 0
        costos = total_cost
        ganancia = ventas - costos
        
        result.append({
            "month": month_names[int(row.month) - 1],
            "ventas": round(ventas, 2),
            "costos": round(costos, 2),
            "ganancia": round(ganancia, 2)
        })
    
    return result

@router.get("/category-performance")
async def get_category_performance(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get performance by category
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # Get sales items with recipe categories
    items = db.query(
        Recipe.category,
        func.sum(SaleItem.quantity).label('ventas'),
        func.sum(SaleItem.total).label('ingresos')
    ).join(
        SaleItem, SaleItem.recipe_id == Recipe.id
    ).join(
        Sale, Sale.id == SaleItem.sale_id
    ).filter(
        Sale.created_at >= start_date
    ).group_by(
        Recipe.category
    ).all()
    
    result = []
    for row in items:
        result.append({
            "category": row.category,
            "ventas": int(row.ventas) if row.ventas else 0,
            "ingresos": float(row.ingresos) if row.ingresos else 0
        })
    
    return result

@router.get("/profit-margins")
async def get_profit_margins(
    db: Session = Depends(get_db)
):
    """
    Get profit margins for all recipes
    """
    recipes = db.query(Recipe).all()
    
    result = []
    for recipe in recipes:
        result.append({
            "name": recipe.name,
            "margen": round(recipe.margin, 1)
        })
    
    # Sort by margin descending
    result.sort(key=lambda x: x["margen"], reverse=True)
    
    return result[:10]  # Top 10

@router.get("/payment-methods")
async def get_payment_methods(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get distribution by payment method
    """
    start_date = datetime.now() - timedelta(days=days)
    
    sales = db.query(
        Sale.payment_method,
        func.count(Sale.id).label('count'),
        func.sum(Sale.total).label('total')
    ).filter(
        and_(
            Sale.created_at >= start_date,
            Sale.payment_method.isnot(None)
        )
    ).group_by(
        Sale.payment_method
    ).all()
    
    total_count = sum(row.count for row in sales)
    total_amount = sum(float(row.total) if row.total else 0 for row in sales)
    
    result = []
    for row in sales:
        count = int(row.count)
        amount = float(row.total) if row.total else 0
        percentage = (count / total_count * 100) if total_count > 0 else 0
        
        result.append({
            "name": row.payment_method,
            "value": round(percentage, 1),
            "count": count,
            "amount": round(amount, 2)
        })
    
    return result

@router.get("/summary")
async def get_report_summary(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get summary report with key metrics
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # Total sales
    sales = db.query(Sale).filter(Sale.created_at >= start_date).all()
    total_sales = sum(sale.total for sale in sales)
    
    # Calculate total costs
    total_cost = 0
    for sale in sales:
        for item in sale.items:
            if item.recipe_id:
                recipe = db.query(Recipe).filter(Recipe.id == item.recipe_id).first()
                if recipe:
                    cost_per_unit = recipe.cost / recipe.servings if recipe.servings > 0 else recipe.cost
                    total_cost += cost_per_unit * item.quantity
    
    net_profit = total_sales - total_cost
    
    # Average margin
    recipes = db.query(Recipe).all()
    avg_margin = sum(r.margin for r in recipes) / len(recipes) if recipes else 0
    
    # Growth (compare with previous period)
    prev_start = start_date - timedelta(days=days)
    prev_sales = db.query(Sale).filter(
        and_(
            Sale.created_at >= prev_start,
            Sale.created_at < start_date
        )
    ).all()
    prev_total = sum(sale.total for sale in prev_sales)
    growth = ((total_sales - prev_total) / prev_total * 100) if prev_total > 0 else 0
    
    return {
        "total_sales": round(total_sales, 2),
        "total_cost": round(total_cost, 2),
        "net_profit": round(net_profit, 2),
        "average_margin": round(avg_margin, 1),
        "growth": round(growth, 1),
        "period_days": days
    }

@router.get("/export")
async def export_report(
    format: str = "json",
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Export comprehensive report
    """
    if format not in ["json", "csv"]:
        raise HTTPException(status_code=400, detail="Format must be 'json' or 'csv'")
    
    # Get all report data
    monthly = await get_monthly_report(months=6, db=db)
    category_perf = await get_category_performance(days=days, db=db)
    profit_margins = await get_profit_margins(db=db)
    payment_methods = await get_payment_methods(days=days, db=db)
    summary = await get_report_summary(days=days, db=db)
    
    report_data = {
        "summary": summary,
        "monthly_trend": monthly,
        "category_performance": category_perf,
        "profit_margins": profit_margins,
        "payment_methods": payment_methods,
        "exported_at": datetime.now().isoformat()
    }
    
    if format == "csv":
        # Convert to CSV format
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write summary
        writer.writerow(["Reporte GastroSmart AI"])
        writer.writerow(["Generado:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
        writer.writerow([])
        writer.writerow(["RESUMEN"])
        writer.writerow(["Ventas Totales", f"Bs. {summary['total_sales']}"])
        writer.writerow(["Costos Totales", f"Bs. {summary['total_cost']}"])
        writer.writerow(["Ganancia Neta", f"Bs. {summary['net_profit']}"])
        writer.writerow(["Margen Promedio", f"{summary['average_margin']}%"])
        writer.writerow(["Crecimiento", f"{summary['growth']}%"])
        writer.writerow([])
        
        # Write monthly trend
        writer.writerow(["TENDENCIA MENSUAL"])
        writer.writerow(["Mes", "Ventas", "Costos", "Ganancia"])
        for month in monthly:
            writer.writerow([month["month"], month["ventas"], month["costos"], month["ganancia"]])
        writer.writerow([])
        
        # Write category performance
        writer.writerow(["RENDIMIENTO POR CATEGORÍA"])
        writer.writerow(["Categoría", "Ventas", "Ingresos"])
        for cat in category_perf:
            writer.writerow([cat["category"], cat["ventas"], cat["ingresos"]])
        writer.writerow([])
        
        # Write profit margins
        writer.writerow(["MÁRGENES DE GANANCIA"])
        writer.writerow(["Plato", "Margen (%)"])
        for margin in profit_margins:
            writer.writerow([margin["name"], margin["margen"]])
        writer.writerow([])
        
        # Write payment methods
        writer.writerow(["MÉTODOS DE PAGO"])
        writer.writerow(["Método", "Porcentaje", "Cantidad", "Monto"])
        for pm in payment_methods:
            writer.writerow([pm["name"], f"{pm['value']}%", pm["count"], pm["amount"]])
        
        csv_content = output.getvalue()
        output.close()
        
        from fastapi.responses import Response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=reporte_gastrosmart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
        )
    
    return report_data

