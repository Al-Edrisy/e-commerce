// src/services/userProfileService.js
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

const USERS_COLLECTION = 'users';

/**
 * Create a new user profile in Firestore
 * @param {string} firebase_uid - Firebase user ID
 * @param {Object} profileData - User profile data
 * @returns {Promise<Object>} Created user profile
 */
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
            deleted_at: null
        };

        await userRef.set(userData);
        
        // Fetch the created document to return with server timestamps
        const createdDoc = await userRef.get();
        return { uid: firebase_uid, ...createdDoc.data() };
    } catch (error) {
        throw new Error(`Failed to create user profile: ${error.message}`);
    }
}

/**
 * Get user profile by Firebase UID
 * @param {string} firebase_uid - Firebase user ID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
async function getUserProfile(firebase_uid) {
    try {
        const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return null;
        }
        
        const userData = userDoc.data();
        
        // Don't return soft-deleted users
        if (userData.deleted_at) {
            return null;
        }
        
        return { uid: firebase_uid, ...userData };
    } catch (error) {
        throw new Error(`Failed to get user profile: ${error.message}`);
    }
}

/**
 * Update user profile fields
 * @param {string} firebase_uid - Firebase user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user profile
 */
async function updateUserProfile(firebase_uid, updates) {
    try {
        const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
        
        // Check if user exists
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        
        // Prevent updating certain fields
        const allowedFields = [
            'first_name', 'last_name', 'phone_number', 'status',
            'email_verified', 'profile_completed', 'timezone', 'language'
        ];
        
        const updateData = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        }
        
        // Always update the updated_at timestamp
        updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();
        
        await userRef.update(updateData);
        
        // Fetch and return updated document
        const updatedDoc = await userRef.get();
        return { uid: firebase_uid, ...updatedDoc.data() };
    } catch (error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
    }
}

/**
 * Soft delete user profile by setting deleted_at timestamp
 * @param {string} firebase_uid - Firebase user ID
 * @returns {Promise<Object>} Deleted user profile
 */
async function deleteUserProfile(firebase_uid) {
    try {
        const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
        
        // Check if user exists
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        
        const deleteData = {
            deleted_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            status: 'deleted'
        };
        
        await userRef.update(deleteData);
        
        // Fetch and return updated document
        const deletedDoc = await userRef.get();
        return { uid: firebase_uid, ...deletedDoc.data() };
    } catch (error) {
        throw new Error(`Failed to delete user profile: ${error.message}`);
    }
}

/**
 * Update last login information
 * @param {string} firebase_uid - Firebase user ID
 * @param {Object} loginData - Login metadata (ip_address, user_agent)
 * @returns {Promise<void>}
 */
async function updateLastLogin(firebase_uid, loginData = {}) {
    try {
        const userRef = db.collection(USERS_COLLECTION).doc(firebase_uid);
        
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        
        const currentData = userDoc.data();
        const loginCount = (currentData.login_count || 0) + 1;
        
        const updateData = {
            last_login_at: admin.firestore.FieldValue.serverTimestamp(),
            login_count: loginCount,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (loginData.ip_address) {
            updateData.ip_address = loginData.ip_address;
        }
        
        if (loginData.user_agent) {
            updateData.user_agent = loginData.user_agent;
        }
        
        await userRef.update(updateData);
    } catch (error) {
        throw new Error(`Failed to update last login: ${error.message}`);
    }
}

module.exports = {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    updateLastLogin
};
