// src/services/sessionService.js
const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

const SESSIONS_COLLECTION = 'user_sessions';

/**
 * Create a new session in Firestore
 * @param {string} user_uid - Firebase user ID
 * @param {Object} sessionData - Session metadata
 * @returns {Promise<Object>} Created session with session_token
 */
async function createSession(user_uid, sessionData) {
    try {
        // Generate a unique session token
        const session_token = sessionData.session_token || uuidv4();
        
        const sessionRef = db.collection(SESSIONS_COLLECTION).doc(session_token);
        
        // Calculate expiration time (default 7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const sessionDoc = {
            user_uid: user_uid,
            device_type: sessionData.device_type || 'unknown',
            browser: sessionData.browser || '',
            os: sessionData.os || '',
            ip_address: sessionData.ip_address || '',
            location_country: sessionData.location_country || '',
            location_city: sessionData.location_city || '',
            is_active: true,
            last_activity_at: admin.firestore.FieldValue.serverTimestamp(),
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            expires_at: admin.firestore.Timestamp.fromDate(expiresAt)
        };
        
        await sessionRef.set(sessionDoc);
        
        // Fetch the created document to return with server timestamps
        const createdDoc = await sessionRef.get();
        return { session_token, ...createdDoc.data() };
    } catch (error) {
        throw new Error(`Failed to create session: ${error.message}`);
    }
}

/**
 * Get session by session token
 * @param {string} session_token - Session token
 * @returns {Promise<Object|null>} Session data or null if not found
 */
async function getSession(session_token) {
    try {
        const sessionRef = db.collection(SESSIONS_COLLECTION).doc(session_token);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return null;
        }
        
        const sessionData = sessionDoc.data();
        
        // Check if session is expired
        const now = new Date();
        const expiresAt = sessionData.expires_at.toDate();
        
        if (now > expiresAt) {
            // Session expired, mark as inactive
            await invalidateSession(session_token);
            return null;
        }
        
        // Check if session is active
        if (!sessionData.is_active) {
            return null;
        }
        
        return { session_token, ...sessionData };
    } catch (error) {
        throw new Error(`Failed to get session: ${error.message}`);
    }
}

/**
 * Update session activity timestamp
 * @param {string} session_token - Session token
 * @returns {Promise<Object>} Updated session
 */
async function updateSessionActivity(session_token) {
    try {
        const sessionRef = db.collection(SESSIONS_COLLECTION).doc(session_token);
        
        // Check if session exists
        const sessionDoc = await sessionRef.get();
        if (!sessionDoc.exists) {
            throw new Error('Session not found');
        }
        
        const updateData = {
            last_activity_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await sessionRef.update(updateData);
        
        // Fetch and return updated document
        const updatedDoc = await sessionRef.get();
        return { session_token, ...updatedDoc.data() };
    } catch (error) {
        throw new Error(`Failed to update session activity: ${error.message}`);
    }
}

/**
 * Invalidate session by setting is_active to false
 * @param {string} session_token - Session token
 * @returns {Promise<Object>} Invalidated session
 */
async function invalidateSession(session_token) {
    try {
        const sessionRef = db.collection(SESSIONS_COLLECTION).doc(session_token);
        
        // Check if session exists
        const sessionDoc = await sessionRef.get();
        if (!sessionDoc.exists) {
            throw new Error('Session not found');
        }
        
        const updateData = {
            is_active: false,
            last_activity_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await sessionRef.update(updateData);
        
        // Fetch and return updated document
        const updatedDoc = await sessionRef.get();
        return { session_token, ...updatedDoc.data() };
    } catch (error) {
        throw new Error(`Failed to invalidate session: ${error.message}`);
    }
}

/**
 * Get all active sessions for a user
 * @param {string} user_uid - Firebase user ID
 * @returns {Promise<Array>} Array of active sessions
 */
async function getActiveSessionsByUser(user_uid) {
    try {
        const sessionsRef = db.collection(SESSIONS_COLLECTION);
        const snapshot = await sessionsRef
            .where('user_uid', '==', user_uid)
            .where('is_active', '==', true)
            .get();
        
        if (snapshot.empty) {
            return [];
        }
        
        const sessions = [];
        const now = new Date();
        
        for (const doc of snapshot.docs) {
            const sessionData = doc.data();
            const expiresAt = sessionData.expires_at.toDate();
            
            // Only include non-expired sessions
            if (now <= expiresAt) {
                sessions.push({
                    session_token: doc.id,
                    ...sessionData
                });
            } else {
                // Invalidate expired session
                await invalidateSession(doc.id);
            }
        }
        
        return sessions;
    } catch (error) {
        throw new Error(`Failed to get active sessions: ${error.message}`);
    }
}

/**
 * Invalidate all sessions for a user
 * @param {string} user_uid - Firebase user ID
 * @returns {Promise<number>} Number of sessions invalidated
 */
async function invalidateAllUserSessions(user_uid) {
    try {
        const sessionsRef = db.collection(SESSIONS_COLLECTION);
        const snapshot = await sessionsRef
            .where('user_uid', '==', user_uid)
            .where('is_active', '==', true)
            .get();
        
        if (snapshot.empty) {
            return 0;
        }
        
        const batch = db.batch();
        let count = 0;
        
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                is_active: false,
                last_activity_at: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;
        });
        
        await batch.commit();
        return count;
    } catch (error) {
        throw new Error(`Failed to invalidate all user sessions: ${error.message}`);
    }
}

module.exports = {
    createSession,
    getSession,
    updateSessionActivity,
    invalidateSession,
    getActiveSessionsByUser,
    invalidateAllUserSessions
};
