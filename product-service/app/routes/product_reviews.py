from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from app.config.database import get_db
from app.models.ProductReview import ProductReview
from app.models.Product import Product
from app.schemas.product_review import ProductReviewCreate, ProductReviewUpdate, ProductReviewResponse

router = APIRouter()


@router.post("/", response_model=ProductReviewResponse, status_code=201)
async def create_product_review(review: ProductReviewCreate, db: Session = Depends(get_db)):
    """Create a new product review"""
    try:
        # Verify product exists
        product = db.query(Product).filter(Product.id == review.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check if user already reviewed this product
        existing_review = db.query(ProductReview).filter(
            ProductReview.product_id == review.product_id,
            ProductReview.user_uid == review.user_uid,
            ProductReview.deleted_at.is_(None)
        ).first()
        
        if existing_review:
            raise HTTPException(
                status_code=400, 
                detail="User has already reviewed this product"
            )
        
        # Create review
        db_review = ProductReview(**review.model_dump())
        
        # If order_id is provided, mark as verified purchase
        if review.order_id:
            db_review.is_verified_purchase = True
        
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        
        return db_review
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating review: {str(e)}")


@router.get("/", response_model=List[ProductReviewResponse])
async def get_product_reviews(
    product_id: Optional[int] = None,
    user_uid: Optional[str] = None,
    is_approved: Optional[bool] = None,
    min_rating: Optional[int] = Query(None, ge=1, le=5),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get product reviews with filters"""
    try:
        query = db.query(ProductReview).filter(ProductReview.deleted_at.is_(None))
        
        if product_id:
            query = query.filter(ProductReview.product_id == product_id)
        
        if user_uid:
            query = query.filter(ProductReview.user_uid == user_uid)
        
        if is_approved is not None:
            query = query.filter(ProductReview.is_approved == is_approved)
        
        if min_rating:
            query = query.filter(ProductReview.rating >= min_rating)
        
        # Order by most recent first
        query = query.order_by(ProductReview.created_at.desc())
        
        reviews = query.offset(skip).limit(limit).all()
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reviews: {str(e)}")


@router.get("/stats/{product_id}")
async def get_product_review_stats(product_id: int, db: Session = Depends(get_db)):
    """Get review statistics for a product"""
    try:
        # Verify product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get approved reviews only
        reviews = db.query(ProductReview).filter(
            ProductReview.product_id == product_id,
            ProductReview.is_approved == True,
            ProductReview.deleted_at.is_(None)
        )
        
        total_reviews = reviews.count()
        
        if total_reviews == 0:
            return {
                "product_id": product_id,
                "total_reviews": 0,
                "average_rating": 0,
                "rating_distribution": {
                    "5": 0,
                    "4": 0,
                    "3": 0,
                    "2": 0,
                    "1": 0
                }
            }
        
        # Calculate average rating
        avg_rating = db.query(func.avg(ProductReview.rating)).filter(
            ProductReview.product_id == product_id,
            ProductReview.is_approved == True,
            ProductReview.deleted_at.is_(None)
        ).scalar()
        
        # Get rating distribution
        rating_distribution = {}
        for rating in range(1, 6):
            count = reviews.filter(ProductReview.rating == rating).count()
            rating_distribution[str(rating)] = count
        
        return {
            "product_id": product_id,
            "total_reviews": total_reviews,
            "average_rating": round(float(avg_rating), 2) if avg_rating else 0,
            "rating_distribution": rating_distribution
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching review stats: {str(e)}")


@router.get("/{review_id}", response_model=ProductReviewResponse)
async def get_product_review(review_id: int, db: Session = Depends(get_db)):
    """Get a specific product review by ID"""
    try:
        review = db.query(ProductReview).filter(
            ProductReview.id == review_id,
            ProductReview.deleted_at.is_(None)
        ).first()
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        return review
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching review: {str(e)}")


@router.put("/{review_id}", response_model=ProductReviewResponse)
async def update_product_review(
    review_id: int,
    review_update: ProductReviewUpdate,
    db: Session = Depends(get_db)
):
    """Update a product review"""
    try:
        db_review = db.query(ProductReview).filter(
            ProductReview.id == review_id,
            ProductReview.deleted_at.is_(None)
        ).first()
        
        if not db_review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Update fields
        update_data = review_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_review, field, value)
        
        db.commit()
        db.refresh(db_review)
        
        return db_review
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating review: {str(e)}")


@router.delete("/{review_id}", status_code=204)
async def delete_product_review(review_id: int, db: Session = Depends(get_db)):
    """Soft delete a product review"""
    try:
        db_review = db.query(ProductReview).filter(
            ProductReview.id == review_id,
            ProductReview.deleted_at.is_(None)
        ).first()
        
        if not db_review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Soft delete
        db_review.deleted_at = datetime.utcnow()
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting review: {str(e)}")
