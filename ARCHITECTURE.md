# E-Commerce Microservices Architecture

## System Architecture Overview

This document describes the architecture of the E-Commerce microservices platform.

## Architecture Diagram

```
┌─────────────┐
│   Frontend  │ (React - Port 3000)
│   (React)   │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼──────────────────────────────────────┐
│          API Gateway                         │
│    (TypeScript + Express - Port 4000)        │
│  - Authentication (Firebase)                 │
│  - Rate Limiting                             │
│  - Request Routing                           │
│  - Logging                                   │
└─────┬────────────┬────────────┬─────────────┘
      │            │            │
      │            │            │
┌─────▼─────┐ ┌───▼────────┐ ┌─▼──────────┐
│   User    │ │  Product   │ │   Order    │
│  Service  │ │  Service   │ │  Service   │
│ (Node.js) │ │ (Python)   │ │   (Java)   │
│Port 3001  │ │ Port 8000  │ │ Port 8080  │
└─────┬─────┘ └─────┬──────┘ └─────┬──────┘
      │             │              │
      │             │              │
      └─────────────┼──────────────┘
                    │
              ┌─────▼──────────────────────┐
              │     Centralized Database    │
              │    PostgreSQL (ecommerce)   │
              │        Port 5432            │
              │  - Users, Products, Orders │
              │  - Meta Fields & Analytics │
              │  - Single Database Instance │
              └─────────────┬──────────────┘
                            │
                    ┌───────▼──────────┐
                    │ Elasticsearch    │
                    │   Port 9200      │
                    └──────────────────┘
```

## Services Description

### 1. Frontend (React)

**Technology Stack:**
- React 18
- React Router
- Axios for API calls
- Firebase Authentication SDK
- Context API for state management

**Key Features:**
- User authentication (login/register)
- Product browsing and search
- Shopping cart management
- Order history
- Responsive design

**Port:** 3000

**Communication:** 
- Communicates with API Gateway only
- Uses Firebase for client-side authentication

---

### 2. API Gateway (TypeScript + Express)

**Technology Stack:**
- TypeScript
- Express.js
- http-proxy-middleware for routing
- Firebase Admin SDK for token verification
- express-rate-limit for rate limiting

**Key Responsibilities:**
- **Request Routing:** Forwards requests to appropriate microservices
- **Authentication:** Verifies Firebase tokens before forwarding requests
- **Rate Limiting:** Prevents abuse (100 req/15min general, 5 req/15min for auth)
- **Logging:** Tracks all incoming requests
- **CORS Handling:** Manages cross-origin requests

**Port:** 4000

**Routes:**
- `/api/users/*` → User Service
- `/api/products/*` → Product Service
- `/api/categories/*` → Product Service
- `/api/orders/*` → Order Service
- `/api/payments/*` → Order Service

---

### 3. User Service (Node.js + Express)

**Technology Stack:**
- Node.js + Express.js
- PostgreSQL for user data
- Firebase Admin SDK for authentication
- JWT for session management
- bcrypt for password hashing

**Key Responsibilities:**
- User registration and login
- Firebase authentication integration
- User profile management
- Store user data in SQL database

**Database Schema:**
```sql
users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  -- Meta fields for analytics
  status VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  source VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
)
```

**Port:** 3001

**Authentication Flow:**
1. User registers/logs in via Firebase (frontend)
2. Firebase returns ID token
3. Token sent to User Service via API Gateway
4. User Service verifies token with Firebase Admin SDK
5. User data stored/retrieved from PostgreSQL

---

### 4. Product Service (Python + FastAPI)

**Technology Stack:**
- Python 3.11
- FastAPI
- PostgreSQL for product data
- Elasticsearch for product search
- SQLAlchemy ORM
- Pydantic for data validation

**Key Responsibilities:**
- Product catalog management (CRUD)
- Category management
- Product search with Elasticsearch
- Product filtering and sorting

