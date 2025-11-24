"""
Business Locations API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.business_location import BusinessLocationCreate, BusinessLocationUpdate, BusinessLocationResponse
from app.core.database import get_db
from app.models.business_location import BusinessLocation

router = APIRouter()

@router.get("/", response_model=List[BusinessLocationResponse])
async def get_business_locations(db: Session = Depends(get_db)):
    """Get all business locations"""
    locations = db.query(BusinessLocation).order_by(desc(BusinessLocation.created_at)).all()
    return locations

@router.post("/", response_model=BusinessLocationResponse)
async def create_business_location(location: BusinessLocationCreate, db: Session = Depends(get_db)):
    """Create a new business location"""
    db_location = BusinessLocation(
        id=str(uuid.uuid4()),
        name=location.name,
        address=location.address,
        city=location.city,
        zone=location.zone,
        phone=location.phone,
        email=location.email,
        is_main=location.is_main,
        is_active=location.is_active,
        open_hours=location.open_hours,
        created_at=datetime.utcnow()
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.get("/{location_id}", response_model=BusinessLocationResponse)
async def get_business_location(location_id: str, db: Session = Depends(get_db)):
    """Get a specific business location"""
    location = db.query(BusinessLocation).filter(BusinessLocation.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Business location not found")
    return location

@router.put("/{location_id}", response_model=BusinessLocationResponse)
async def update_business_location(
    location_id: str,
    location: BusinessLocationUpdate,
    db: Session = Depends(get_db)
):
    """Update a business location"""
    db_location = db.query(BusinessLocation).filter(BusinessLocation.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=404, detail="Business location not found")
    
    update_data = location.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_location, field, value)
    
    db.commit()
    db.refresh(db_location)
    return db_location

@router.delete("/{location_id}")
async def delete_business_location(location_id: str, db: Session = Depends(get_db)):
    """Delete a business location"""
    db_location = db.query(BusinessLocation).filter(BusinessLocation.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=404, detail="Business location not found")
    
    db.delete(db_location)
    db.commit()
    return {"message": "Business location deleted successfully"}

