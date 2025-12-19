# Postman Collection Guide - User Service API

This guide explains how to use the Postman collection for testing the User Service API.

## 🌐 Live API Documentation

**[View Published Documentation](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)** - Interactive, web-based API documentation with all endpoints!

---

## 📥 Importing the Collection

### Method 1: Import File

1. Open Postman
2. Click **"Import"** button (top left)
3. Select **"File"** tab
4. Choose `UserService.postman_collection.json`
5. Click **"Import"**

### Method 2: Import from URL

1. Open Postman
2. Click **"Import"**
3. Select **"Link"** tab
4. Paste: `https://documenter.getpostman.com/view/49373776/2sB3dWqRVn`
5. Click **"Continue"** and **"Import"**

---

## 🔧 Collection Setup

### Collection Variables

The collection uses two variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:5000` | API base URL |
| `jwt_token` | (empty) | JWT token (auto-saved on login) |

### Update Base URL (if needed)

1. Click on the collection name
2. Go to **"Variables"** tab
3. Update `base_url` if your service runs on a different port
4. Click **"Save"**

---

## 🚀 Quick Start Workflow

### Step 1: Register a User

1. Open **"Auth"** folder
2. Click **"User Register (Simple)"**
3. Review the request body:
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```
4. Update email if desired
5. Click **"Send"**
6. Save the `uid` from the response

### Step 2: Login

1. Click **"Login"** request
2. Update email/password to match registration
3. Click **"Send"**
4. **JWT token is automatically saved!** ✨
5. Check the "Tests" tab to see the auto-save script

### Step 3: Test Authenticated Endpoints

Now you can test any authenticated endpoint:

1. Open **"User Auth & Account"** folder
2. Click **"Get Profile"**
3. Click **"Send"**
4. See your profile data!

The `{{jwt_token}}` variable is automatically used in all authenticated requests.

---

## 📂 Collection Structure

### 1. Auth

**Purpose:** User registration and authentication

| Request | Method | Description |
|---------|--------|-------------|
| User Register (Simple) | POST | Register with email/password only |
| User Register (Rich) | POST | Register with full profile info |
| Login | POST | Login and get JWT token (auto-saved) |
| Logout | POST | Logout current user |

**Workflow:**
1. Register → 2. Login → Token saved automatically

### 2. User Auth & Account

**Purpose:** User profile and account management

| Request | Method | Auth Required | Description |
|---------|--------|---------------|-------------|
| Get Profile | GET | ✅ | Get current user's profile |
| Get Me | GET | ✅ | Get current user info |
| Update Profile | PUT | ✅ | Update profile fields |
| Delete Profile | DELETE | ✅ | Soft delete account |
| Restore Profile | POST | ✅ | Restore soft-deleted account |
| Deactivate Account | POST | ✅ | Set status to inactive |
| Reactivate Account | POST | ✅ | Set status to active |

