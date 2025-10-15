# User Service

User authentication and profile management service for the E-Commerce platform.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: Firebase Admin SDK
- **Port**: 3001

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Firebase project with Authentication enabled

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=postgres
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
CORS_ORIGIN=http://localhost:3000
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp env.template .env
   # Edit .env with your configuration
   ```

3. Start the service:
   ```bash
   npm run dev
   ```

4. Service will be available at `http://localhost:3001`

## API Endpoints

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update profile (requires auth)
- `GET /health` - Health check

## Development Status

**TODO Implementation Required:**
- User registration and login endpoints
- Firebase token verification middleware
- User profile CRUD operations
- Database connection and models
- Authentication middleware integration

## Features to Implement

- Firebase authentication integration
- User profile management
- JWT token handling
- Password hashing with bcrypt
- Input validation with express-validator
- Database models and repositories
