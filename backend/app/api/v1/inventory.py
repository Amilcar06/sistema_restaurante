"""
Inventory API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemResponse
from app.core.database import get_db
from app.models.inventory import InventoryItem

router = APIRouter()

@router.get("/", response_model=List[InventoryItemResponse])
async def get_inventory_items(db: Session = Depends(get_db)):
    """
    Get all inventory items
    """
    items = db.query(InventoryItem).order_by(desc(InventoryItem.last_updated)).all()
    return items

@router.post("/", response_model=InventoryItemResponse)
async def create_inventory_item(item: InventoryItemCreate, db: Session = Depends(get_db)):
    """
    Create a new inventory item
    """
    from app.models.business_location import BusinessLocation
    from app.models.supplier import Supplier
    from app.models.inventory_cost_history import InventoryCostHistory
    
    # Validate location exists (required)
    if not hasattr(item, 'location_id') or not item.location_id:
        # Try to get default location or create one
        default_location = db.query(BusinessLocation).filter(BusinessLocation.is_main == True).first()
        if not default_location:
            raise HTTPException(status_code=400, detail="location_id es requerido. Crea una sucursal primero.")
        location_id = default_location.id
    else:
        location_id = item.location_id
        location = db.query(BusinessLocation).filter(BusinessLocation.id == location_id).first()
        if not location:
            raise HTTPException(status_code=404, detail="Business location not found")
    
    db_item = InventoryItem(
        id=str(uuid.uuid4()),
        name=item.name,
        category=item.category.value if hasattr(item.category, 'value') else str(item.category),
        quantity=item.quantity,
        unit=item.unit.value if hasattr(item.unit, 'value') else str(item.unit),
        unit_id=getattr(item, 'unit_id', None),
        min_stock=item.min_stock,
        max_stock=getattr(item, 'max_stock', None),
        cost_per_unit=item.cost_per_unit,
        supplier_id=getattr(item, 'supplier_id', None),
        supplier=item.supplier,  # Mantener para compatibilidad
        location_id=location_id,
        expiry_date=getattr(item, 'expiry_date', None),
        barcode=getattr(item, 'barcode', None),
        last_updated=datetime.utcnow()
    )
    db.add(db_item)
    db.flush()  # Get ID
    
    # Create cost history entry
    if db_item.cost_per_unit > 0:
        cost_history = InventoryCostHistory(
            id=str(uuid.uuid4()),
            inventory_item_id=db_item.id,
            cost_per_unit=db_item.cost_per_unit,
            supplier_id=db_item.supplier_id,
            date=datetime.utcnow(),
            reason="creación"
        )
        db.add(cost_history)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{item_id}", response_model=InventoryItemResponse)
async def get_inventory_item(item_id: str, db: Session = Depends(get_db)):
    """
    Get a specific inventory item
    """
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.put("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: str, 
    item: InventoryItemUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an inventory item
    """
    db_item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Update only provided fields
    update_data = item.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db_item.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_inventory_item(item_id: str, db: Session = Depends(get_db)):
    """
    Delete an inventory item
    """
    db_item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Inventory item deleted successfully"}