**Database Schema:**
```sql
categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  description TEXT,
  -- Meta fields for SEO and analytics
  slug VARCHAR(100) UNIQUE,
  seo_title VARCHAR(255),
  seo_description TEXT,
  meta_keywords TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  stock INTEGER,
  category_id INTEGER REFERENCES categories(id),
  image_url VARCHAR(500),
  -- Meta fields for e-commerce
  sku VARCHAR(100) UNIQUE,
  brand VARCHAR(100),
  weight DECIMAL(8,2),
  dimensions VARCHAR(100),
  color VARCHAR(50),
  size VARCHAR(50),
  is_featured BOOLEAN DEFAULT FALSE,
  is_digital BOOLEAN DEFAULT FALSE,
  requires_shipping BOOLEAN DEFAULT TRUE,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  seo_title VARCHAR(255),
  seo_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Port:** 8000

**Features:**
- RESTful API with automatic OpenAPI/Swagger documentation
- Fast async request handling
- Advanced search capabilities via Elasticsearch with meta fields
- Data validation with Pydantic schemas
- Enhanced search with filters (category, brand, price range)
- Auto-complete suggestions for product names
- SEO-optimized search with meta keywords
- Analytics integration for search performance

---

### 5. Order Service (Java + Spring Boot)

**Technology Stack:**
- Java 17
- Spring Boot 3.2
- Spring Data JPA
- PostgreSQL for order data
- Stripe SDK for payments
- Lombok for boilerplate reduction

**Key Responsibilities:**
- Order creation and management
- Order status tracking
- Payment processing with Stripe
- Invoice generation

**Database Schema:**
```sql
orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  total_amount DECIMAL(10,2),
  status VARCHAR(50), -- PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  shipping_address TEXT,
  -- Meta fields for order management
  order_number VARCHAR(50) UNIQUE,
  payment_status VARCHAR(50),
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER,
  product_name VARCHAR(255),
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  -- Meta fields for order items
  product_sku VARCHAR(100),
  product_brand VARCHAR(100),
  product_weight DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  amount DECIMAL(10,2),
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(50), -- PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
  payment_method VARCHAR(50),
  -- Meta fields for payment tracking
  gateway_response JSONB,
  refund_amount DECIMAL(10,2) DEFAULT 0.00,
  refund_reason TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Port:** 8080

**Payment Flow:**
1. User creates order
2. Service creates Stripe Payment Intent
3. Frontend handles payment confirmation
4. Webhook updates payment status
5. Order status updated accordingly

---

## Database Strategy

### Centralized Database Architecture

All microservices share a single PostgreSQL database instance with the `ecommerce` database:

- **Single Database** (port 5432): All tables in one `ecommerce` database
- **Default Credentials**: `postgres/postgres` for simplicity
- **Shared Schema**: Users, products, orders, and meta tables
- **Enhanced Features**: Meta fields for analytics and business intelligence

**Benefits:**
- **Simplified Development**: Single database for all developers
- **Easy Setup**: Default PostgreSQL credentials
- **Cross-Service Queries**: Direct foreign key relationships
- **Unified Analytics**: Meta fields across all entities
- **Reduced Complexity**: No database orchestration needed

**Database Schema:**
```sql
-- Core Tables
users (id, firebase_uid, email, first_name, last_name, ...)
categories (id, name, description, slug, ...)
products (id, name, description, price, stock, category_id, sku, brand, ...)
orders (id, user_id, total_amount, status, order_number, ...)
order_items (id, order_id, product_id, quantity, unit_price, ...)
payments (id, order_id, amount, stripe_payment_intent_id, status, ...)

-- Meta Tables
user_sessions (id, user_id, session_token, ip_address, ...)
product_reviews (id, product_id, user_id, rating, comment, ...)
system_logs (id, service_name, level, message, timestamp, ...)
analytics_events (id, event_type, user_id, product_id, metadata, ...)
```

**Enhanced Features:**
- **Meta Fields**: Status, timestamps, analytics data on all tables
- **Business Intelligence**: Comprehensive tracking and reporting
- **SEO Optimization**: Slug fields, meta descriptions
- **Audit Trail**: Created/updated timestamps, soft deletes
- **Performance**: Optimized indexes for all meta fields

---

## Elasticsearch Integration

### Search Engine Architecture

