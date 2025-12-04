from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    """Base category schema with common fields"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: bool = True
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class CategoryCreate(CategoryBase):
    """Schema for creating a category"""
    pass

class CategoryUpdate(BaseModel):
    """Schema for updating a category (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class CategoryResponse(CategoryBase):
    """Schema for category response (includes database fields)"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True