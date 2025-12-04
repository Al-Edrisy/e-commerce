# E-Commerce Platform - Postman Collections

This directory contains separate Postman collections for each microservice and a master collection for the API Gateway.

## 📦 Collections Overview

### 1. **API Gateway - Master Collection** (`api-gateway.postman_collection.json`)
**Recommended for most use cases**

This is the **master collection** that routes all requests through the API Gateway. Use this collection when:
- Testing the complete system integration
- Simulating real-world client requests
- Testing the gateway's routing, authentication, and rate limiting
- Running end-to-end user flows

**Base URL:** `http://localhost:4000`

**Features:**
- ✅ Complete user authentication flow
- ✅ Product browsing and management
- ✅ Order creation and management
- ✅ Payment processing
- ✅ End-to-end user journey scenarios

---

### 2. **User Service Collection** (`user-service.postman_collection.json`)
Direct access to the User Service (Firebase/Firestore)

Use this collection when:
- Testing user service independently
- Debugging user authentication issues
- Developing/testing user service features

**Base URL:** `http://localhost:3001`

**Endpoints:**
- Health check
- User registration
- User login
- Token verification
- Profile management
- User logout

---

### 3. **Product Service Collection** (`product-service.postman_collection.json`)
Direct access to the Product Service (Python/FastAPI)

Use this collection when:
- Testing product service independently
- Debugging product search/filtering
- Developing/testing product features
- Testing Elasticsearch integration

**Base URL:** `http://localhost:8000`

**Endpoints:**
- Health check
- Product CRUD operations
- Product search (Elasticsearch)
- Category management
- Product validation (for orders)
- Stock management

---

### 4. **Order Service Collection** (`order-service.postman_collection.json`)
Direct access to the Order Service (Java/Spring Boot)

Use this collection when:
- Testing order service independently
- Debugging order processing
- Developing/testing order features
- Testing service-to-service communication

**Base URL:** `http://localhost:8080`

**Endpoints:**
- Health check
- Order creation
- Order retrieval
- Order status updates
- User order history

---

## 🚀 Getting Started

### Prerequisites

1. **Start all services:**
   ```bash
   cd /Users/aledrisy/Desktop/e-commerce-feature-product-service
   docker compose up -d
   ```

2. **Verify services are running:**
   ```bash
   ./test-services.sh
   ```

### Import Collections into Postman

1. Open Postman
2. Click **Import** button
3. Select **Folder** tab
4. Navigate to `/Users/aledrisy/Desktop/e-commerce-feature-product-service/postman/`
5. Click **Select Folder** to import all collections at once

Alternatively, import individual collections:
- Click **Import** → **File**
- Select the desired `.postman_collection.json` file

### Set Up Environment Variables

Create a Postman environment with the following variables:

```json
{
  "BASE_URL": "http://localhost:4000",
  "USER_SERVICE_URL": "http://localhost:3001",
  "PRODUCT_SERVICE_URL": "http://localhost:8000",
  "ORDER_SERVICE_URL": "http://localhost:8080",
  "FIREBASE_ID_TOKEN": "",
  "USER_ID": "",
  "ORDER_ID": "",
  "PRODUCT_ID": "1"
}
```

**Note:** `FIREBASE_ID_TOKEN` and `USER_ID` will be automatically set when you register or login.

---

## 📖 Usage Guide

### Recommended Testing Flow

#### 1. **Start with API Gateway Collection**

Follow the "Complete User Flow" folder in the API Gateway collection:

1. **Register New User** - Creates account and saves token
2. **Browse Products** - View available products
3. **Search for Product** - Test search functionality
4. **Get Product Details** - View specific product
5. **Create Order** - Place an order
6. **Create Payment Intent** - Initialize payment
7. **Get Order Status** - Check order details
8. **Get User Profile** - View user information

#### 2. **Test Individual Services**

Use service-specific collections to:
- Test new features in isolation
- Debug service-specific issues
- Verify service health
- Test inter-service communication

---

## 🔐 Authentication

### Collection-Level Authentication

All collections use **Bearer Token** authentication at the collection level:
- Token variable: `{{FIREBASE_ID_TOKEN}}`
- Automatically applied to all requests (except those with `noauth`)

### Getting Authentication Token

1. Run **Register User** or **Login User** request
2. Token is automatically saved to environment variable `FIREBASE_ID_TOKEN`
3. All subsequent authenticated requests will use this token

### Manual Token Setup

If needed, you can manually set the token:
1. Get token from Firebase Authentication
2. Set in Postman environment: `FIREBASE_ID_TOKEN = your_token_here`

---

## 🧪 Testing Scenarios

### Scenario 1: Complete E-Commerce Flow (Gateway)
```
1. Register User → 2. Browse Products → 3. Create Order → 4. Process Payment
```

### Scenario 2: Product Management (Product Service)
```
1. Get All Products → 2. Search Products → 3. Create Product (Admin) → 4. Update Product
```

