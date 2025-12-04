# Postman Collections - Quick Start

## 📦 What's New

The Postman collections have been reorganized into **separate collections per service** plus a **master API Gateway collection**.

## 📂 Location

All Postman collections are now in the `postman/` directory:

```
postman/
├── README.md                                    # Comprehensive guide
├── E-Commerce-Local.postman_environment.json   # Environment template
├── api-gateway.postman_collection.json         # ⭐ Master collection (RECOMMENDED)
├── user-service.postman_collection.json        # Direct user service access
├── product-service.postman_collection.json     # Direct product service access
└── order-service.postman_collection.json       # Direct order service access
```

## 🚀 Quick Start

### 1. Import Collections

**Option A: Import All at Once**
1. Open Postman
2. Click **Import** → **Folder**
3. Select `postman/` directory
4. Click **Select Folder**

**Option B: Import Individual Collections**
1. Open Postman
2. Click **Import** → **File**
3. Select desired `.postman_collection.json` file

### 2. Import Environment

1. Click **Import** → **File**
2. Select `postman/E-Commerce-Local.postman_environment.json`
3. Select the environment from the dropdown in top-right corner

### 3. Start Testing

**Recommended:** Use the **API Gateway** collection for most testing scenarios.

**Quick Test Flow:**
1. Run: `User Service` → `Register User` (saves auth token automatically)
2. Run: `Product Service` → `Get All Products`
3. Run: `Order Service` → `Create Order`

## 📚 Collections Overview

### 🌟 API Gateway (Master Collection)
**File:** `api-gateway.postman_collection.json`  
**Base URL:** `http://localhost:4000`

**Use this for:**
- ✅ Complete system integration testing
- ✅ End-to-end user flows
- ✅ Testing gateway routing and authentication
- ✅ Production-like testing scenarios

**Contains:**
- Health checks
- User authentication & management
- Product browsing & management
- Order creation & management
- Payment processing
- Complete user journey scenarios

---

### 👤 User Service Collection
**File:** `user-service.postman_collection.json`  
**Base URL:** `http://localhost:3001`

**Use this for:**
- Testing user service in isolation
- Debugging authentication issues
- Direct Firebase integration testing

**Endpoints:**
- Register, Login, Logout
- Profile management
- Token verification

---

### 📦 Product Service Collection
**File:** `product-service.postman_collection.json`  
**Base URL:** `http://localhost:8000`

**Use this for:**
- Testing product service in isolation
- Debugging search/filtering
- Testing Elasticsearch integration

**Endpoints:**
- Product CRUD operations
- Search & filtering
- Category management
- Stock validation

---

### 🛒 Order Service Collection
**File:** `order-service.postman_collection.json`  
**Base URL:** `http://localhost:8080`

**Use this for:**
- Testing order service in isolation
- Debugging order processing
- Testing service-to-service calls

**Endpoints:**
- Order creation
- Order retrieval
- Status updates
- Order history

---

## 🔐 Authentication

Authentication is handled automatically:

1. Run **Register User** or **Login User** in any collection
2. Token is automatically saved to `FIREBASE_ID_TOKEN` variable
3. All subsequent requests use this token automatically

## 🛠️ Troubleshooting

### Services Not Running?
```bash
docker compose up -d
docker compose ps
```

### Need Fresh Token?
Run the **Login User** request again

### Service Unreachable?
Check health endpoints:
- Gateway: `http://localhost:4000/health`
- User: `http://localhost:3001/health`
- Product: `http://localhost:8000/health`
- Order: `http://localhost:8080/api/v1/orders/health`

## 📖 Full Documentation

For detailed documentation, see: **`postman/README.md`**

Includes:
- Complete usage guide
- Testing scenarios
- Troubleshooting tips
- Best practices
- Service endpoint reference

## 🎯 Recommended Testing Order

1. **API Gateway Collection** → `Complete User Flow` folder
   - Runs through entire e-commerce journey
   - Tests all services through gateway

2. **Individual Service Collections**
   - Test specific features
   - Debug service-specific issues

## 📝 Environment Variables

The environment includes:

| Variable | Description | Auto-Set? |
|----------|-------------|-----------|
| `BASE_URL` | API Gateway URL | No |
| `USER_SERVICE_URL` | User Service URL | No |
| `PRODUCT_SERVICE_URL` | Product Service URL | No |
| `ORDER_SERVICE_URL` | Order Service URL | No |
| `FIREBASE_ID_TOKEN` | Auth token | ✅ Yes (on login) |
| `USER_ID` | User UID | ✅ Yes (on login) |
| `ORDER_ID` | Order ID | ✅ Yes (on order creation) |
| `PRODUCT_ID` | Product ID | No (default: 1) |

---

**Need Help?** Check `postman/README.md` for comprehensive documentation.

**Last Updated:** 2025-12-03
