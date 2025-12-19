# User Service - Complete Setup Guide

This guide provides detailed instructions for setting up and running the User Service.

## 🌐 Live API Documentation

**[View Interactive API Docs](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Firebase Configuration](#firebase-configuration)
4. [Environment Variables](#environment-variables)
5. [Running the Service](#running-the-service)
6. [Testing](#testing)
7. [Creating an Admin Account](#creating-an-admin-account)
8. [Firestore Security Rules](#firestore-security-rules)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 16+ and npm
- **Firebase Project** with:
  - Authentication enabled
  - Firestore database created
  - Service account credentials
- **Redis** (optional, for caching)
- **Postman** (optional, for testing)

---

## Installation

### 1. Clone and Navigate

```bash
cd user-service
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- express, firebase-admin, dotenv
- axios (for Firebase REST API)
- cors, express-rate-limit, express-validator
- redis, uuid, winston

---

## Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select existing project
3. Follow the setup wizard

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Choose **Start in test mode** (we'll update rules later)
4. Select a region close to your users

### Step 4: Get Service Account Credentials

1. Go to **Project Settings** (gear icon)
2. Click **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file securely

The JSON file contains:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  ...
}
```

### Step 5: Get Firebase API Key

1. In **Project Settings**, go to **General** tab
2. Scroll to "Your apps" section
3. If no web app exists, click "Add app" and select Web
4. Copy the **API Key** (looks like: `AIzaSy...`)

---

## Environment Variables

### 1. Create .env File

```bash
cp env.template .env
```

### 2. Fill in Firebase Credentials

Edit `.env` with your Firebase credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase REST API (from project settings)
FIREBASE_API_KEY=AIzaSy...your-api-key

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379

# Optional: Rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Important Notes

**Private Key Formatting:**
- Keep the `\n` characters in the private key
- Wrap the entire key in double quotes
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

**API Key:**
- This is different from the private key
- Used for Firebase REST API authentication
- Found in Project Settings > General > Web API Key

---

## Running the Service

### Development Mode

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

### Production Mode

```bash
NODE_ENV=production npm start
```

### Verify It's Running

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "service": "user-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 5.123
}
```

---

## Testing

### Method 1: Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `idToken` from the response!

**Get Profile (authenticated):**
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE"
```

### Method 2: Using Postman

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select `UserService.postman_collection.json`

2. **Test Login:**
   - Open "Auth" folder
   - Click "Login" request
   - Update email/password if needed
   - Click "Send"
   - JWT token is automatically saved to `{{jwt_token}}`

3. **Test Authenticated Endpoints:**
   - All other requests use the saved token automatically
   - Try "Get Profile", "Update Profile", etc.

### Method 3: Using Live Documentation

Visit: **https://documenter.getpostman.com/view/49373776/2sB3dWqRVn**

- Browse all endpoints
- Try requests directly from browser
- Copy code snippets in 20+ languages

---

## Creating an Admin Account

Admin endpoints require `role: "admin"` in the user's Firestore document.

### Method 1: Manual (Firebase Console)

1. **Register a user** via API or Firebase Console
2. **Get the user's UID** (from registration response or Firebase Console)
3. **Update Firestore:**
   - Go to Firebase Console > Firestore Database
   - Navigate to `users` collection
   - Find the document with the user's UID
   - Add/Edit field: `role` = `"admin"`
   - Save

### Method 2: Using API (requires existing admin)

```bash
curl -X POST http://localhost:5000/api/users/set-role \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "user-uid-to-make-admin",
    "role": "admin"
  }'
```

### Verify Admin Access

```bash
curl http://localhost:5000/api/users/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

Should return list of all users (not 403).

---

## Firestore Security Rules

### Development Rules (Permissive)

For development, use permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Production Rules (Recommended)

See `firestore-rules.txt` for production-ready rules.

**To apply rules:**
1. Go to Firebase Console > Firestore Database
2. Click "Rules" tab
3. Paste the rules
4. Click "Publish"

**Important:** The Admin SDK (used by this service) bypasses Firestore security rules. Rules only affect client SDK access.

---

## Troubleshooting

### Server Won't Start

**Error: `Firebase credentials not provided`**
- Check `.env` file exists
- Verify `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` are set
- Ensure private key includes `\n` characters and is wrapped in quotes

**Error: `Port 5000 already in use`**
- Change `PORT` in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000

**Error: `Cannot find module 'axios'`**
- Run `npm install` to install all dependencies

### Login Issues

**401 Unauthorized**
- Verify `FIREBASE_API_KEY` is set in `.env`
- Check email/password are correct
- Ensure user is registered first

**504 Gateway Timeout**
- Check internet connection
- Firebase REST API may be slow - retry
- Check Firebase Console for service status

### Firestore Issues

**Operations timeout**
- Check internet connection
- Verify Firestore security rules allow access
- The service handles timeouts gracefully (returns partial data)

**Permission Denied**
- Check Firestore security rules
- For development, use permissive rules (see above)
- Admin SDK bypasses rules, so this shouldn't affect the service

### Admin Access Issues

**403 Forbidden on admin endpoints**
- User must have `role: "admin"` in Firestore
- Check the user document in Firebase Console
- Verify the field name is exactly `role` (lowercase)
- Verify the value is exactly `"admin"` (lowercase, string)

### Redis Issues

**Redis connection errors**
- Redis is optional - service works without it
- If you see Redis errors but service still works, that's normal
- To use Redis: Install and run Redis server locally
- To disable Redis warnings: Remove `REDIS_URL` from `.env`

---

## Next Steps

- **📖 API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (if exists)
- **🌐 Live Docs**: https://documenter.getpostman.com/view/49373776/2sB3dWqRVn
- **📮 Postman Guide**: [POSTMAN_COLLECTION_GUIDE.md](./POSTMAN_COLLECTION_GUIDE.md) (if exists)
- **🚀 Quick Start**: [QUICK_START.md](./QUICK_START.md)

---

## Support

For issues or questions:
- Check the [Live API Documentation](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)
- Review [QUICK_START.md](./QUICK_START.md)
- Check Firebase Console for service status

**Happy coding! 🚀**

