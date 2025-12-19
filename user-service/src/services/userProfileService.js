// UserProfileService.js - Firestore + Redis caching
const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const redis = require('redis');
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(() => { });

const USERS_COLLECTION = 'users';

/** Create a new user profile in Firestore */
async function createUserProfile(firebase_uid, profileData) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    const userData = {
      email: profileData.email || '',
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      phone_number: profileData.phone_number || '',
      status: profileData.status || 'active',
      last_login_at: admin.firestore.FieldValue.serverTimestamp(),
      login_count: 1,
      email_verified: profileData.email_verified || false,
      profile_completed: profileData.profile_completed || false,
      timezone: profileData.timezone || 'UTC',
      language: profileData.language || 'en',
      source: profileData.source || 'web',
      ip_address: profileData.ip_address || '',
      user_agent: profileData.user_agent || '',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      deleted_at: null,
      role: profileData.role || 'customer'
    };
    await userRef.set(userData);
    const createdDoc = await userRef.get();
    return { uid: firebase_uid, ...createdDoc.data() };
  } catch (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
}

/** Cached get user profile */
async function getUserProfile(firebase_uid) {
  try {
    const cached = await redisClient.get(`user-profile:${firebase_uid}`);
    if (cached) return JSON.parse(cached);
  } catch (_) { }
  
  try {
    // Add 15-second timeout for Firestore operations
    const firestoreOperation = async () => {
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) return null;
      const userData = userDoc.data();
      if (userData.deleted_at) return null;
      const result = { uid: firebase_uid, ...userData };
      try { await redisClient.setEx(`user-profile:${firebase_uid}`, 600, JSON.stringify(result)); } catch (_) { }
      return result;
    };
    
    return await Promise.race([
      firestoreOperation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore profile lookup timed out')), 15000)
      )
    ]);
  } catch (error) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
}

/** Update user profile and invalidate cache */
async function updateUserProfile(firebase_uid, updates) {
  try {
    // Add 15-second timeout for Firestore operations
    const firestoreOperation = async () => {
      const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
      const allowedFields = [
        'first_name', 'last_name', 'phone_number', 'status', 'email_verified', 'profile_completed', 
        'timezone', 'language', 'role', 'email', 'gdpr_consent', 'gdpr_consent_version', 
        'gdpr_consent_date', 'tos_accepted', 'tos_version', 'tos_accepted_date',
        'privacy_policy_accepted', 'privacy_policy_version', 'privacy_policy_accepted_date'
      ];
      const updateData = {};
      for (const field of allowedFields) if (updates[field] !== undefined) updateData[field] = updates[field];
      updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();
      await userRef.update(updateData);
      try { await redisClient.del(`user-profile:${firebase_uid}`); } catch (_) { }
      const updatedDoc = await userRef.get();
      return { uid: firebase_uid, ...updatedDoc.data() };
    };
    
    return await Promise.race([
      firestoreOperation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore update timed out')), 15000)
      )
    ]);
  } catch (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}

/** Soft delete user profile */
async function deleteUserProfile(firebase_uid) {
  try {
    // Add 15-second timeout for Firestore operations
    const firestoreOperation = async () => {
      const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
      const deleteData = {
        deleted_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        status: 'deleted'
      };
      await userRef.update(deleteData);
      try { await redisClient.del(`user-profile:${firebase_uid}`); } catch (_) { }
      const deletedDoc = await userRef.get();
      return { uid: firebase_uid, ...deletedDoc.data() };
    };
    
    return await Promise.race([
      firestoreOperation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore delete timed out')), 15000)
      )
    ]);
  } catch (error) {
    throw new Error(`Failed to delete user profile: ${error.message}`);
  }
}

