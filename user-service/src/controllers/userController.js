const { auth } = require('../config/firebase');
const userProfileService = require('../services/userProfileService');
const sessionService = require('../services/sessionService');
const { emitEvent } = require('../services/eventService');
const crypto = require('crypto');
const axios = require('axios');

// --- Main User Endpoints ---
exports.register = async (req, res) => {
    const { email, password, first_name, last_name, phone_number, timezone, language } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const userRecord = await auth.createUser({ email, password, displayName: first_name ? `${first_name} ${last_name || ''}`.trim() : undefined });
        const ip_address = req.ip || req.connection.remoteAddress || '';
        const user_agent = req.headers['user-agent'] || '';
        const profileData = {
            email, first_name: first_name || '', last_name: last_name || '', phone_number: phone_number || '',
            timezone: timezone || 'UTC', language: language || 'en', source: 'web', ip_address, user_agent, email_verified: false, profile_completed: !!(first_name && last_name)
        };
        const userProfile = await userProfileService.createUserProfile(userRecord.uid, profileData);
        emitEvent('user.registered', { uid: userRecord.uid });
        res.status(201).json({ message: 'User registered successfully', uid: userRecord.uid, profile: userProfile });
    } catch (error) {
        if (error.code === 'auth/email-already-exists') return res.status(400).json({ error: 'Email already exists' });
        if (error.code === 'auth/invalid-email') return res.status(400).json({ error: 'Invalid email format' });
        if (error.code === 'auth/weak-password') return res.status(400).json({ error: 'Password is too weak' });
        res.status(400).json({ error: error.message });
    }
};
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.uid;

        // Try with timeout
        let userProfile;
        try {
            userProfile = await Promise.race([
                userProfileService.getUserProfile(userId),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[GET_PROFILE] Firestore timed out, returning basic info from JWT');
                return res.json({
                    uid: userId,
                    email: req.user.email || '',
                    note: 'Full profile unavailable due to database timeout. Basic info from token.',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        if (!userProfile) return res.status(404).json({ error: 'User profile not found' });
        res.json(userProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const updates = req.body;

        // Try with timeout
        let updatedProfile;
        try {
            updatedProfile = await Promise.race([
                userProfileService.updateUserProfile(userId, updates),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[UPDATE_PROFILE] Firestore timed out');
                return res.status(200).json({
                    message: 'Update request received',
                    updates,
                    note: 'Changes may not persist due to database timeout',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        emitEvent('user.updated', { uid: userId, updates });
        res.json(updatedProfile);
    } catch (error) {
        if (error.message === 'User not found') return res.status(404).json({ error: error.message });
        res.status(400).json({ error: error.message });
    }
};
exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.user.uid;

        // Try with timeout
        let deletedProfile;
        try {
            deletedProfile = await Promise.race([
                userProfileService.deleteUserProfile(userId),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[DELETE_PROFILE] Firestore timed out');
                return res.status(202).json({
                    message: 'Deletion request accepted',
                    note: 'Deletion may not be immediately reflected due to database timeout',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        await sessionService.invalidateAllUserSessions(userId);
        emitEvent('user.deleted', { uid: userId });
        res.json({ message: 'User profile deleted successfully', profile: deletedProfile });
    } catch (error) {
        if (error.message === 'User not found') return res.status(404).json({ error: error.message });
        res.status(400).json({ error: error.message });
    }
};
// --- Sessions ---
exports.createSession = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { device_type, browser, os, location_country, location_city } = req.body;
        const ip_address = req.ip || req.connection.remoteAddress || '';
        const user_agent = req.headers['user-agent'] || '';
        const sessionData = { device_type: device_type || 'unknown', browser: browser || '', os: os || '', ip_address, user_agent, location_country: location_country || '', location_city: location_city || '' };
        const session = await sessionService.createSession(userId, sessionData);
        await userProfileService.updateLastLogin(userId, { ip_address, user_agent });
        emitEvent('session.created', { uid: userId, session_token: session.session_token });
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getSession = async (req, res) => {
    try {
        const { session_token } = req.params;
        const session = await sessionService.getSession(session_token);
        if (!session) return res.status(404).json({ error: 'Session not found or expired' });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getActiveSessions = async (req, res) => {
    try {
        const userId = req.user.uid;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sessions = await sessionService.getActiveSessionsByUser(userId, { page, limit });
        res.json({ sessions, page, limit, count: sessions.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.invalidateSession = async (req, res) => {
    try {
        const { session_token } = req.params;
        const session = await sessionService.invalidateSession(session_token);
        res.json({ message: 'Session invalidated successfully', session });
    } catch (error) {
        if (error.message === 'Session not found') return res.status(404).json({ error: error.message });
        res.status(400).json({ error: error.message });
    }
};
exports.invalidateAllSessions = async (req, res) => {
    try {
        const userId = req.user.uid;
        const count = await sessionService.invalidateAllUserSessions(userId);
        res.json({ message: 'All sessions invalidated successfully', count });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// --- Email verification ---
exports.sendEmailVerification = async (req, res) => {
    const userId = req.user.uid;
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
        await userProfileService.setEmailVerificationToken(userId, token, expires);
        res.status(200).json({ message: 'Verification token generated (no email sent in dev)', token, expires });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.verifyEmailToken = async (req, res) => {
    const userId = req.user.uid;
    const { token } = req.body;
    try {
        const result = await userProfileService.verifyEmailToken(userId, token);
        if (result) res.status(200).json({ message: 'Email verified successfully' });
        else res.status(400).json({ error: 'Invalid or expired verification token' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.resendEmailVerification = async (req, res) => exports.sendEmailVerification(req, res);
// --- Password reset ---
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;
        const token = crypto.randomBytes(36).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 60);
        await userProfileService.setPasswordResetToken(uid, token, expires);
        res.status(200).json({ message: 'Password reset token generated (no email sent in dev)', token, expires });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        if (!email || !token || !newPassword) return res.status(400).json({ error: 'Missing fields' });
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;
        const isValid = await userProfileService.verifyPasswordResetToken(uid, token);
        if (!isValid) return res.status(400).json({ error: 'Reset token invalid or expired' });
        await auth.updateUser(uid, { password: newPassword });
        await userProfileService.clearPasswordResetToken(uid);
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// --- RBAC ---
exports.getUserRole = async (req, res) => {
    try {
        const uid = req.user.uid;
        const role = await userProfileService.getUserRole(uid);
        res.json({ role });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.setUserRole = async (req, res) => {
    const { uid, role } = req.body;
    if (!uid || !role) return res.status(400).json({ error: 'uid and role required' });
    try {
        await userProfileService.setUserRole(uid, role);
        res.json({ message: `Role set to ${role} for user ${uid}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// --- Addresses ---
function validateAddressObj(address) {
    const required = ['street', 'city', 'country'];
    for (const f of required) if (!address[f]) return `${f} is required`;
    return null;
}
exports.listAddresses = async (req, res) => {
    try {
        const uid = req.user.uid;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const addresses = await userProfileService.getAddresses(uid, { page, limit });
        res.json({ addresses, page, limit, count: addresses.length });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.addAddress = async (req, res) => {
    try {
        const uid = req.user.uid;
        const addr = req.body;
        const err = validateAddressObj(addr); if (err) return res.status(400).json({ error: err });
        const data = await userProfileService.addAddress(uid, addr);
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getAddress = async (req, res) => {
    try {
        const data = await userProfileService.getAddressById(req.user.uid, req.params.id);
        if (!data) return res.status(404).json({ error: 'Address not found' });
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateAddress = async (req, res) => {
    try {
        const updates = req.body;
        if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });
        if ('street' in updates || 'city' in updates || 'country' in updates) {
            const err = validateAddressObj({ ...updates }); if (err) return res.status(400).json({ error: err });
        }
        const updated = await userProfileService.updateAddress(req.user.uid, req.params.id, updates);
        if (!updated) return res.status(404).json({ error: 'Address not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteAddress = async (req, res) => {
    try {
        await userProfileService.deleteAddress(req.user.uid, req.params.id);
        res.json({ message: 'Address deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.setDefaultAddress = async (req, res) => {
    try {
        await userProfileService.setDefaultAddress(req.user.uid, req.params.id);
        res.json({ message: 'Default address set' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// --- Internal / Service endpoints ---
exports.checkUserExists = async (req, res) => {
    try {
        const { uid } = req.params;
        if (!auth) {
            return res.status(200).json({ exists: true, uid, mock: true, message: 'Firebase not configured - returning mock response' });
        }
        const userProfile = await userProfileService.getUserProfile(uid);
        if (userProfile) return res.status(200).json({ exists: true, uid });
        try {
            await auth.getUser(uid);
            return res.status(200).json({ exists: true, uid, profile_missing: true });
        } catch (authError) {
            if (authError.code === 'auth/user-not-found') return res.status(404).json({ exists: false, error: 'User not found' });
            throw authError;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// --- Admin Endpoints ---
exports.listAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Try with timeout
        let result;
        try {
            result = await Promise.race([
                userProfileService.listAllUsers({ page, limit }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 15000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[LIST_ALL_USERS] Firestore timed out');
                return res.json({
                    users: [],
                    page,
                    limit,
                    total: 0,
                    note: 'Data unavailable due to database timeout',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        res.json({ users: result.users, page, limit, total: result.total });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getUserById = async (req, res) => {
    try {
        // Try with timeout
        let user;
        try {
            user = await Promise.race([
                userProfileService.getUserProfile(req.params.uid),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[GET_USER_BY_ID] Firestore timed out');
                return res.json({
                    uid: req.params.uid,
                    note: 'User data unavailable due to database timeout',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateUserById = async (req, res) => {
    try {
        // Try with timeout
        let updated;
        try {
            updated = await Promise.race([
                userProfileService.updateUserProfile(req.params.uid, req.body),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[UPDATE_USER_BY_ID] Firestore timed out');
                return res.status(202).json({
                    message: 'Update request accepted',
                    uid: req.params.uid,
                    updates: req.body,
                    note: 'Changes may not persist due to database timeout',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteUserById = async (req, res) => {
    try {
        // Try with timeout
        try {
            await Promise.race([
                userProfileService.deleteUserProfile(req.params.uid),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[DELETE_USER_BY_ID] Firestore timed out');
                return res.status(202).json({
                    message: 'Deletion request accepted',
                    uid: req.params.uid,
                    note: 'Deletion may not be immediately reflected due to database timeout',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        res.json({ message: 'User deleted (soft)' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.changeUserStatus = async (req, res) => {
    try {
        // Try with timeout
        let updated;
        try {
            updated = await Promise.race([
                userProfileService.updateUserProfile(req.params.uid, { status: req.body.status }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[CHANGE_USER_STATUS] Firestore timed out');
                return res.status(202).json({
                    message: 'Status change request accepted',
                    uid: req.params.uid,
                    status: req.body.status,
                    note: 'Changes may not persist due to database timeout',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.userStats = async (req, res) => {
    try {
        // Try with timeout
        let stats;
        try {
            stats = await Promise.race([
                userProfileService.userStats(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 15000)
                )
            ]);
        } catch (timeoutError) {
            if (timeoutError.message === 'Firestore timeout') {
                console.warn('[USER_STATS] Firestore timed out');
                return res.json({
                    total: 0,
                    active: 0,
                    suspended: 0,
                    deleted: 0,
                    note: 'Stats unavailable due to database timeout',
                    firestore_issue: true
                });
            }
            throw timeoutError;
        }

        res.json(stats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.adminListSessions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { sessions, total } = await sessionService.adminListSessions({ page, limit });
        res.json({ sessions, page, limit, total });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// --- GDPR ---
exports.dataExport = async (req, res) => {
    try {
        const { uid } = req.user;

        // Try to get profile with timeout
        let profile;
        try {
            profile = await Promise.race([
                userProfileService.getUserProfile(uid),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            console.warn('[DATA_EXPORT] Profile lookup timed out');
            profile = {
                uid,
                email: req.user.email || '',
                note: 'Full profile unavailable due to database timeout'
            };
        }

        // Try to get addresses with timeout
        let addresses = [];
        try {
            addresses = await Promise.race([
                userProfileService.getAddresses(uid, { page: 1, limit: 100 }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            console.warn('[DATA_EXPORT] Addresses lookup timed out');
        }

        // Try to get sessions with timeout
        let sessions = [];
        try {
            sessions = await Promise.race([
                sessionService.getActiveSessionsByUser(uid, { page: 1, limit: 100 }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);
        } catch (timeoutError) {
            console.warn('[DATA_EXPORT] Sessions lookup timed out');
        }

        res.json({
            profile,
            addresses,
            sessions,
            note: (!profile || addresses.length === 0) ? 'Some data may be incomplete due to database timeouts' : undefined
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.hardDelete = async (req, res) => {
    try {
        const { uid } = req.user;
        await require('../config/firebase').db.collection('users').doc(uid).delete();
        try { await require('../config/firebase').auth.deleteUser(uid); } catch (e) { }
        res.json({ message: 'All user data permanently deleted (GDPR hard delete)' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Login with Firebase REST API ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
        if (!FIREBASE_API_KEY) {
            console.error('FIREBASE_API_KEY is not configured in .env');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Call Firebase REST API to verify password
        const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

        console.log(`[LOGIN] Attempting login for: ${email}`);

        let firebaseResponse;
        try {
            // Add 7-second timeout for Firebase API call
            firebaseResponse = await Promise.race([
                axios.post(firebaseAuthUrl, {
                    email,
                    password,
                    returnSecureToken: true
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firebase API timeout')), 7000)
                )
            ]);
        } catch (axiosError) {
            if (axiosError.message === 'Firebase API timeout') {
                console.error('[LOGIN] Firebase API timed out');
                return res.status(504).json({ error: 'Authentication service timeout. Please try again.' });
            }

            console.error('[LOGIN] Firebase API error:', axiosError.response?.data || axiosError.message);

            if (axiosError.response?.data?.error) {
                const errorCode = axiosError.response.data.error.message;
                if (errorCode === 'EMAIL_NOT_FOUND' || errorCode === 'INVALID_PASSWORD') {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
                if (errorCode === 'USER_DISABLED') {
                    return res.status(403).json({ error: 'User account has been disabled' });
                }
                return res.status(400).json({ error: errorCode });
            }

            return res.status(500).json({ error: 'Authentication failed' });
        }

        const { idToken, localId } = firebaseResponse.data;

        console.log(`[LOGIN] Firebase auth successful for UID: ${localId}`);

        // Try to get user profile with timeout
        let userProfile;
        try {
            userProfile = await Promise.race([
                userProfileService.getUserProfile(localId),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 5000)
                )
            ]);
        } catch (profileError) {
            console.warn('[LOGIN] Firestore profile lookup timed out, creating basic profile');
            userProfile = null;
        }

        // If no profile exists, create a basic one
        if (!userProfile) {
            console.log('[LOGIN] No profile found, creating basic profile');
            try {
                const userEmail = firebaseResponse.data.email || email;
                const ip_address = req.ip || req.connection.remoteAddress || '';
                const user_agent = req.headers['user-agent'] || '';

                userProfile = await userProfileService.createUserProfile(localId, {
                    email: userEmail,
                    first_name: '',
                    last_name: '',
                    phone_number: '',
                    timezone: 'UTC',
                    language: 'en',
                    source: 'web',
                    ip_address,
                    user_agent,
                    email_verified: false,
                    profile_completed: false
                });
                console.log('[LOGIN] Basic profile created successfully');
            } catch (createError) {
                console.error('[LOGIN] Failed to create profile:', createError.message);
                // Continue anyway, profile will be created on next update
            }
        }

        // Update last login (non-blocking)
        const ip_address = req.ip || req.connection.remoteAddress || '';
        const user_agent = req.headers['user-agent'] || '';
        userProfileService.updateLastLogin(localId, { ip_address, user_agent }).catch(err => {
            console.error('[LOGIN] Failed to update last login:', err.message);
        });

        emitEvent('user.login', { uid: localId });

        res.json({
            message: 'Login successful',
            idToken,
            uid: localId,
            profile: userProfile
        });

    } catch (error) {
        console.error('[LOGIN] Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};

// --- Logout ---
exports.logout = async (req, res) => {
    try {
        const userId = req.user.uid;
        const ip_address = req.ip || req.connection.remoteAddress || '';
        const user_agent = req.headers['user-agent'] || '';

        // Audit the logout
        try {
            await userProfileService.auditAccountChange(userId, 'logout', { ip_address, user_agent });
        } catch (auditError) {
            console.error('[LOGOUT] Audit failed:', auditError.message);
            // Continue with logout even if audit fails
        }

        emitEvent('user.logout', { uid: userId });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('[LOGOUT] Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// --- Get Me (current user info) ---
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.uid;
        const userProfile = await userProfileService.getUserProfile(userId);
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        res.json(userProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Restore Profile ---
exports.restoreProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const restored = await userProfileService.restoreUserProfile(userId);
        res.json({ message: 'Profile restored successfully', profile: restored });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Restore User By ID (Admin) ---
exports.restoreUserById = async (req, res) => {
    try {
        const { uid } = req.params;
        const restored = await userProfileService.restoreUserProfile(uid);
        res.json({ message: 'User restored successfully', profile: restored });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Cleanup Permanent Deletes (Admin) ---
exports.cleanupPermanentDeletes = async (req, res) => {
    try {
        // This would permanently delete users marked for deletion after 30 days
        res.status(501).json({ message: 'Cleanup not yet implemented' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Deactivate Account ---
exports.deactivateAccount = async (req, res) => {
    try {
        const userId = req.user.uid;
        const updated = await userProfileService.updateUserProfile(userId, { status: 'inactive' });
        res.json({ message: 'Account deactivated', profile: updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Reactivate Account ---
exports.reactivateAccount = async (req, res) => {
    try {
        const userId = req.user.uid;
        const updated = await userProfileService.updateUserProfile(userId, { status: 'active' });
        res.json({ message: 'Account reactivated', profile: updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Change Password ---
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { current_password, new_password } = req.body;

        // Verify current password via Firebase REST API
        const email = req.user.email;
        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

        try {
            await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
                { email, password: current_password, returnSecureToken: true }
            );
        } catch (error) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        await auth.updateUser(userId, { password: new_password });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Change Email ---
exports.changeEmail = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { new_email, password } = req.body;

        // Verify password
        const currentEmail = req.user.email;
        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

        try {
            await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
                { email: currentEmail, password, returnSecureToken: true }
            );
        } catch (error) {
            return res.status(401).json({ error: 'Password is incorrect' });
        }

        // Update email
        await auth.updateUser(userId, { email: new_email });
        await userProfileService.updateUserProfile(userId, { email: new_email, email_verified: false });

        res.json({ message: 'Email changed successfully. Please verify your new email.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- GDPR Consent ---
exports.acceptGDPRConsent = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { consent_version } = req.body;

        await userProfileService.updateUserProfile(userId, {
            gdpr_consent: true,
            gdpr_consent_version: consent_version,
            gdpr_consent_date: new Date().toISOString()
        });

        res.json({ message: 'GDPR consent recorded' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Terms of Service ---
exports.acceptTermsOfService = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { tos_version } = req.body;

        await userProfileService.updateUserProfile(userId, {
            tos_accepted: true,
            tos_version: tos_version,
            tos_accepted_date: new Date().toISOString()
        });

        res.json({ message: 'Terms of Service accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Privacy Policy ---
exports.acceptPrivacyPolicy = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { privacy_policy_version } = req.body;

        await userProfileService.updateUserProfile(userId, {
            privacy_policy_accepted: true,
            privacy_policy_version: privacy_policy_version,
            privacy_policy_accepted_date: new Date().toISOString()
        });

        res.json({ message: 'Privacy Policy accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
