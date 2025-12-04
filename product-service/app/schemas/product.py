from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProductBase(BaseModel):
    """Base product schema with common fields"""
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    category_id: int
    price: float = Field(..., gt=0)
    compare_at_price: Optional[float] = Field(None, gt=0)
    cost_per_item: Optional[float] = Field(None, gt=0)
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)
    brand: Optional[str] = Field(None, max_length=100)
    weight: Optional[float] = Field(None, gt=0)
    dimensions: Optional[Dict[str, float]] = None
    images: Optional[List[str]] = None
    thumbnail: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    """Schema for creating a product"""
    pass

class ProductUpdate(BaseModel):
    """Schema for updating a product (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    category_id: Optional[int] = None
    price: Optional[float] = Field(None, gt=0)
    compare_at_price: Optional[float] = Field(None, gt=0)
    cost_per_item: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    brand: Optional[str] = Field(None, max_length=100)
    weight: Optional[float] = Field(None, gt=0)
    dimensions: Optional[Dict[str, float]] = None
    images: Optional[List[str]] = None
    thumbnail: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

class ProductResponse(ProductBase):
    """Schema for product response (includes database fields and computed properties)"""
    id: int
    in_stock: bool
    is_low_stock: bool
    discount_percentage: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductValidationRequest(BaseModel):
    """Schema for product validation request"""
    productId: int
    quantity: int

class ProductValidationResult(BaseModel):
    """Schema for product validation result"""
    valid: bool
    errors: List[str]