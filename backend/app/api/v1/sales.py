"""
Sales API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_
from datetime import datetime, date, time
import uuid

from app.schemas.sale import SaleCreate, SaleResponse, SaleItemCreate
from app.core.database import get_db
from app.core.config import settings
from app.models.sale import Sale, SaleItem
from app.models.recipe import Recipe
from app.services.inventory_service import InventoryService

router = APIRouter()

@router.get("/", response_model=List[SaleResponse])
async def get_sales(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all sales, optionally filtered by date range
    """
    query = db.query(Sale)
    
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(Sale.created_at >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(Sale.created_at <= end)
    
    sales = query.order_by(desc(Sale.created_at)).all()
    # Trigger lazy load of items
    for sale in sales:
        _ = sale.items
    return sales

@router.post("/", response_model=SaleResponse)
async def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    """
    Create a new sale with items
    Validates stock availability and business hours before creating sale
    """
    # Validation 1: Business hours
    current_time = datetime.now()
    current_hour = current_time.hour
    current_day = current_time.weekday()  # 0=Monday, 6=Sunday
    
    if current_day not in settings.BUSINESS_DAYS:
        raise HTTPException(
            status_code=400,
            detail=f"El restaurante está cerrado los {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][current_day]}"
        )
    
    if current_hour < settings.BUSINESS_OPEN_HOUR or current_hour >= settings.BUSINESS_CLOSE_HOUR:
        raise HTTPException(
            status_code=400,
            detail=f"El restaurante está cerrado. Horario de atención: {settings.BUSINESS_OPEN_HOUR}:00 - {settings.BUSINESS_CLOSE_HOUR}:00"
        )
    
    # Validation 2: At least one item
    if not sale.items or len(sale.items) == 0:
        raise HTTPException(
            status_code=400,
            detail="La venta debe tener al menos un item"
        )
    
    # Validation 3: Stock availability for all items with recipes
    stock_errors = []
    items_to_update = []
    
    for item in sale.items:
        if item.recipe_id:
            stock_check = InventoryService.check_stock_availability(
                recipe_id=item.recipe_id,
                quantity=item.quantity,
                db=db
            )
            
            if not stock_check["sufficient"]:
                missing_info = ", ".join([
                    f"{mi['item']} (requiere {mi['required']}{mi['unit']}, disponible {mi['available']}{mi['unit']})"
                    for mi in stock_check["missing_items"]
                ])
                stock_errors.append(
                    f"Stock insuficiente para {item.item_name}: {missing_info}"
                )
            else:
                items_to_update.append({
                    "recipe_id": item.recipe_id,
                    "quantity": item.quantity
                })
    
    if stock_errors:
        raise HTTPException(
            status_code=400,
            detail="Stock insuficiente para completar la venta. " + " | ".join(stock_errors)
        )
    
    # Validation 4: Total calculation
    calculated_subtotal = sum(item.total for item in sale.items)
    calculated_tax = calculated_subtotal * 0.13  # 13% IVA Bolivia
    calculated_total = calculated_subtotal + calculated_tax
    
    # Allow small floating point differences
    if abs(sale.subtotal - calculated_subtotal) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"El subtotal no coincide. Esperado: {calculated_subtotal:.2f}, Recibido: {sale.subtotal:.2f}"
        )
    
    if abs(sale.total - calculated_total) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"El total no coincide. Esperado: {calculated_total:.2f}, Recibido: {sale.total:.2f}"
        )
    
    # Generate sale number
    sale_number = f"V-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Create sale
    db_sale = Sale(
        id=str(uuid.uuid4()),
        sale_number=sale_number,
        location_id=sale.location_id,
        table_number=sale.table_number,
        waiter_id=sale.waiter_id,
        sale_type=sale.sale_type,
        delivery_service=sale.delivery_service,
        customer_name=sale.customer_name,
        customer_phone=sale.customer_phone,
        subtotal=sale.subtotal,
        discount_amount=sale.discount_amount,
        tax=sale.tax,
        total=sale.total,
        payment_method=sale.payment_method.value if hasattr(sale.payment_method, 'value') else str(sale.payment_method),
        notes=sale.notes,
        status="COMPLETED",
        created_at=datetime.utcnow()
    )
    db.add(db_sale)
    db.flush()  # Get the ID
    
    # Create sale items
    for item in sale.items:
        db_item = SaleItem(
            id=str(uuid.uuid4()),
            sale_id=db_sale.id,
            recipe_id=item.recipe_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item.total
        )
        db.add(db_item)
    
    # Update inventory (reduce stock)
    inventory_errors = []
    for item_update in items_to_update:
        result = InventoryService.update_inventory_from_sale(
            recipe_id=item_update["recipe_id"],
            quantity=item_update["quantity"],
            db=db,
            operation="subtract"
        )
        if not result["success"]:
            inventory_errors.extend(result["errors"])
    
    if inventory_errors:
        # Rollback sale if inventory update fails
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Error al actualizar inventario: " + " | ".join(inventory_errors)
        )
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(sale_id: str, db: Session = Depends(get_db)):
    """
    Get a specific sale
    """
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    # Trigger lazy load of items
    _ = sale.items
    return sale

@router.delete("/{sale_id}")
async def delete_sale(sale_id: str, db: Session = Depends(get_db)):
    """
    Delete a sale and restore inventory (rollback stock)
    """
    db_sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Restore inventory for all items with recipes
    items_to_restore = []
    for item in db_sale.items:
        if item.recipe_id:
            items_to_restore.append({
                "recipe_id": item.recipe_id,
                "quantity": item.quantity
            })
    
    # Restore stock
    for item_restore in items_to_restore:
        InventoryService.update_inventory_from_sale(
            recipe_id=item_restore["recipe_id"],
            quantity=item_restore["quantity"],
            db=db,
            operation="add"  # Add stock back
        )
    
    # Delete sale (cascade will delete items)
    db.delete(db_sale)
    db.commit()
    return {"message": "Sale deleted successfully and inventory restored"}

@router.get("/stats/today", response_model=dict)
async def get_today_stats(db: Session = Depends(get_db)):
    """
    Get today's sales statistics
    """
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    sales_today = db.query(Sale).filter(
        and_(Sale.created_at >= start_of_day, Sale.created_at <= end_of_day)
    ).all()
    
    total_sales = sum(sale.total for sale in sales_today)
    count = len(sales_today)
    
    # Count dishes sold
    items_today = db.query(SaleItem).join(Sale).filter(
        and_(Sale.created_at >= start_of_day, Sale.created_at <= end_of_day)
    ).all()
    
    dishes_sold = sum(item.quantity for item in items_today)
    
    return {
        "total_sales": total_sales,
        "count": count,
        "dishes_sold": dishes_sold,
        "average_ticket": total_sales / count if count > 0 else 0
    }
