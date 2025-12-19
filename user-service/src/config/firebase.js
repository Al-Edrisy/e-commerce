// src/config/firebase.js
const admin = require('firebase-admin');
const {
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL
} = process.env;
let db = null;
let auth = null;
if (!admin.apps || !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: FIREBASE_CLIENT_EMAIL
    })
  });
}
db = admin.firestore();
auth = admin.auth();
module.exports = { db, auth };
