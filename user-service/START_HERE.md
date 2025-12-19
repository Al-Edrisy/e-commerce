# 🚀 User Service - START HERE

Welcome to the User Service API! This is your starting point for all documentation.

---

## 🌐 Live API Documentation

**[View Interactive API Documentation](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)** ⭐ **TRY IT NOW!**

Browse all endpoints, try requests, and copy code snippets in 20+ languages!

---

## ⚡ Quick Navigation

### First Time Here?
👉 **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes

### Need Detailed Setup?
👉 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete installation guide

### Want to Test the API?
👉 **[POSTMAN_COLLECTION_GUIDE.md](./POSTMAN_COLLECTION_GUIDE.md)** - Testing guide

### Want to Publish API Documentation in Postman?
👉 **[POSTMAN_PUBLISH_STEPS.md](./POSTMAN_PUBLISH_STEPS.md)** - Publish in 2 minutes

### Looking for API Reference?
👉 **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - All endpoints

### Not Sure What to Read?
👉 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Navigate all docs

---

## 📋 What's in This Service?

The User Service provides:

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

---

## 🎯 Recommended Learning Path

### For Developers (First Time Setup)

1. **Read**: [QUICK_START.md](./QUICK_START.md) (5 minutes)
2. **Setup**: Follow the quick start steps
3. **Test**: Use Postman collection to test endpoints
4. **Deep Dive**: Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### For API Users (Integration)

1. **Browse**: [Live API Documentation](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)
2. **Import**: Postman collection from `UserService.postman_collection.json`
3. **Test**: Try authentication and profile endpoints
4. **Integrate**: Use code snippets from Postman docs

### For Admins (Deployment)

1. **Read**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Configure**: Firebase credentials and environment variables
3. **Deploy**: Follow deployment instructions
4. **Monitor**: Check health endpoint and logs

---

## 🔥 Quick Start (30 seconds)

```bash
# 1. Install dependencies
cd user-service
npm install

# 2. Configure environment
cp env.template .env
# Edit .env with your Firebase credentials

# 3. Start the service
npm start

# 4. Test health endpoint
curl http://localhost:5000/health
```

---

## 📚 All Documentation Files

| File | Purpose | When to Read |
|------|---------|--------------|
| **[START_HERE.md](./START_HERE.md)** | You are here! | First visit |
| **[QUICK_START.md](./QUICK_START.md)** | 5-minute setup | Getting started |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Detailed setup | Full installation |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Complete API reference | Development |
| **[POSTMAN_COLLECTION_GUIDE.md](./POSTMAN_COLLECTION_GUIDE.md)** | Testing with Postman | API testing |
| **[POSTMAN_PUBLISH_STEPS.md](./POSTMAN_PUBLISH_STEPS.md)** | Publish API docs | Documentation |
| **[POSTMAN_DOCUMENTATION_GUIDE.md](./POSTMAN_DOCUMENTATION_GUIDE.md)** | Advanced Postman docs | Advanced |
| **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** | Navigate all docs | Reference |
| **[DOCUMENTATION_SUMMARY.md](./DOCUMENTATION_SUMMARY.md)** | Overview of docs | Planning |
| **[API_LINKS.md](./API_LINKS.md)** | Quick reference | Sharing |

---

## 🆘 Need Help?

### Common Issues

**Q: Server won't start?**
- Check `.env` file exists and has valid Firebase credentials
- Run `npm install` to ensure dependencies are installed
- Check port 5000 is not already in use

**Q: Login returns 401?**
- Verify email and password are correct
- Check `FIREBASE_API_KEY` in `.env`
- Ensure user is registered first

**Q: Admin endpoints return 403?**
- User must have `role: "admin"` in Firestore
- Update role manually in Firebase Console
- See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for details

**Q: Firestore operations timeout?**
- Check internet connection
- Verify Firestore security rules allow access
- See `firestore-rules.txt` for recommended rules

### More Help

- 📖 **Full Troubleshooting**: [API_DOCUMENTATION.md - Troubleshooting](./API_DOCUMENTATION.md#troubleshooting)
- 🌐 **Live Docs**: [https://documenter.getpostman.com/view/49373776/2sB3dWqRVn](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)
- 📮 **Postman Collection**: Import `UserService.postman_collection.json`

---

## 🎉 Ready to Go!

Choose your path:

- **Quick Test**: [QUICK_START.md](./QUICK_START.md)
- **Full Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Interactive Docs**: [https://documenter.getpostman.com/view/49373776/2sB3dWqRVn](https://documenter.getpostman.com/view/49373776/2sB3dWqRVn)

**Let's build something amazing! 🚀**