### Scenario 3: Order Processing (Order Service)
```
1. Create Order → 2. Get Order by ID → 3. Update Order Status → 4. Get User Orders
```

### Scenario 4: User Management (User Service)
```
1. Register → 2. Login → 3. Get Profile → 4. Update Profile → 5. Logout
```

---

## 🔍 Service Endpoints Reference

### API Gateway Routes

| Service | Gateway Route | Direct Service Route |
|---------|---------------|---------------------|
| User Service | `/api/users/*` | `http://localhost:3001/users/*` |
| Product Service | `/api/products/*` | `http://localhost:8000/api/products/*` |
| Order Service | `/api/orders/*` | `http://localhost:8080/api/v1/orders/*` |
| Payment Service | `/api/payments/*` | *(Handled by Order Service)* |

### Health Check Endpoints

| Service | Endpoint |
|---------|----------|
| API Gateway | `http://localhost:4000/health` |
| User Service | `http://localhost:3001/health` |
| Product Service | `http://localhost:8000/health` |
| Order Service | `http://localhost:8080/api/v1/orders/health` |

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. **401 Unauthorized**
- **Cause:** Missing or expired authentication token
- **Solution:** Run Register/Login request to get a fresh token

#### 2. **404 Not Found**
- **Cause:** Service not running or incorrect URL
- **Solution:** 
  ```bash
  docker compose ps
  ./test-services.sh
  ```

#### 3. **500 Internal Server Error**
- **Cause:** Service error or database connection issue
- **Solution:** Check service logs:
  ```bash
  docker compose logs -f [service-name]
  ```

#### 4. **Connection Refused**
- **Cause:** Service container not running
- **Solution:** 
  ```bash
  docker compose up -d [service-name]
  ```

### Debugging Tips

1. **Check Service Health:**
   ```bash
   curl http://localhost:4000/health  # Gateway
   curl http://localhost:3001/health  # User Service
   curl http://localhost:8000/health  # Product Service
   curl http://localhost:8080/api/v1/orders/health  # Order Service
   ```

2. **View Service Logs:**
   ```bash
   docker compose logs -f api-gateway
   docker compose logs -f user-service
   docker compose logs -f product-service
   docker compose logs -f order-service
   ```

3. **Restart Services:**
   ```bash
   docker compose restart
   ```

---

## 📝 Collection Variables

### Global Variables (Set in Environment)

| Variable | Description | Example |
|----------|-------------|---------|
| `BASE_URL` | API Gateway URL | `http://localhost:4000` |
| `USER_SERVICE_URL` | User Service URL | `http://localhost:3001` |
| `PRODUCT_SERVICE_URL` | Product Service URL | `http://localhost:8000` |
| `ORDER_SERVICE_URL` | Order Service URL | `http://localhost:8080` |
| `FIREBASE_ID_TOKEN` | Auth token (auto-set) | `eyJhbGc...` |
| `USER_ID` | User UID (auto-set) | `abc123...` |
| `ORDER_ID` | Order ID (auto-set) | `550e8400...` |
| `PRODUCT_ID` | Product ID | `1` |

### Auto-Set Variables

These variables are automatically set by test scripts:
- `FIREBASE_ID_TOKEN` - Set after Register/Login
- `USER_ID` - Set after Register/Login
- `ORDER_ID` - Set after Create Order

---

## 🎯 Best Practices

1. **Use API Gateway Collection for Integration Testing**
   - Tests the complete system as users would interact with it
   - Validates gateway routing and authentication

2. **Use Service Collections for Unit Testing**
   - Test individual services in isolation
   - Faster debugging and development

3. **Create Separate Environments**
   - Development: `http://localhost:4000`
   - Staging: `https://staging-api.example.com`
   - Production: `https://api.example.com`

4. **Use Collection Runner**
   - Run entire folders sequentially
   - Automate testing workflows
   - Generate test reports

5. **Save Responses**
   - Use Postman's "Save Response" feature
   - Document expected responses
   - Create examples for team members

---

## 📚 Additional Resources

- **Architecture Documentation:** `../ARCHITECTURE.md`
- **Quick Reference:** `../QUICK_REFERENCE.md`
- **API Testing Guide:** `../API_TESTING_GUIDE.md` (if exists)
- **Service Documentation:**
  - User Service: `../user-service/README.md`
  - Product Service: `../product-service/README.md`
  - Order Service: `../order-service/README.md`

---

## 🤝 Contributing

When adding new endpoints:

1. Add to the appropriate service collection
2. Add to the API Gateway collection (if exposed through gateway)
3. Update this README with new endpoints
4. Include example requests and responses
5. Add test scripts for auto-setting variables

---

## 📄 License

This collection is part of the E-Commerce Platform project.

---

**Last Updated:** 2025-12-03  
**Version:** 1.0.0  
**Maintainer:** Development Team