Elasticsearch is integrated with the Product Service for advanced product search capabilities:

**Configuration:**
- **Version**: Elasticsearch 8.11.0
- **Port**: 9200
- **Memory**: 512MB heap size
- **Security**: Disabled for development
- **Index**: `products` with enhanced mapping

**Enhanced Search Features:**
```json
{
  "search_endpoints": {
    "/api/products/search": "Advanced product search with filters",
    "/api/products/suggest": "Auto-complete suggestions",
    "/api/products/index": "Bulk product indexing"
  },
  "search_capabilities": {
    "full_text_search": "Multi-field search across name, description, brand, SKU",
    "fuzzy_matching": "Auto-correct typos in search queries",
    "filtering": "Category, brand, price range, availability filters",
    "sorting": "Relevance score, price, date, popularity",
    "pagination": "Configurable page size and offset",
    "suggestions": "Real-time search suggestions"
  }
}
```

**Elasticsearch Mapping:**
```json
{
  "mappings": {
    "properties": {
      "name": {"type": "text", "fields": {"suggest": {"type": "completion"}}},
      "description": {"type": "text"},
      "price": {"type": "float"},
      "sku": {"type": "keyword"},
      "brand": {"type": "keyword"},
      "category_name": {"type": "keyword"},
      "meta_keywords": {"type": "text"},
      "is_featured": {"type": "boolean"},
      "view_count": {"type": "integer"},
      "rating_avg": {"type": "float"}
    }
  }
}
```

**Search API Examples:**
```bash
# Basic search
GET /api/products/search?q=laptop

# Advanced search with filters
GET /api/products/search?q=gaming&category=electronics&brand=asus&min_price=500&max_price=2000

# Auto-complete suggestions
GET /api/products/suggest?q=lap

# Bulk indexing
POST /api/products/index
```

**Benefits:**
- **Fast Search**: Sub-second response times for complex queries
- **Relevance Scoring**: Intelligent ranking based on multiple factors
- **Scalability**: Handles millions of products efficiently
- **Analytics**: Search performance and user behavior tracking
- **SEO**: Meta keywords integration for better search visibility

---

## Meta Fields & Analytics Architecture

### Enhanced Database Schema

The centralized database includes comprehensive meta fields across all entities for advanced analytics and business intelligence:

**Core Meta Fields:**
- **Status Tracking**: Active/inactive states for all entities
- **Timestamps**: Created, updated, deleted timestamps with soft delete support
- **SEO Optimization**: Slug fields, meta titles, descriptions, keywords
- **Analytics Data**: User behavior tracking, performance metrics
- **Business Intelligence**: Revenue tracking, inventory management, customer insights

