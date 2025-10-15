# API Gateway

Central routing and authentication service for the E-Commerce microservices platform.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Authentication**: Firebase Admin SDK
- **Proxy**: http-proxy-middleware
- **Port**: 4000

## Prerequisites

- Node.js 18+
- Firebase project with Admin SDK
- All microservices running

## Environment Variables

```env
NODE_ENV=production
PORT=4000
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:8000
ORDER_SERVICE_URL=http://localhost:8080
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build TypeScript:
   ```bash
   npm run build
   ```

3. Configure environment:
   ```bash
   cp env.template .env
   # Edit .env with your configuration
   ```

4. Start the service:
   ```bash
   npm start
   # For development: npm run dev
   ```

5. Service will be available at `http://localhost:4000`

## Routing Configuration

The gateway routes requests to appropriate microservices:

- `/api/users/*` → User Service (port 3001)
- `/api/products/*` → Product Service (port 8000)
- `/api/categories/*` → Product Service (port 8000)
- `/api/orders/*` → Order Service (port 8080)
- `/api/payments/*` → Order Service (port 8080)

## Features

- **Request Routing**: Forwards requests to appropriate microservices
- **Authentication**: Verifies Firebase tokens before forwarding
- **Rate Limiting**: Prevents abuse (100 req/15min general, 5 req/15min auth)
- **CORS Handling**: Manages cross-origin requests
- **Request Logging**: Tracks all incoming requests
- **Error Handling**: Centralized error responses

## Development Status

**TODO Implementation Required:**
- Request routing middleware
- Firebase token verification
- Rate limiting configuration
- CORS setup
- Request logging with Morgan
- Error handling middleware

## Features to Implement

- HTTP proxy middleware for service routing
- Firebase Admin SDK integration
- Rate limiting with express-rate-limit
- Request logging and monitoring
- CORS configuration
- Security headers with Helmet
- Health check endpoints
