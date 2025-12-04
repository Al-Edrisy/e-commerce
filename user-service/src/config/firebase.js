// src/config/firebase.js
// Firebase Admin configuration using environment variables
const admin = require('firebase-admin');
const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

let db = null;
let auth = null;

try {
    if (!admin.apps.length) {
        // Check if Firebase credentials are provided
        if (FIREBASE_PROJECT_ID && FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: FIREBASE_PROJECT_ID,
                    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    clientEmail: FIREBASE_CLIENT_EMAIL,
                }),
            });

            db = admin.firestore();
            auth = admin.auth();
            console.log('Firebase Admin SDK initialized successfully');
        } else {
            console.warn('Firebase credentials not provided. Running in limited mode.');
            console.warn('Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL to enable Firebase features.');
        }
    } else {
        db = admin.firestore();
        auth = admin.auth();
    }
} catch (error) {
    console.error('Error initializing Firebase:', error.message);
    console.warn('Service will continue without Firebase functionality');
}

module.exports = { db, auth };

