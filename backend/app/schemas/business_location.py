"""
Business Location Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class BusinessLocationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    address: str = Field(..., min_length=5)
    city: str = Field(default="La Paz")
    zone: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_main: bool = Field(default=False)
    is_active: bool = Field(default=True)
    open_hours: Optional[Dict[str, Any]] = None

class BusinessLocationCreate(BusinessLocationBase):
    pass

class BusinessLocationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zone: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_main: Optional[bool] = None
    is_active: Optional[bool] = None
    open_hours: Optional[Dict[str, Any]] = None

class BusinessLocationResponse(BusinessLocationBase):
    id: str
    created_at: datetime
    user_id: Optional[str] = None
    
    class Config:
        from_attributes = True

