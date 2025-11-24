"""
Supplier Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SupplierBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zone: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    is_active: bool = Field(default=True)
    notes: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zone: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[str] = None
    rating: Optional[float] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class SupplierResponse(SupplierBase):
    id: str
    created_at: datetime
    updated_at: datetime
    user_id: Optional[str] = None
    
    class Config:
        from_attributes = True