/** User role helpers */
async function setUserRole(firebase_uid, role) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    await userRef.update({ role, updated_at: admin.firestore.FieldValue.serverTimestamp() });
    return true;
  } catch (error) {
    throw new Error(`Failed to set user role: ${error.message}`);
  }
}
async function getUserRole(firebase_uid) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    const userDoc = await userRef.get();
    return userDoc.exists && userDoc.data().role ? userDoc.data().role : 'customer';
  } catch (error) {
    throw new Error(`Failed to get user role: ${error.message}`);
  }
}

/** Email verification helpers */
async function setEmailVerificationToken(firebase_uid, token, expiresAt) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    await userRef.update({
      email_verification_token: token,
      email_verification_token_expires: admin.firestore.Timestamp.fromDate(expiresAt),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to set email verification token: ${error.message}`);
  }
}
async function verifyEmailToken(firebase_uid, token) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error('User not found');
    const data = userDoc.data();
    if (!data.email_verification_token || !data.email_verification_token_expires) return false;
    if (data.email_verified) return false;
    if (
      data.email_verification_token !== token ||
      (data.email_verification_token_expires && data.email_verification_token_expires.toDate() < new Date())
    ) return false;
    await userRef.update({
      email_verified: true,
      email_verification_token: admin.firestore.FieldValue.delete(),
      email_verification_token_expires: admin.firestore.FieldValue.delete(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to verify email token: ${error.message}`);
  }
}

