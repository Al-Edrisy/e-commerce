# User Service - Quick Start ⚡

Get your User Service API running and tested in **5 minutes**!

## 🌐 Live API Documentation

**[View Interactive API Docs](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)** - Browse all endpoints, try requests, copy code snippets!

---

## Step 1: Install Dependencies (30 seconds)

```bash
cd user-service
npm install
```

---

## Step 2: Configure Environment (2 minutes)

1. Copy the template:
```bash
cp env.template .env
```

2. Edit `.env` with your Firebase credentials:

```env
PORT=5000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase REST API
FIREBASE_API_KEY=your-firebase-api-key

# Optional
REDIS_URL=redis://localhost:6379
```

**Where to get Firebase credentials:**
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project
- Go to Project Settings > Service Accounts
- Click "Generate New Private Key"
- Copy the values to your `.env`

---

## Step 3: Start the Service (10 seconds)

```bash
npm start
```

You should see:
```
User Service listening on port 5000
Environment: development
```

---

## Step 4: Test It! (1 minute)

### Test 1: Health Check

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

### Test 2: Register a User

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test 3: Login

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `idToken` from the response - you'll need it for authenticated requests!

---

## Step 5: Use Postman (1 minute)

1. **Import Collection**:
   - Open Postman
   - Click "Import"
   - Select `UserService.postman_collection.json`

2. **Test Login**:
   - Open "Auth" folder
   - Click "Login"
   - Click "Send"
   - JWT token is automatically saved!

3. **Test Profile**:
   - Open "User Auth & Account" folder
   - Click "Get Profile"
   - Click "Send"
   - See your profile data!

---

## 🎉 You're Done!

Your User Service is now running and ready to use!

### Next Steps:

- **📖 Full API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **🌐 Interactive Docs**: [https://documenter.getpostman.com/view/49373776/2sB3dWqRVn](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)
- **📮 Postman Guide**: [POSTMAN_COLLECTION_GUIDE.md](./POSTMAN_COLLECTION_GUIDE.md)
- **🔧 Detailed Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 🆘 Troubleshooting

**Server won't start?**
- Check `.env` file exists
- Verify Firebase credentials are correct
- Ensure port 5000 is available

**Login fails?**
- Make sure you registered the user first
- Check `FIREBASE_API_KEY` in `.env`
- Verify email/password are correct

**Need admin access?**
- Go to Firebase Console > Firestore
- Find your user document (by UID)
- Add field: `role` = `"admin"`

---

**Ready to explore more?** Check out the [Live API Documentation](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)!

