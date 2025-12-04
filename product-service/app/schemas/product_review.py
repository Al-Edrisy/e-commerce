from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import re


class ProductReviewBase(BaseModel):
    """Base product review schema with common fields"""
    product_id: int
    user_uid: str = Field(..., min_length=1, max_length=255)
    order_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=200)
    comment: Optional[str] = None
    
    @validator('user_uid')
    def validate_user_uid(cls, v):
        """Validate Firebase UID format"""
        if not v or len(v.strip()) == 0:
            raise ValueError('user_uid cannot be empty')
        # Firebase UIDs are typically alphanumeric strings
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('user_uid must contain only alphanumeric characters, hyphens, and underscores')
        return v


class ProductReviewCreate(ProductReviewBase):
    """Schema for creating a product review"""
    pass


class ProductReviewUpdate(BaseModel):
    """Schema for updating a product review (all fields optional)"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=200)
    comment: Optional[str] = None
    is_approved: Optional[bool] = None


class ProductReviewResponse(ProductReviewBase):
    """Schema for product review response"""
    id: int
    is_verified_purchase: bool
    is_approved: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