/** Password reset helpers */
async function setPasswordResetToken(firebase_uid, token, expiresAt) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    await userRef.update({
      password_reset_token: token,
      password_reset_token_expires: admin.firestore.Timestamp.fromDate(expiresAt),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to set password reset token: ${error.message}`);
  }
}
async function verifyPasswordResetToken(firebase_uid, token) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error('User not found');
    const data = userDoc.data();
    if (!data.password_reset_token || !data.password_reset_token_expires) return false;
    if (
      data.password_reset_token !== token ||
      (data.password_reset_token_expires && data.password_reset_token_expires.toDate() < new Date())
    ) {
      return false;
    }
    return true;
  } catch (error) {
    throw new Error(`Failed to verify password reset token: ${error.message}`);
  }
}
async function clearPasswordResetToken(firebase_uid) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    await userRef.update({
      password_reset_token: admin.firestore.FieldValue.delete(),
      password_reset_token_expires: admin.firestore.FieldValue.delete(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    throw new Error(`Failed to clear password reset token: ${error.message}`);
  }
}

/** Get paginated addresses (simple MVP, Firestore needs cursor for full prod) */
async function getAddresses(firebase_uid, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  const ref = db.collection(USERS_COLLECTION).doc(firebase_uid).collection('addresses').orderBy('created_at', 'desc').limit(limit);
  const snapshot = await ref.get();
  const docs = snapshot.docs.slice(offset, offset + limit).map(doc => ({ id: doc.id, ...doc.data() }));
  return docs;
}
/** Address CRUD short helpers */
async function addAddress(firebase_uid, address) {
  const collectionRef = db.collection(USERS_COLLECTION).doc(firebase_uid).collection('addresses');
  const docRef = await collectionRef.add({ ...address, created_at: admin.firestore.FieldValue.serverTimestamp(), is_default: false });
  return { id: docRef.id, ...address, is_default: false };
}
async function getAddressById(firebase_uid, addressId) {
  const doc = await db.collection(USERS_COLLECTION).doc(firebase_uid).collection('addresses').doc(addressId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}
async function updateAddress(firebase_uid, addressId, updates) {
  const addressRef = db.collection(USERS_COLLECTION).doc(firebase_uid).collection('addresses').doc(addressId);
  await addressRef.update({ ...updates, updated_at: admin.firestore.FieldValue.serverTimestamp() });
  const doc = await addressRef.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}
async function deleteAddress(firebase_uid, addressId) {
  await db.collection(USERS_COLLECTION).doc(firebase_uid).collection('addresses').doc(addressId).delete();
  return true;
}
async function setDefaultAddress(firebase_uid, addressId) {
  const addressesRef = db.collection(USERS_COLLECTION).doc(firebase_uid).collection('addresses');
  const snapshot = await addressesRef.where('is_default', '==', true).get();
  for (const doc of snapshot.docs) await doc.ref.update({ is_default: false });
  await addressesRef.doc(addressId).update({ is_default: true });
  return true;
}

/** Admin user listing and stats */
async function listAllUsers({ page = 1, limit = 10 } = {}) {
  // Add 15-second timeout
  const firestoreOperation = async () => {
    const usersRef = db.collection(USERS_COLLECTION).orderBy('created_at', 'desc').limit(page * limit);
    const snapshot = await usersRef.get();
    const all = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => !u.deleted_at);
    const total = all.length;
    return {
      users: all.slice((page - 1) * limit, (page) * limit),
      total
    };
  };
  
  return await Promise.race([
    firestoreOperation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore list users timed out')), 15000)
    )
  ]);
}

async function userStats() {
  // Add 15-second timeout
  const firestoreOperation = async () => {
    const usersRef = db.collection(USERS_COLLECTION);
    const snapshot = await usersRef.get();
    const all = snapshot.docs.map(doc => doc.data());
    const total = all.length;
    const active = all.filter(u => u.status === 'active').length;
    const suspended = all.filter(u => u.status === 'suspended').length;
    const deleted = all.filter(u => u.status === 'deleted').length;
    return { total, active, suspended, deleted };
  };
  
  return await Promise.race([
    firestoreOperation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore stats timed out')), 15000)
    )
  ]);
}

/** Restore user profile (undo soft delete) */
async function restoreUserProfile(firebase_uid) {
  try {
    const firestoreOperation = async () => {
      const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
      const restoreData = {
        deleted_at: null,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      };
      await userRef.update(restoreData);
      try { await redisClient.del(`user-profile:${firebase_uid}`); } catch (_) { }
      const restoredDoc = await userRef.get();
      return { uid: firebase_uid, ...restoredDoc.data() };
    };
    
    return await Promise.race([
      firestoreOperation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore restore timed out')), 15000)
      )
    ]);
  } catch (error) {
    throw new Error(`Failed to restore user profile: ${error.message}`);
  }
}

/** Update last login timestamp */
async function updateLastLogin(firebase_uid, { ip_address, user_agent }) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    await userRef.update({
      last_login_at: admin.firestore.FieldValue.serverTimestamp(),
      last_login_ip: ip_address,
      last_login_user_agent: user_agent,
      login_count: admin.firestore.FieldValue.increment(1)
    });
    try { await redisClient.del(`user-profile:${firebase_uid}`); } catch (_) { }
  } catch (error) {
    console.error('Failed to update last login:', error.message);
  }
}

/** Audit login attempt */
async function auditLoginAttempt(firebase_uid, success, { ip_address, user_agent }) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    await userRef.update({
      login_attempts: admin.firestore.FieldValue.arrayUnion({
        success,
        ip_address,
        user_agent,
        timestamp: new Date().toISOString() // Use ISO string instead of serverTimestamp in arrays
      })
    });
  } catch (error) {
    console.error('Failed to audit login attempt:', error.message);
  }
}

/** Audit account change */
async function auditAccountChange(firebase_uid, action, metadata = {}) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
    await userRef.update({
      account_changes: admin.firestore.FieldValue.arrayUnion({
        action,
        metadata,
        timestamp: new Date().toISOString() // Use ISO string instead of serverTimestamp in arrays
      })
    });
  } catch (error) {
    console.error('Failed to audit account change:', error.message);
  }
}

module.exports = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  restoreUserProfile,
  setUserRole,
  getUserRole,
  setEmailVerificationToken,
  verifyEmailToken,
  setPasswordResetToken,
  verifyPasswordResetToken,
  clearPasswordResetToken,
  getAddresses,
  addAddress,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  listAllUsers,
  userStats,
  updateLastLogin,
  auditLoginAttempt,
  auditAccountChange
};

