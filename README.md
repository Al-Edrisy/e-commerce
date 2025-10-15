# E-Commerce Microservices Platform

A complete microservices-based e-commerce platform with modern architecture and technologies.

## Architecture Overview

This project implements a microservices architecture with the following services:

### Services

- **User Service** (Node.js + Express.js) - Port 3001
  - User registration and login
  - Firebase Authentication integration
  - JWT token management
  - Profile management
  - PostgreSQL database

- **Product Service** (Python + FastAPI) - Port 8000
  - Product catalog management
  - Category management
  - Advanced product search with Elasticsearch
  - Real-time search suggestions and auto-complete
  - Product filtering and analytics
  - PostgreSQL database

- **Order Service** (Java + Spring Boot) - Port 8080
  - Order management
  - Payment processing with Stripe
  - Invoice generation
  - PostgreSQL database

- **API Gateway** (TypeScript + Express) - Port 4000
  - Request routing to microservices
  - Authentication middleware
  - Rate limiting
  - Request logging

- **Frontend** (React) - Port 3000
  - User interface for browsing products
  - Shopping cart
  - Checkout process
  - User authentication

### Infrastructure

- **PostgreSQL** - Single database with comprehensive meta fields
  - Single PostgreSQL instance: Port 5432
  - ecommerce database (all services)
  - Default credentials: postgres/postgres
  - Enhanced with meta fields for analytics and business intelligence
- **Elasticsearch** - Port 9200 (Advanced product search engine)
  - Version: Elasticsearch 8.11.0
  - Memory: 512MB heap size
  - Features: Full-text search, fuzzy matching, auto-complete, filtering
  - Integration: Product Service with enhanced meta fields

## Search Engine Integration

### Elasticsearch Features
The platform includes a powerful search engine powered by Elasticsearch:

- **Advanced Search**: Full-text search across product names, descriptions, brands, and SKUs
- **Fuzzy Matching**: Auto-corrects typos in search queries
- **Real-time Suggestions**: Auto-complete dropdown for product names
- **Smart Filtering**: Filter by category, brand, price range, availability
- **Relevance Scoring**: Intelligent ranking based on multiple factors
- **Search Analytics**: Track user search behavior and popular queries
- **Performance**: Sub-second response times for complex queries

### Search API Examples
```bash
# Basic search
GET /api/products/search?q=laptop

# Advanced search with filters
GET /api/products/search?q=gaming&category=electronics&brand=asus&min_price=500&max_price=2000

# Auto-complete suggestions
GET /api/products/suggest?q=lap

# Bulk product indexing
POST /api/products/index
```

## Enhanced Features

### Meta Fields & Analytics
The platform includes comprehensive meta fields for business intelligence:

- **User Analytics** - Activity tracking, preferences, security monitoring
- **Product Management** - SEO optimization, inventory tracking, financial data
- **Order Analytics** - Marketing attribution, financial breakdown, tracking
- **System Monitoring** - Logging, performance tracking, audit trails
- **Business Intelligence** - Analytics events, user behavior, conversion tracking

### Database Schema
- **Single Database** - All services use one PostgreSQL database for simplicity
- **Meta Fields** - Enhanced tables with analytics, SEO, and business data
- **Additional Tables** - User sessions, reviews, logs, analytics events
- **Sample Data** - Pre-populated with categories and products

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Java 17+ (for local development)
- Firebase project setup

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd E-Commerce
```

### 2. Configure environment variables

Each service has an `.env.example` file. Copy them to `.env` and fill in your configuration:

```bash
# User Service
cp user-service/.env.example user-service/.env

# Product Service
cp product-service/.env.example product-service/.env

# Order Service
cp order-service/.env.example order-service/.env

# API Gateway
cp api-gateway/.env.example api-gateway/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Start all services with Docker Compose

```bash
docker-compose up --build
```

### 4. Access the application

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- User Service: http://localhost:3001
- Product Service: http://localhost:8000
- Order Service: http://localhost:8080
- Elasticsearch: http://localhost:9200

