from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.config.database import test_connection, Base, engine
from app.models import Product, Category, ProductReview
from app.services.elasticsearch import es_service
from app.routes import products, categories, product_reviews
from app.utils.exceptions import ProductServiceException
from app.utils.error_handlers import (
    product_service_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    general_exception_handler
)
import time
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Product Service",
    description="Product management service for E-Commerce platform",
    version="1.0.0",
    redirect_slashes=False
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests"""
    start_time = time.time()
    
    logger.info(f"Request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"Response: {response.status_code} | "
        f"Time: {process_time:.3f}s | "
        f"Path: {request.url.path}"
    )
    
    return response

# Register exception handlers
app.add_exception_handler(ProductServiceException, product_service_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Register routes
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(product_reviews.router, prefix="/api/reviews", tags=["Product Reviews"])

# Event: On startup
@app.on_event("startup")
async def startup_event():
    """Initialize database and Elasticsearch on startup"""
    print("🚀 Starting Product Service...")
    
    # Test database connection
    if test_connection():
        print("✅ Database connected successfully")
    else:
        print("❌ Database connection failed")
        return
    
    # Create all tables
    print("📊 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
    
    # Check Elasticsearch
    if es_service.health_check():
        print("✅ Elasticsearch is healthy")
    else:
        print("⚠️ Elasticsearch connection failed")

@app.get("/")
async def root():
    return {
        "service": "Product Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "products": "/api/products",
            "categories": "/api/categories",
            "reviews": "/api/reviews"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    db_status = "connected" if test_connection() else "disconnected"
    es_status = "connected" if es_service.health_check() else "disconnected"
    
    return {
        "status": "OK",
        "service": "product-service",
        "database": db_status,
        "elasticsearch": es_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)