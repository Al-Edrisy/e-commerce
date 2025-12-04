import admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Flag to track if Firebase is initialized
let isFirebaseInitialized = false;

// Validate and initialize Firebase Admin SDK
if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    isFirebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📧 Project ID: ${serviceAccount.projectId}`);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error instanceof Error ? error.message : error);
    console.error('⚠️  Authentication features will be disabled');
  }
} else {
  console.warn('⚠️  Firebase credentials not fully configured');
  console.warn('Missing credentials:', {
    projectId: !serviceAccount.projectId,
    privateKey: !serviceAccount.privateKey,
    clientEmail: !serviceAccount.clientEmail,
  });
  console.warn('⚠️  Authentication features will be disabled');
}

/**
 * Check if Firebase is properly initialized
 */
export const isFirebaseReady = (): boolean => {
  return isFirebaseInitialized;
};

export default admin;

