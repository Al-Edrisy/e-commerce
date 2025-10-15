from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.config.elasticsearch import es, create_products_index
# from app.schemas.product import Product, ProductCreate, ProductUpdate
# from app.models.Product import Product as ProductModel

router = APIRouter()

@router.get("/")
async def get_products(db: Session = Depends(get_db)):
    """
    Get all products
    """
    # TODO: Implement get all products
    return {"message": "Get all products - Not implemented yet"}

@router.get("/{product_id}")
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get product by ID
    """
    # TODO: Implement get product by ID
    return {"message": f"Get product {product_id} - Not implemented yet"}

@router.post("/")
async def create_product(db: Session = Depends(get_db)):
    """
    Create new product
    """
    # TODO: Implement create product
    return {"message": "Create product - Not implemented yet"}

@router.put("/{product_id}")
async def update_product(product_id: int, db: Session = Depends(get_db)):
    """
    Update product
    """
    # TODO: Implement update product
    return {"message": f"Update product {product_id} - Not implemented yet"}

@router.delete("/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Delete product
    """
    # TODO: Implement delete product
    return {"message": f"Delete product {product_id} - Not implemented yet"}

@router.get("/search")
async def search_products(
    q: str = Query(..., description="Search query"),
    category: str = Query(None, description="Filter by category"),
    min_price: float = Query(None, description="Minimum price"),
    max_price: float = Query(None, description="Maximum price"),
    brand: str = Query(None, description="Filter by brand"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db)
):
    """
    Search products using Elasticsearch with advanced filtering
    """
    try:
        # Ensure products index exists
        create_products_index()
        
        # Build Elasticsearch query
        query_body = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": q,
                                "fields": ["name^3", "description^2", "brand", "sku", "meta_keywords"],
                                "type": "best_fields",
                                "fuzziness": "AUTO"
                            }
                        }
                    ],
                    "filter": []
                }
            },
            "from": (page - 1) * size,
            "size": size,
            "sort": [
                {"_score": {"order": "desc"}},
                {"created_at": {"order": "desc"}}
            ]
        }
        
        # Add filters
        if category:
            query_body["query"]["bool"]["filter"].append({
                "term": {"category": category}
            })
        
        if brand:
            query_body["query"]["bool"]["filter"].append({
                "term": {"brand": brand}
            })
        
        if min_price is not None or max_price is not None:
            price_range = {}
            if min_price is not None:
                price_range["gte"] = min_price
            if max_price is not None:
                price_range["lte"] = max_price
            query_body["query"]["bool"]["filter"].append({
                "range": {"price": price_range}
            })
        
        # Execute search
        response = es.search(index="products", body=query_body)
        
        # Format results
        results = {
            "query": q,
            "total": response["hits"]["total"]["value"],
            "page": page,
            "size": size,
            "products": []
        }
        
        for hit in response["hits"]["hits"]:
            product = hit["_source"]
            product["_score"] = hit["_score"]
            results["products"].append(product)
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/index")
async def index_products(db: Session = Depends(get_db)):
    """
    Index all products in Elasticsearch
    """
    try:
        # TODO: Implement product indexing from database
        return {"message": "Product indexing - Not implemented yet"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")

@router.get("/suggest")
async def suggest_products(
    q: str = Query(..., description="Search suggestion query"),
    db: Session = Depends(get_db)
):
    """
    Get product search suggestions
    """
    try:
        # Elasticsearch completion suggester
        query_body = {
            "suggest": {
                "product_suggest": {
                    "prefix": q,
                    "completion": {
                        "field": "name.suggest",
                        "size": 5
                    }
                }
            }
        }
        
        response = es.search(index="products", body=query_body)
        
        suggestions = []
        if "suggest" in response and "product_suggest" in response["suggest"]:
            for option in response["suggest"]["product_suggest"][0]["options"]:
                suggestions.append({
                    "text": option["text"],
                    "score": option["_score"]
                })
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion failed: {str(e)}")

