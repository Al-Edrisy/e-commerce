from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.config.database import get_db
from app.models.Product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductValidationRequest, ProductValidationResult
from app.services.elasticsearch import es_service

router = APIRouter()

@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    try:
        # Check if SKU already exists
        existing = db.query(Product).filter(Product.sku == product.sku).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")
        
        # Create product
        db_product = Product(**product.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        # Index in Elasticsearch (optional, won't fail if ES is down)
        try:
            product_dict = {
                "id": db_product.id,
                "name": db_product.name,
                "slug": db_product.slug,
                "sku": db_product.sku,
                "description": db_product.description,
                "price": db_product.price,
                "brand": db_product.brand,
                "category_id": db_product.category_id,
                "stock_quantity": db_product.stock_quantity,
                "is_active": db_product.is_active,
                "thumbnail": db_product.thumbnail,
            }
            es_service.index_product(product_dict)
        except:
            pass  # Elasticsearch indexing is optional
        
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """Get all products with pagination and filters"""
    try:
        query = db.query(Product)
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
        
        products = query.offset(skip).limit(limit).all()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

@router.get("/search")
async def search_products(
    q: str = Query(..., min_length=1),
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Search products using Elasticsearch"""
    try:
        filters = {}
        if category_id:
            filters["category_id"] = category_id
        if brand:
            filters["brand"] = brand
        if min_price:
            filters["min_price"] = min_price
        if max_price:
            filters["max_price"] = max_price
        if in_stock:
            filters["in_stock"] = in_stock
        
        results = es_service.search_products(q, filters, page, page_size)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/suggest")
async def suggest_products(prefix: str = Query(..., min_length=1)):
    """Get product suggestions for autocomplete"""
    try:
        suggestions = es_service.suggest_products(prefix)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion error: {str(e)}")

@router.post("/validate", response_model=ProductValidationResult)
async def validate_products(
    requests: List[ProductValidationRequest],
    db: Session = Depends(get_db)
):
    """Validate products availability and stock"""
    errors = []
    valid = True
    
    for req in requests:
        product = db.query(Product).filter(Product.id == req.productId).first()
        
        if not product:
            valid = False
            errors.append(f"Product with ID {req.productId} not found")
            continue
            
        if not product.is_active:
            valid = False
            errors.append(f"Product '{product.name}' is not active")
            continue
            
        if product.stock_quantity < req.quantity:
            valid = False
            errors.append(f"Insufficient stock for '{product.name}'. Requested: {req.quantity}, Available: {product.stock_quantity}")
            
    return ProductValidationResult(valid=valid, errors=errors)

@router.get("/{product_id}/exists", response_model=bool)
async def check_product_exists(product_id: int, db: Session = Depends(get_db)):
    """Check if product exists"""
    count = db.query(Product).filter(Product.id == product_id).count()
    return count > 0

@router.get("/{product_id}/stock", response_model=int)
async def get_product_stock(product_id: int, db: Session = Depends(get_db)):
    """Get product stock quantity"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product.stock_quantity

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID"""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching product: {str(e)}")

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update product"""
    try:
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Update fields
        update_data = product_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        
        # Update in Elasticsearch (optional)
        try:
            product_dict = {
                "id": db_product.id,
                "name": db_product.name,
                "slug": db_product.slug,
                "sku": db_product.sku,
                "description": db_product.description,
                "price": db_product.price,
                "brand": db_product.brand,
                "category_id": db_product.category_id,
                "stock_quantity": db_product.stock_quantity,
                "is_active": db_product.is_active,
                "thumbnail": db_product.thumbnail,
            }
            es_service.index_product(product_dict)
        except:
            pass
        
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")

@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete product"""
    try:
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        db.delete(db_product)
        db.commit()
        
        # Delete from Elasticsearch (optional)
        try:
            es_service.delete_product(product_id)
        except:
            pass
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")