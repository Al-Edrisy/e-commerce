const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

const SESSIONS_COLLECTION = 'user_sessions';

async function createSession(user_uid, sessionData) {
    try {
        const session_token = sessionData.session_token || uuidv4();
        const sessionRef = db.collection(SESSIONS_COLLECTION).doc(session_token);
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
        const createdDoc = await sessionRef.get();
        return { session_token, ...createdDoc.data() };
    } catch (error) {
        throw new Error(`Failed to create session: ${error.message}`);
    }
}
async function getSession(session_token) {
    try {
        const sessionRef = db.collection(SESSIONS_COLLECTION).doc(session_token);
        const sessionDoc = await sessionRef.get();
        if (!sessionDoc.exists) return null;
        const sessionData = sessionDoc.data();
        const now = new Date();
        const expiresAt = sessionData.expires_at.toDate();
        if (now > expiresAt) {
            await invalidateSession(session_token);
            return null;
        }
        if (!sessionData.is_active) return null;
        return { session_token, ...sessionData };
    } catch (error) {
        throw new Error(`Failed to get session: ${error.message}`);
    }
}
async function updateSessionActivity(session_token) {
    try {
        const sessionRef = db.collection(SESSIONS_COLLECTION).doc(session_token);
        const sessionDoc = await sessionRef.get();
        if (!sessionDoc.exists) throw new Error('Session not found');
        await sessionRef.update({last_activity_at: admin.firestore.FieldValue.serverTimestamp()});
        const updatedDoc = await sessionRef.get();
        return { session_token, ...updatedDoc.data() };
    } catch (error) {
        throw new Error(`Failed to update session activity: ${error.message}`);
    }
}
async function invalidateSession(session_token) {
    try {
        const sessionRef = db.collection(SESSIONS_COLLECTION).doc(session_token);
        const sessionDoc = await sessionRef.get();
        if (!sessionDoc.exists) throw new Error('Session not found');
        await sessionRef.update({is_active: false,last_activity_at: admin.firestore.FieldValue.serverTimestamp()});
        const updatedDoc = await sessionRef.get();
        return { session_token, ...updatedDoc.data() };
    } catch (error) {
        throw new Error(`Failed to invalidate session: ${error.message}`);
    }
}
async function getActiveSessionsByUser(user_uid, { page = 1, limit = 10 } = {}) {
    try {
        const sessionsRef = db.collection(SESSIONS_COLLECTION);
        const snapshot = await sessionsRef
            .where('user_uid', '==', user_uid)
            .where('is_active', '==', true)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .get();
        const now = new Date();
        const sessions = [];
        for (const doc of snapshot.docs) {
            const sessionData = doc.data();
            const expiresAt = sessionData.expires_at.toDate();
            if (now <= expiresAt) {
                sessions.push({ session_token: doc.id, ...sessionData });
            } else {
                await invalidateSession(doc.id);
            }
        }
        const offset = (page - 1) * limit;
        return sessions.slice(offset, offset + limit);
    } catch (error) {
        throw new Error(`Failed to get active sessions: ${error.message}`);
    }
}
async function invalidateAllUserSessions(user_uid) {
    try {
        const sessionsRef = db.collection(SESSIONS_COLLECTION);
        const snapshot = await sessionsRef
            .where('user_uid', '==', user_uid)
            .where('is_active', '==', true)
            .get();
        if (snapshot.empty) return 0;
        for (const doc of snapshot.docs) {
            await doc.ref.update({is_active: false,last_activity_at: admin.firestore.FieldValue.serverTimestamp()});
        }
        return snapshot.size;
    } catch (error) {
        throw new Error(`Failed to invalidate all user sessions: ${error.message}`);
    }
}
async function adminListSessions({ page = 1, limit = 10 } = {}) {
    const ref = db.collection(SESSIONS_COLLECTION).orderBy('created_at', 'desc').limit(page * limit);
    const snapshot = await ref.get();
    const all = snapshot.docs.map(doc => ({ session_token: doc.id, ...doc.data() }));
    const total = all.length;
    return {
      sessions: all.slice((page-1)*limit, page*limit),
      total
    };
}
module.exports = {
    createSession,
    getSession,
    updateSessionActivity,
    invalidateSession,
    getActiveSessionsByUser,
    invalidateAllUserSessions,
    adminListSessions
};