**Additional Meta Tables:**
```sql
-- User session tracking
user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_token VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMP,
  logout_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
)

-- Product reviews and ratings
product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- System logging and monitoring
system_logs (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(50),
  level VARCHAR(20), -- INFO, WARN, ERROR, DEBUG
  message TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- Analytics events for business intelligence
analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100), -- page_view, product_view, add_to_cart, purchase, etc.
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  session_id VARCHAR(255),
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Benefits of Meta Fields:**
- **Advanced Analytics**: Track user behavior, product performance, revenue metrics
- **SEO Optimization**: Search engine friendly URLs and meta data
- **Business Intelligence**: Comprehensive reporting and insights
- **Performance Monitoring**: System health and user experience tracking
- **Audit Trail**: Complete history of all entity changes

---

## Authentication & Authorization

### Firebase Authentication Flow

1. **Registration/Login:**
   - User enters credentials in frontend
   - Firebase SDK authenticates user
   - Firebase returns ID token
   - Token stored in localStorage

2. **API Requests:**
   - Frontend includes token in Authorization header
   - API Gateway verifies token with Firebase Admin SDK
   - Valid token → request forwarded to service
   - Invalid token → 401 Unauthorized

3. **User Data Storage:**
   - Firebase handles authentication
   - PostgreSQL stores user profile data
   - Firebase UID links to database record

### Security Features

- **Rate Limiting:** 
  - General endpoints: 100 requests/15 minutes
  - Auth endpoints: 5 requests/15 minutes
- **CORS:** Configured for frontend origin
- **Token Verification:** All protected routes verify Firebase tokens
- **HTTPS Ready:** Security headers configured

---

## Inter-Service Communication

### RESTful Communication via API Gateway

All services communicate through the API Gateway using REST APIs:

- **Synchronous:** HTTP/HTTPS requests
- **Stateless:** No session state in services
- **JSON:** Standard data format
- **Idempotent:** Safe retry of failed requests

**Example Flow - Creating an Order:**
1. Frontend → API Gateway: `POST /api/orders`
2. API Gateway → Order Service: Forward request
3. Order Service → Product Service: Verify product availability (future)
4. Order Service → Payment Service (Stripe): Process payment
5. Order Service → API Gateway → Frontend: Return order confirmation

---

## Scalability Considerations

### Horizontal Scaling

Each service can scale independently:

```yaml
# Example docker-compose scaling
docker-compose up --scale user-service=3 --scale product-service=2
```

### Load Balancing

- API Gateway can be load balanced (nginx, AWS ALB)
- Each service can have multiple instances
- Database read replicas for heavy read loads

### Caching Strategy (Future)

- Redis for session data
- Elasticsearch for product search caching
- CDN for static assets

---

## Deployment Architecture

### Docker Compose (Development)

All services run in Docker containers with:
- Isolated networks
- Volume persistence for databases
- Health checks for dependencies
- Automatic restarts

### Production Considerations

**Kubernetes Deployment:**
```
- Separate pods for each service
- ConfigMaps for configuration
- Secrets for sensitive data
- Ingress for routing
- Persistent volumes for databases
```

**Cloud Options:**
- AWS: ECS/EKS, RDS, ElastiCache, API Gateway
- GCP: GKE, Cloud SQL, Cloud Run
- Azure: AKS, Azure Database, API Management

---

## Monitoring & Logging

### Current Implementation

- Console logging in all services
- Docker container logs accessible via `docker-compose logs`
- Health check endpoints in all services

### Future Enhancements

- **Centralized Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics:** Prometheus + Grafana
- **Distributed Tracing:** Jaeger or Zipkin
- **APM:** New Relic, Datadog, or Application Insights

---

## Technology Choices Rationale

### Why Multiple Languages?

1. **Node.js (User Service):**
   - Fast development
   - Excellent Firebase SDK support
   - Event-driven for real-time features

2. **Python (Product Service):**
   - Great ML libraries for recommendations (future)
   - Excellent Elasticsearch integration
   - Fast API development with FastAPI

3. **Java (Order Service):**
   - Enterprise-grade reliability
   - Strong typing for financial transactions
   - Excellent Spring ecosystem
   - Battle-tested for critical operations

### Why PostgreSQL?

- ACID compliance for transactions
- Excellent performance
- Rich feature set
- Strong community support
- Free and open-source

### Why Firebase Authentication?

- Quick setup and integration
- Secure by default
- Handles complex auth flows
- Supports multiple providers
- Free tier for development

---

## API Versioning Strategy

Future consideration for API versioning:

```
/api/v1/users/*
/api/v2/users/*
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error type",
  "message": "Human readable message",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/users/123"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Future Enhancements

1. **Service Mesh:** Istio for advanced traffic management
2. **Event-Driven Architecture:** Kafka/RabbitMQ for async communication
3. **CQRS:** Command Query Responsibility Segregation
4. **GraphQL Gateway:** Alternative to REST API
5. **Recommendation Engine:** ML-based product recommendations
6. **Real-time Features:** WebSockets for live updates
7. **Admin Dashboard:** Service for managing products, orders, users

---

## Conclusion

This microservices architecture provides:

✅ **Scalability:** Each service scales independently  
✅ **Flexibility:** Different technologies for different needs  
✅ **Resilience:** Service isolation prevents cascading failures  
✅ **Maintainability:** Clear separation of concerns  
✅ **Developer Experience:** Modern tools and frameworks  

The architecture is production-ready with proper configuration and can handle real-world e-commerce workloads.

