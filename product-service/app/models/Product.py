from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base

class Product(Base):
    __tablename__ = "products"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    
    # Category
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    
    # Pricing
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)  # Original price for showing discounts
    cost_per_item = Column(Float, nullable=True)
    
    # Inventory
    stock_quantity = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=10, nullable=False)
    
    # Product Details
    brand = Column(String(100), nullable=True, index=True)
    weight = Column(Float, nullable=True)  # in kg
    dimensions = Column(JSON, nullable=True)  # {"length": 10, "width": 5, "height": 3}
    
    # Images
    images = Column(JSON, nullable=True)  # ["url1", "url2", "url3"]
    thumbnail = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    
    # SEO
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String(500), nullable=True)
    
    # Additional attributes (JSON for flexibility)
    attributes = Column(JSON, nullable=True)  # {"color": "red", "size": "large"}
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', sku='{self.sku}')>"
    
    @property
    def in_stock(self):
        """Check if product is in stock"""
        return self.stock_quantity > 0
    
    @property
    def is_low_stock(self):
        """Check if product is low on stock"""
        return 0 < self.stock_quantity <= self.low_stock_threshold
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage if compare_at_price exists"""
        if self.compare_at_price and self.compare_at_price > self.price:
            return round(((self.compare_at_price - self.price) / self.compare_at_price) * 100, 2)
        return 0