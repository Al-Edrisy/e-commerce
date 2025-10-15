# E-Commerce Microservices - Setup Guide

This guide will help you set up and run the complete microservices e-commerce platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
- **Node.js** (version 18+) - for local development
- **Python** (version 3.11+) - for local development
- **Java** (version 17+) and **Maven** - for local development
- **Firebase Project** - create one at https://console.firebase.google.com

## Project Structure

```
E-Commerce/
├── user-service/          # Node.js + Express + PostgreSQL + Firebase Auth
├── product-service/       # Python + FastAPI + PostgreSQL + Elasticsearch
├── order-service/         # Java + Spring Boot + PostgreSQL + Stripe
├── api-gateway/          # TypeScript + Express (Proxy + Auth)
├── frontend/             # React Application
├── docker-compose.yml    # Docker orchestration
└── README.md
```

## Quick Start with Docker

### 1. Configure Environment Variables

Each service needs environment configuration. Copy the template files:

```bash
# User Service
cp user-service/env.template user-service/.env

# Product Service
cp product-service/env.template product-service/.env

# Order Service
cp order-service/env.template order-service/.env

# API Gateway
cp api-gateway/env.template api-gateway/.env

# Frontend
cp frontend/env.template frontend/.env
```

### 2. Update Firebase Configuration

You need to configure Firebase for authentication:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use an existing one
3. Go to Project Settings > Service Accounts
4. Generate a new private key (downloads a JSON file)
5. Update the following files with your Firebase credentials:
   - `user-service/.env`
   - `api-gateway/.env`
   - `frontend/.env`

**For user-service and api-gateway (.env):**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**For frontend (.env):**
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 3. Configure Stripe (Optional)

For payment processing, sign up at [Stripe](https://stripe.com) and get your API keys:

Update `order-service/.env`:
```env
STRIPE_API_KEY=sk_test_your_stripe_secret_key
```

### 4. Start All Services

Run the entire platform with Docker Compose:

```bash
docker-compose up --build
```

This will start:
- User Service on port 3001
- Product Service on port 8000
- Order Service on port 8080
- API Gateway on port 4000
- Frontend on port 3000
- PostgreSQL instances on ports 5432, 5433, 5434
- Elasticsearch on port 9200

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **User Service**: http://localhost:3001
- **Product Service**: http://localhost:8000/docs (Swagger UI)
- **Order Service**: http://localhost:8080

## Local Development Setup

If you want to run services individually for development:

### User Service

```bash
cd user-service
npm install
cp env.template .env
# Edit .env with your configuration
npm run dev
```

### Product Service

```bash
cd product-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.template .env
# Edit .env with your configuration
uvicorn main:app --reload
```

### Order Service

```bash
cd order-service
cp env.template .env
# Edit .env with your configuration
./mvnw spring-boot:run
```

### API Gateway

```bash
cd api-gateway
npm install
cp env.template .env
# Edit .env with your configuration
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp env.template .env
# Edit .env with your configuration
npm start
```

## Database Initialization

The database is automatically initialized with comprehensive schema and meta fields when Docker containers start. The centralized `database/init.sql` file includes:

### Enhanced Schema with Meta Fields
- **Users Table** - 12 meta fields (status, activity tracking, preferences, security)
- **Categories Table** - 10 meta fields (hierarchy, SEO, marketing, analytics)
- **Products Table** - 25 meta fields (inventory, SEO, marketing, financial tracking)
- **Orders Table** - 20 meta fields (order management, financial breakdown, tracking)
- **Order Items Table** - 8 meta fields (product preservation, pricing details)
- **Payments Table** - 15 meta fields (payment processing, financial tracking)

### Additional Meta Tables
- **User Sessions** - Session management and security
- **Product Reviews** - Customer feedback and ratings
- **System Logs** - Application monitoring and debugging
- **Analytics Events** - User behavior and business intelligence

### Sample Data
- Pre-populated categories with SEO titles and featured flags
- Sample products with SKUs, brands, tags, and financial data
- Complete meta field examples for development

## API Endpoints

### User Service (via API Gateway)

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update profile (requires auth)

### Product Service (via API Gateway)

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=query` - Search products
- `GET /api/categories` - List all categories

### Order Service (via API Gateway)

- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders` - Get user orders (requires auth)
- `GET /api/orders/:id` - Get order by ID (requires auth)
- `POST /api/payments/create-intent` - Create payment intent (requires auth)

## Troubleshooting

### Services not starting

1. Check if all required ports are available (3000, 3001, 4000, 5432, 5433, 5434, 8000, 8080, 9200)
2. Ensure Docker is running and has enough resources allocated
3. Check logs: `docker-compose logs [service-name]`

### Database connection issues

1. Wait for databases to fully initialize (check health status)
2. Verify environment variables in .env files
3. Check database logs: `docker-compose logs postgres-user`

### Firebase authentication not working

1. Verify Firebase credentials in .env files
2. Ensure Firebase project has Authentication enabled
3. Check that Email/Password authentication is enabled in Firebase Console

### Build failures

1. Clear Docker cache: `docker-compose down -v`
2. Rebuild from scratch: `docker-compose up --build --force-recreate`
3. Check individual service logs for specific errors

## Development Notes

### Folder Structure Convention

- **user-service/**: JavaScript/Node.js service with minimal folder structure
- **product-service/**: Python service with `app/` directory for application code
- **order-service/**: Java/Spring Boot with Maven standard structure
- **api-gateway/**: TypeScript service with `src/` directory
- **frontend/**: React with standard CRA structure

### Adding New Features

1. Implement business logic in respective service
2. Update database schema in `init.sql` if needed
3. Add API endpoints
4. Update API Gateway routes if needed
5. Update frontend to consume new endpoints

## Security Considerations

⚠️ **IMPORTANT for Production:**

1. Change all default passwords in environment files
2. Use strong JWT secrets
3. Enable HTTPS/TLS for all services
4. Use production Firebase and Stripe credentials
5. Implement proper error handling and logging
6. Add input validation and sanitization
7. Enable rate limiting on sensitive endpoints
8. Regular security audits and dependency updates

## Next Steps

1. Implement the TODO endpoints in each service
2. Add comprehensive error handling
3. Implement logging and monitoring
4. Add unit and integration tests
5. Set up CI/CD pipelines
6. Configure production deployment

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f [service-name]`
2. Review the service-specific README files
3. Check environment variable configuration
4. Ensure all prerequisites are installed

## License

MIT License - See LICENSE file for details

