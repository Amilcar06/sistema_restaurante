"""
Promotions API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from datetime import datetime
import uuid

from app.schemas.promotion import PromotionCreate, PromotionUpdate, PromotionResponse
from app.core.database import get_db
from app.models.promotion import Promotion
from app.models.business_location import BusinessLocation

router = APIRouter()

@router.get("/", response_model=List[PromotionResponse])
async def get_promotions(
    location_id: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all promotions, optionally filtered by location and active status"""
    query = db.query(Promotion)
    
    if location_id:
        query = query.filter(Promotion.location_id == location_id)
    
    if is_active is not None:
        query = query.filter(Promotion.is_active == is_active)
    
    promotions = query.order_by(desc(Promotion.created_at)).all()
    return promotions

@router.get("/{promotion_id}", response_model=PromotionResponse)
async def get_promotion(promotion_id: str, db: Session = Depends(get_db)):
    """Get a specific promotion"""
    promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not promotion:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return promotion

@router.post("/", response_model=PromotionResponse, status_code=201)
async def create_promotion(promotion: PromotionCreate, db: Session = Depends(get_db)):
    """Create a new promotion"""
    # Validate location if provided
    if promotion.location_id:
        location = db.query(BusinessLocation).filter(BusinessLocation.id == promotion.location_id).first()
        if not location:
            raise HTTPException(status_code=404, detail="Business location not found")
    
    db_promotion = Promotion(
        id=str(uuid.uuid4()),
        name=promotion.name,
        description=promotion.description,
        discount_type=promotion.discount_type,
        discount_value=promotion.discount_value,
        min_purchase=promotion.min_purchase,
        max_discount=promotion.max_discount,
        start_date=promotion.start_date,
        end_date=promotion.end_date,
        is_active=promotion.is_active,
        applicable_to=promotion.applicable_to,
        applicable_ids=promotion.applicable_ids,
        location_id=promotion.location_id,
        created_at=datetime.utcnow()
    )
    db.add(db_promotion)
    db.commit()
    db.refresh(db_promotion)
    return db_promotion

@router.put("/{promotion_id}", response_model=PromotionResponse)
async def update_promotion(
    promotion_id: str,
    promotion_update: PromotionUpdate,
    db: Session = Depends(get_db)
):
    """Update a promotion"""
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not db_promotion:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    # Validate location if being updated
    if promotion_update.location_id:
        location = db.query(BusinessLocation).filter(BusinessLocation.id == promotion_update.location_id).first()
        if not location:
            raise HTTPException(status_code=404, detail="Business location not found")
    
    update_data = promotion_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_promotion, key, value)
    
    db.commit()
    db.refresh(db_promotion)
    return db_promotion

@router.delete("/{promotion_id}", status_code=204)
async def delete_promotion(promotion_id: str, db: Session = Depends(get_db)):
    """Delete a promotion"""
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not db_promotion:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    db.delete(db_promotion)
    db.commit()
    return {"message": "Promotion deleted successfully"}

@router.get("/active/current", response_model=List[PromotionResponse])
async def get_active_promotions(
    location_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get currently active promotions"""
    now = datetime.utcnow()
    query = db.query(Promotion).filter(
        and_(
            Promotion.is_active == True,
            Promotion.start_date <= now,
            Promotion.end_date >= now
        )
    )
    
    if location_id:
        query = query.filter(
            (Promotion.location_id == location_id) | (Promotion.location_id == None)
        )
    
    promotions = query.order_by(desc(Promotion.created_at)).all()
    return promotions

