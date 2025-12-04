from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base


class ProductReview(Base):
    __tablename__ = "product_reviews"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # User reference (Firebase UID - no foreign key)
    user_uid = Column(String(255), nullable=False, index=True)
    
    # Order reference (cross-service reference - no foreign key)
    order_id = Column(Integer, nullable=True)
    
    # Review Content
    rating = Column(Integer, nullable=False)
    title = Column(String(200), nullable=True)
    comment = Column(Text, nullable=True)
    
    # Status Flags
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    product = relationship("Product", back_populates="reviews")
    
    def __repr__(self):
        return f"<ProductReview(id={self.id}, product_id={self.product_id}, user_uid='{self.user_uid}', rating={self.rating})>"
    
    @property
    def is_deleted(self):
        """Check if review is soft deleted"""
        return self.deleted_at is not None
