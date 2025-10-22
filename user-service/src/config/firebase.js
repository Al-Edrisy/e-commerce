// src/config/firebase.js
// Firebase Admin configuration using environment variables
const admin = require('firebase-admin');
const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
    });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
