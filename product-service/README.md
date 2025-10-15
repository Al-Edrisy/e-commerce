# Product Service

Product catalog management and search service with Elasticsearch integration.

## Technology Stack

- **Runtime**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Search Engine**: Elasticsearch 8.11.0
- **Port**: 8000

## Prerequisites

- Python 3.11+
- PostgreSQL database
- Elasticsearch 8.11.0
- Virtual environment (recommended)

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=postgres
ELASTICSEARCH_URL=http://localhost:9200
```

## Quick Start

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   ```bash
   cp env.template .env
   # Edit .env with your configuration
   ```

4. Start the service:
   ```bash
   uvicorn main:app --reload
   ```

5. Service will be available at `http://localhost:8000`
6. API documentation at `http://localhost:8000/docs`

## API Endpoints

- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/{id}` - Update product (admin)
- `DELETE /api/products/{id}` - Delete product (admin)
- `GET /api/products/search` - Advanced product search with filters
- `GET /api/products/suggest` - Auto-complete search suggestions
- `POST /api/products/index` - Bulk index products to Elasticsearch
- `GET /api/categories` - List all categories
- `GET /health` - Health check

## Elasticsearch Integration

The service integrates with Elasticsearch for advanced product search:

- **Full-text search** across product names, descriptions, brands, and SKUs
- **Fuzzy matching** for typo tolerance
- **Real-time suggestions** and auto-complete
- **Advanced filtering** by category, brand, price range
- **Search analytics** and performance tracking

## Development Status

**TODO Implementation Required:**
- Product CRUD operations
- Category management
- Elasticsearch integration and indexing
- Search endpoints with filters
- Database models and schemas
- Pydantic validation schemas

## Features to Implement

- Product catalog management
- Category hierarchy
- Advanced search with Elasticsearch
- Real-time search suggestions
- Product filtering and sorting
- SEO optimization fields
- Search analytics and performance tracking
