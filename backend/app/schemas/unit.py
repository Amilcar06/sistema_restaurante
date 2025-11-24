"""
Unit Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UnitBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=2, max_length=100)
    type: str = Field(..., pattern="^(weight|volume|piece|custom)$")
    base_unit_id: Optional[str] = None
    factor_to_base: float = Field(default=1.0, gt=0)
    is_active: bool = Field(default=True)

class UnitCreate(UnitBase):
    pass

class UnitUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    base_unit_id: Optional[str] = None
    factor_to_base: Optional[float] = None
    is_active: Optional[bool] = None

class UnitResponse(UnitBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

