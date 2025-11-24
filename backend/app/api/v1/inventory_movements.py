"""
Inventory Movements API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from datetime import datetime, date
import uuid

from app.schemas.inventory_movement import InventoryMovementCreate, InventoryMovementResponse
from app.core.database import get_db
from app.models.inventory_movement import InventoryMovement
from app.models.inventory import InventoryItem
from app.models.business_location import BusinessLocation

router = APIRouter()

@router.get("/", response_model=List[InventoryMovementResponse])
async def get_inventory_movements(
    inventory_item_id: Optional[str] = None,
    location_id: Optional[str] = None,
    movement_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all inventory movements with optional filters"""
    query = db.query(InventoryMovement)
    
    if inventory_item_id:
        query = query.filter(InventoryMovement.inventory_item_id == inventory_item_id)
    
    if location_id:
        query = query.filter(InventoryMovement.location_id == location_id)
    
    if movement_type:
        query = query.filter(InventoryMovement.movement_type == movement_type)
    
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.filter(InventoryMovement.created_at >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.filter(InventoryMovement.created_at <= end)
    
    movements = query.order_by(desc(InventoryMovement.created_at)).all()
    return movements

@router.get("/{movement_id}", response_model=InventoryMovementResponse)
async def get_inventory_movement(movement_id: str, db: Session = Depends(get_db)):
    """Get a specific inventory movement"""
    movement = db.query(InventoryMovement).filter(InventoryMovement.id == movement_id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="Inventory movement not found")
    return movement

@router.get("/item/{inventory_item_id}/history", response_model=List[InventoryMovementResponse])
async def get_item_movement_history(
    inventory_item_id: str,
    limit: Optional[int] = 100,
    db: Session = Depends(get_db)
):
    """Get movement history for a specific inventory item"""
    item = db.query(InventoryItem).filter(InventoryItem.id == inventory_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    movements = db.query(InventoryMovement).filter(
        InventoryMovement.inventory_item_id == inventory_item_id
    ).order_by(desc(InventoryMovement.created_at)).limit(limit).all()
    
    return movements

@router.post("/", response_model=InventoryMovementResponse, status_code=201)
async def create_inventory_movement(movement: InventoryMovementCreate, db: Session = Depends(get_db)):
    """Create a new inventory movement"""
    # Validate inventory item exists
    item = db.query(InventoryItem).filter(InventoryItem.id == movement.inventory_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Validate location exists
    location = db.query(BusinessLocation).filter(BusinessLocation.id == movement.location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Business location not found")
    
    db_movement = InventoryMovement(
        id=str(uuid.uuid4()),
        inventory_item_id=movement.inventory_item_id,
        location_id=movement.location_id,
        movement_type=movement.movement_type,
        quantity=movement.quantity,
        unit=movement.unit,
        cost_per_unit=movement.cost_per_unit or item.cost_per_unit,
        reference_id=movement.reference_id,
        reference_type=movement.reference_type,
        notes=movement.notes,
        created_at=datetime.utcnow()
    )
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

