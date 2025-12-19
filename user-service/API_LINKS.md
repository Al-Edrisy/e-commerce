# User Service API - Quick Links

## 🌐 Live API Documentation

**[Interactive API Documentation](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)**

Browse all endpoints, try requests, and copy code snippets in 20+ languages!

---

## 📥 Import to Postman

**Run in Postman**: 
```
https://documenter.getpostman.com/view/49373776/2sB3dWqRVn
```

Or import the collection file:
```
user-service/UserService.postman_collection.json
```

---

## 🚀 Quick Start

1. **View Documentation**: [https://documenter.getpostman.com/view/49373776/2sB3dWqRVn](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)
2. **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🔑 Key Endpoints

### Authentication
```
POST /api/users/register - Register new user
POST /api/users/login    - Login and get JWT token
```

### User Management
```
GET    /api/users/profile - Get user profile
PUT    /api/users/profile - Update profile
DELETE /api/users/profile - Delete account
```

### Admin (requires role=admin)
```
GET  /api/users/admin/users      - List all users
GET  /api/users/admin/users/:uid - Get user by ID
PUT  /api/users/admin/users/:uid - Update user
```

---

## 🌟 Features

- 47+ API endpoints
- JWT authentication
- Role-based access control (RBAC)
- Session management
- Address management
- GDPR compliance (data export, consent)
- Email verification & password reset
- Admin operations

---

## 🎯 Base URL

**Local Development**: `http://localhost:5000`

---

## 🔐 Authentication

All protected endpoints require JWT Bearer token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get token by logging in:
```bash
POST /api/users/login
Body: { "email": "user@example.com", "password": "password" }
```

---

**Share this link**: [https://documenter.getpostman.com/view/49373776/2sB3dWqRVn](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)