**Example: Update Profile**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+1987654321",
  "timezone": "America/Los_Angeles",
  "language": "es"
}
```

### 3. Sessions

**Purpose:** Multi-device session management

| Request | Method | Auth Required | Description |
|---------|--------|---------------|-------------|
| Create Session | POST | ✅ | Create new session |
| Get Active Sessions | GET | ✅ | List all active sessions |
| Get Session by Token | GET | ❌ | Get specific session |
| Invalidate Session | DELETE | ✅ | End specific session |
| Invalidate All Sessions | DELETE | ✅ | End all sessions |

**Example: Create Session**
```json
{
  "device_type": "desktop",
  "browser": "Chrome",
  "os": "Windows 11",
  "location_country": "USA",
  "location_city": "New York"
}
```

### 4. Email & Password

**Purpose:** Email verification and password management

| Request | Method | Auth Required | Description |
|---------|--------|---------------|-------------|
| Send Email Verification | POST | ✅ | Generate verification token |
| Verify Email | POST | ✅ | Verify email with token |
| Resend Email Verification | POST | ✅ | Resend verification token |
| Forgot Password | POST | ❌ | Request password reset |
| Reset Password | POST | ❌ | Reset password with token |
| Change Password | PUT | ✅ | Change password (requires current) |
| Change Email | PUT | ✅ | Change email (requires password) |

**Workflow: Email Verification**
1. Send Email Verification → Get token from response (dev mode)
2. Verify Email → Use token from step 1

**Workflow: Password Reset**
1. Forgot Password → Get token from response (dev mode)
2. Reset Password → Use token from step 1

### 5. Addresses

**Purpose:** User address management

| Request | Method | Auth Required | Description |
|---------|--------|---------------|-------------|
| List Addresses | GET | ✅ | Get all addresses (paginated) |
| Add Address | POST | ✅ | Create new address |
| Get Address by ID | GET | ✅ | Get specific address |
| Update Address | PUT | ✅ | Update address |
| Delete Address | DELETE | ✅ | Remove address |
| Set Default Address | PUT | ✅ | Mark address as default |

**Example: Add Address**
```json
{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "address_type": "home"
}
```

### 6. GDPR & Consents

**Purpose:** GDPR compliance and consent management

| Request | Method | Auth Required | Description |
|---------|--------|---------------|-------------|
| Data Export | GET | ✅ | Export all user data |
| Hard Delete | DELETE | ✅ | Permanently delete all data |
| Accept GDPR Consent | POST | ✅ | Record GDPR consent |
| Accept Terms of Service | POST | ✅ | Record TOS acceptance |
| Accept Privacy Policy | POST | ✅ | Record privacy policy acceptance |

### 7. Account Lifecycle

**Purpose:** Role-based access control

| Request | Method | Auth Required | Description |
|---------|--------|---------------|-------------|
| Get User Role | GET | ✅ | Get current user's role |
| Set User Role (Admin) | POST | ✅ (Admin) | Set any user's role |

### 8. Internal

**Purpose:** Service-to-service endpoints

| Request | Method | Auth Required | Description |
|---------|--------|---------------|-------------|
| Check User Exists | GET | ❌ | Check if user exists by UID |

### 9. Admin

**Purpose:** Admin-only user management

**⚠️ Requires `role: "admin"` in Firestore**

| Request | Method | Description |
|---------|--------|-------------|
| List All Users | GET | Get all users (paginated) |
| Get User by ID | GET | Get any user's profile |
| Update User by ID | PUT | Update any user's profile |
| Delete User by ID | DELETE | Soft delete any user |
| Restore User by ID | POST | Restore any soft-deleted user |
| Change User Status | PUT | Change any user's status |
| User Stats | GET | Get user statistics |
| List All Sessions (Admin) | GET | Get all sessions across all users |

**How to test admin endpoints:**
1. Register a user
2. Login to get JWT token
3. Go to Firebase Console > Firestore
4. Find your user document (by UID)
5. Add field: `role` = `"admin"`
6. Try admin endpoints with your JWT token

---

## 🔐 Authentication

### How JWT Tokens Work

1. **Login** → Returns `idToken`
2. **Auto-Save** → Test script saves token to `{{jwt_token}}`
3. **Auto-Use** → All authenticated requests use `Bearer {{jwt_token}}`

### Manual Token Management

If auto-save doesn't work:

1. Login and copy the `idToken` from response
2. Click collection name → "Variables" tab
3. Set `jwt_token` to your token
4. Click "Save"

### Token Expiration

Firebase tokens expire after 1 hour. If you get 401 errors:
1. Login again
2. Token is automatically refreshed

---

## 🧪 Testing Workflows

### Workflow 1: Complete User Journey

1. **Register** → User Register (Simple)
2. **Login** → Login (token auto-saved)
3. **Get Profile** → Get Profile
4. **Update Profile** → Update Profile
5. **Create Session** → Create Session
6. **Add Address** → Add Address
7. **Verify Email** → Send Email Verification → Verify Email
8. **Export Data** → Data Export

### Workflow 2: Admin Operations

1. **Login as Admin** → Login (ensure user has admin role)
2. **List Users** → List All Users
3. **Get User** → Get User by ID
4. **Update User** → Update User by ID
5. **View Stats** → User Stats

### Workflow 3: Password Reset

1. **Forgot Password** → Get reset token
2. **Reset Password** → Use token to set new password
3. **Login** → Login with new password

---

## 🎯 Tips & Tricks

### 1. Environment Variables

Create different environments for dev/staging/prod:

1. Click "Environments" (top right)
2. Create "Development", "Staging", "Production"
3. Set different `base_url` for each
4. Switch environments easily

### 2. Pre-request Scripts

The Login request has a test script that auto-saves the token:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.idToken) {
        pm.collectionVariables.set("jwt_token", jsonData.idToken);
        console.log("JWT token saved:", jsonData.idToken);
    }
}
```

### 3. Bulk Testing

Use Postman's Collection Runner:

1. Click collection → "Run"
2. Select requests to run
3. Click "Run User Service API"
4. See all results at once

### 4. Code Generation

Generate code in any language:

1. Click any request
2. Click "Code" (</> icon, top right)
3. Select language (cURL, JavaScript, Python, etc.)
4. Copy and use in your app!

---

## 🆘 Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Missing or invalid JWT token

**Solution:**
1. Run Login request first
2. Check `{{jwt_token}}` variable is set
3. Check token hasn't expired (1 hour)

### Issue: 403 Forbidden (Admin Endpoints)

**Cause:** User doesn't have admin role

**Solution:**
1. Go to Firebase Console > Firestore
2. Find your user document
3. Add `role: "admin"` field
4. Login again to refresh token

### Issue: 404 Not Found

**Cause:** Wrong base URL or endpoint

**Solution:**
1. Check service is running (`http://localhost:5000/health`)
2. Verify `base_url` variable is correct
3. Check endpoint path in request

### Issue: Timeout

**Cause:** Service not running or Firestore slow

**Solution:**
1. Check service is running
2. Check internet connection
3. Service handles Firestore timeouts gracefully

### Issue: Token Not Auto-Saving

**Cause:** Test script not running

**Solution:**
1. Click Login request → "Tests" tab
2. Verify script is present
3. Manually copy token and set `{{jwt_token}}` variable

---

## 📖 Additional Resources

- **Live API Docs**: https://documenter.getpostman.com/view/49373776/2sB3dWqRVn
- **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (if exists)

---

**Happy Testing! 🚀**