### 5. Test Elasticsearch integration

```bash
# Check Elasticsearch health
curl http://localhost:9200/_cluster/health

# Test product search
curl "http://localhost:4000/api/products/search?q=laptop"

# Test search suggestions
curl "http://localhost:4000/api/products/suggest?q=lap"
```

## Service Documentation

Each service has its own README with detailed setup and development instructions:

- **[User Service](user-service/README.md)** - Node.js + Express + PostgreSQL + Firebase
- **[Product Service](product-service/README.md)** - Python + FastAPI + PostgreSQL + Elasticsearch  
- **[Order Service](order-service/README.md)** - Java + Spring Boot + PostgreSQL + Stripe
- **[API Gateway](api-gateway/README.md)** - TypeScript + Express + Proxy
- **[Frontend](frontend/README.md)** - React + Firebase Auth

## Development Workflow

This project uses a **service-based branching strategy** for independent development:

- **`main`** - Production-ready code
- **`develop`** - Integration branch for all services
- **`testing`** - Integration testing and staging
- **`feature/user-service`** - User service development
- **`feature/product-service`** - Product service development
- **`feature/order-service`** - Order service development
- **`feature/api-gateway`** - API Gateway development
- **`feature/frontend`** - Frontend development

📋 **[See BRANCHING.md for detailed workflow](BRANCHING.md)**

## Service Details

### User Service
- **Technology**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: Firebase Auth + JWT
- **Key Features**: User registration, login, profile management

### Product Service
- **Technology**: Python, FastAPI
- **Database**: PostgreSQL
- **Search Engine**: Elasticsearch 8.11.0
- **Key Features**: 
  - Product CRUD operations
  - Category management
  - Advanced search with filters (category, brand, price)
  - Real-time search suggestions
  - Fuzzy matching for typo tolerance
  - Search analytics and performance tracking

### Order Service
- **Technology**: Java, Spring Boot
- **Database**: PostgreSQL
- **Payment**: Stripe API
- **Key Features**: Order management, payment processing, invoicing

### API Gateway
- **Technology**: TypeScript, Express
- **Key Features**: Request routing, authentication, rate limiting, logging

### Frontend
- **Technology**: React
- **Key Features**: Product browsing, cart, checkout, authentication

## API Endpoints

### User Service (via API Gateway)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Product Service (via API Gateway)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/products/search` - Advanced product search with filters
- `GET /api/products/suggest` - Auto-complete search suggestions
- `POST /api/products/index` - Bulk index products to Elasticsearch

### Order Service (via API Gateway)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/:id/payment` - Process payment

## Development

### Running services individually

Each service can be run independently for development:

#### User Service
```bash
cd user-service
npm install
npm run dev
```

#### Product Service
```bash
cd product-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Order Service
```bash
cd order-service
./mvnw spring-boot:run
```

#### API Gateway
```bash
cd api-gateway
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Elasticsearch Configuration

### Search Engine Setup
The Elasticsearch integration is pre-configured with:

- **Index Mapping**: Enhanced product fields with meta data
- **Search Configuration**: Fuzzy matching, auto-complete, filtering
- **Performance**: Optimized for sub-second search responses
- **Analytics**: Search behavior tracking and insights

### Elasticsearch Management

```bash
# Check Elasticsearch status
docker-compose ps elasticsearch

# View Elasticsearch logs
docker-compose logs elasticsearch

# Check search index
curl http://localhost:9200/products/_mapping

# Test search functionality
curl "http://localhost:9200/products/_search?q=laptop"
```

### Search Performance
- **Response Time**: < 100ms for typical queries
- **Concurrent Users**: Supports 1000+ simultaneous searches
- **Index Size**: Optimized for millions of products
- **Memory Usage**: 512MB heap size for development

## Docker Support

Each service includes:
- Individual `Dockerfile` for building service images
- Docker Compose configuration for orchestration
- Elasticsearch container with optimized settings

## License

MIT

## Contributors

Your Team

