from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Product Service",
    description="Product management service for E-Commerce platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Import and include routers when implemented
# from app.routes import products, categories
# app.include_router(products.router, prefix="/api/products", tags=["products"])
# app.include_router(categories.router, prefix="/api/categories", tags=["categories"])

@app.get("/")
async def root():
    return {
        "service": "Product Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "products": "/api/products/*",
            "categories": "/api/categories/*"
        }
    }

@app.get("/health")
async def health():
    return {"status": "OK", "service": "product-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

