"""
Suppliers API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import uuid

from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.core.database import get_db
from app.models.supplier import Supplier

router = APIRouter()

@router.get("/", response_model=List[SupplierResponse])
async def get_suppliers(db: Session = Depends(get_db)):
    """Get all suppliers"""
    suppliers = db.query(Supplier).order_by(desc(Supplier.created_at)).all()
    return suppliers

@router.post("/", response_model=SupplierResponse)
async def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    """Create a new supplier"""
    db_supplier = Supplier(
        id=str(uuid.uuid4()),
        name=supplier.name,
        contact_name=supplier.contact_name,
        phone=supplier.phone,
        email=supplier.email,
        address=supplier.address,
        city=supplier.city,
        zone=supplier.zone,
        tax_id=supplier.tax_id,
        payment_terms=supplier.payment_terms,
        rating=supplier.rating,
        is_active=supplier.is_active,
        notes=supplier.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: str, db: Session = Depends(get_db)):
    """Get a specific supplier"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: str,
    supplier: SupplierUpdate,
    db: Session = Depends(get_db)
):
    """Update a supplier"""
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = supplier.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_supplier, field, value)
    
    db_supplier.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, db: Session = Depends(get_db)):
    """Delete a supplier"""
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(db_supplier)
    db.commit()
    return {"message": "Supplier deleted successfully"}

