# User Service API 🚀

A production-ready Node.js microservice for comprehensive user management in e-commerce platforms.

---

## 🌐 Live API Documentation

**[View Interactive API Documentation](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)** ⭐

Browse all 47+ endpoints, try requests in your browser, and copy code snippets in 20+ languages!

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[🌐 Live API Docs (Postman)](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)** | 🔥 **Interactive documentation** - Try API in your browser! |
| **[🚀 Quick Start](./QUICK_START.md)** | Get running in 5 minutes |
| **[📖 Setup Guide](./SETUP_GUIDE.md)** | Complete installation and configuration |
| **[📮 Postman Collection Guide](./POSTMAN_COLLECTION_GUIDE.md)** | How to use the Postman collection for testing |
| **[📋 Documentation Index](./DOCUMENTATION_INDEX.md)** | Navigate all documentation |
| **[🔗 API Links](./API_LINKS.md)** | Quick reference card |

**Quick Links**:
- [🌐 **Live API Documentation**](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn) → Interactive, web-based docs
- [Authentication Guide](#authentication) → How to get and use JWT tokens
- [API Endpoints](#api-overview) → List of all available endpoints
- [Troubleshooting](#troubleshooting) → Common issues and solutions

---

## ✨ Features

### Core Functionality
- ✅ **User Registration & Authentication** (Firebase Auth + JWT)
- ✅ **Profile Management** (Firestore with Redis caching)
- ✅ **Session Management** (Multi-device support)
- ✅ **Address Management** (Multiple addresses per user)
- ✅ **Email Verification** (Token-based)
- ✅ **Password Reset** (Secure token flow)
- ✅ **Role-Based Access Control (RBAC)** (Admin, Customer roles)
- ✅ **GDPR Compliance** (Data export, right to be forgotten)
- ✅ **Admin Operations** (User management, statistics)
- ✅ **Audit Logging** (Login attempts, account changes)

### Technical Features
- ✅ **Firebase Integration** (Auth + Firestore)
- ✅ **Redis Caching** (Optional, for performance)
- ✅ **Rate Limiting** (Prevent abuse)
- ✅ **CORS Support** (Configurable origins)
- ✅ **Input Validation** (express-validator)
- ✅ **Error Handling** (Standardized responses)
- ✅ **Graceful Timeouts** (Firestore operations)
- ✅ **Docker Support** (Docker Compose included)

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd user-service
npm install
```

### 2. Configure Environment

```bash
cp env.template .env
```

Edit `.env` with your Firebase credentials:

```env
PORT=5000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase REST API
FIREBASE_API_KEY=your-firebase-api-key

# Optional
REDIS_URL=redis://localhost:6379
```

### 3. Start the Service

```bash
npm start
```

### 4. Test It!

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**👉 For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 📖 API Overview

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/register` | POST | Register new user |
| `/api/users/login` | POST | Login and get JWT token |
| `/api/users/logout` | POST | Logout current user |

### User Profile

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/profile` | GET | ✅ | Get current user's profile |
| `/api/users/profile` | PUT | ✅ | Update profile |
| `/api/users/profile` | DELETE | ✅ | Soft delete account |
| `/api/users/me` | GET | ✅ | Get current user info |

### Sessions

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/sessions` | POST | ✅ | Create new session |
| `/api/users/sessions` | GET | ✅ | List active sessions |
| `/api/users/sessions/:token` | DELETE | ✅ | Invalidate session |

### Addresses

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/addresses` | GET | ✅ | List all addresses |
| `/api/users/addresses` | POST | ✅ | Add new address |
| `/api/users/addresses/:id` | PUT | ✅ | Update address |
| `/api/users/addresses/:id` | DELETE | ✅ | Delete address |

### Email & Password

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/send-verification` | POST | ✅ | Send email verification |
| `/api/users/verify-email` | POST | ✅ | Verify email with token |
| `/api/users/forgot-password` | POST | ❌ | Request password reset |
| `/api/users/reset-password` | POST | ❌ | Reset password with token |
| `/api/users/change-password` | PUT | ✅ | Change password |
| `/api/users/change-email` | PUT | ✅ | Change email |

### GDPR & Compliance

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/me/export` | GET | ✅ | Export all user data |
| `/api/users/me/hard-delete` | DELETE | ✅ | Permanently delete data |
| `/api/users/consent/gdpr` | POST | ✅ | Accept GDPR consent |
| `/api/users/consent/tos` | POST | ✅ | Accept Terms of Service |

### Admin (requires `role: "admin"`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/admin/users` | GET | List all users |
| `/api/users/admin/users/:uid` | GET | Get user by ID |
| `/api/users/admin/users/:uid` | PUT | Update user |
| `/api/users/admin/users/:uid` | DELETE | Delete user |
| `/api/users/admin/users/stats` | GET | Get user statistics |

**👉 For complete API reference, see [Live API Documentation](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)**

---

## 🔐 Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting a Token

1. **Register a user:**
```bash
POST /api/users/register
Body: { "email": "user@example.com", "password": "password123" }
```

2. **Login to get token:**
```bash
POST /api/users/login
Body: { "email": "user@example.com", "password": "password123" }
Response: { "idToken": "eyJhbGc...", ... }
```

3. **Use token in requests:**
```bash
GET /api/users/profile
Headers: { "Authorization": "Bearer eyJhbGc..." }
```

### Using Postman

1. Import `UserService.postman_collection.json`
2. Run "Login" request
3. JWT token is **automatically saved** to `{{jwt_token}}`
4. All other requests use the token automatically!

---

## 🧪 Testing

### Using Postman

**Import the collection:**
```bash
# File: UserService.postman_collection.json
```

**Or view online:**
- [Live API Docs](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)

### Using cURL

See [QUICK_START.md](./QUICK_START.md) for cURL examples.

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

---

## 🐳 Docker Support

### Using Docker Compose

```bash
# Start service + Redis
docker-compose up --build

# Stop services
docker-compose down
```

### Manual Docker

```bash
# Build image
docker build -t user-service .

# Run container
docker run -p 5000:5000 --env-file .env user-service
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase Admin SDK private key |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase service account email |
| `FIREBASE_API_KEY` | Yes | Firebase REST API key |
| `REDIS_URL` | No | Redis connection URL (optional) |
| `CORS_ORIGINS` | No | Allowed CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW` | No | Rate limit window in ms (default: 900000) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window (default: 100) |

**👉 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed configuration**

---

## 🆘 Troubleshooting

### Server won't start
- Check `.env` file exists and has valid Firebase credentials
- Verify port 5000 is not already in use
- Run `npm install` to ensure dependencies are installed

### Login returns 401
- Verify `FIREBASE_API_KEY` is set in `.env`
- Check email/password are correct
- Ensure user is registered first

### Admin endpoints return 403
- User must have `role: "admin"` in Firestore
- Go to Firebase Console > Firestore
- Find user document (by UID)
- Add field: `role` = `"admin"`

### Firestore operations timeout
- Check internet connection
- Verify Firestore security rules allow access
- See `firestore-rules.txt` for recommended rules
- Service handles timeouts gracefully (returns partial data)

**👉 For more troubleshooting, see [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)**

---

## 📦 Project Structure

```
user-service/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, validation
│   ├── config/           # Configuration
│   └── utils/            # Utilities
├── docs/                 # Documentation
├── .env                  # Environment variables
├── package.json          # Dependencies
├── Dockerfile            # Docker configuration
└── docker-compose.yml    # Docker Compose setup
```

---

## 🚀 Deployment

### Prerequisites
- Node.js 16+
- Firebase project with Auth & Firestore
- Redis (optional, for caching)

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure strong secrets
- [ ] Set up Firestore security rules
- [ ] Enable Firebase Auth
- [ ] Configure CORS origins
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting
- [ ] Set up Redis for caching

**👉 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for deployment guide**

---

## 📊 API Statistics

- **Total Endpoints**: 47+
- **Authentication**: JWT Bearer tokens
- **Rate Limiting**: Configurable per endpoint
- **Response Time**: < 200ms (cached), < 2s (uncached)
- **Uptime**: 99.9% target

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support & Resources

- **📖 Documentation**: [START_HERE.md](./START_HERE.md)
- **🌐 Live API Docs**: [https://documenter.getpostman.com/view/49373776/2sB3dWqRVn](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)
- **🚀 Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **📮 Postman Collection**: `UserService.postman_collection.json`
- **🔧 Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

**Version:** 1.0.0  
**Author:** E-Commerce Platform Team  
**Last Updated:** December 2024

**🎉 Ready to build amazing user experiences! 🚀**
