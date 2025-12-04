// src/controllers/userController.js
const { auth } = require('../config/firebase');
const userProfileService = require('../services/userProfileService');
const sessionService = require('../services/sessionService');

/**
 * Register a new user
 * Creates user in Firebase Auth and profile in Firestore
 */
exports.register = async (req, res) => {
    const { email, password, first_name, last_name, phone_number, timezone, language } = req.body;

    try {
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: first_name ? `${first_name} ${last_name || ''}`.trim() : undefined
        });

        // Extract metadata from request
        const ip_address = req.ip || req.connection.remoteAddress || '';
        const user_agent = req.headers['user-agent'] || '';

        // Create user profile in Firestore
        const profileData = {
            email,
            first_name: first_name || '',
            last_name: last_name || '',
            phone_number: phone_number || '',
            timezone: timezone || 'UTC',
            language: language || 'en',
            source: 'web',
            ip_address,
            user_agent,
            email_verified: false,
            profile_completed: !!(first_name && last_name)
        };

        const userProfile = await userProfileService.createUserProfile(userRecord.uid, profileData);

        res.status(201).json({
            message: 'User registered successfully',
            uid: userRecord.uid,
            profile: userProfile
        });
    } catch (error) {
        // Handle Firebase Auth errors
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ error: 'Password is too weak' });
        }

        res.status(400).json({ error: error.message });
    }
};

/**
 * Get current user profile
 * Protected route - requires authentication
 */
exports.getProfile = async (req, res) => {
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

/**
 * Update user profile
 * Protected route - requires authentication
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const updates = req.body;

        const updatedProfile = await userProfileService.updateUserProfile(userId, updates);

        res.json(updatedProfile);
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};

/**
 * Delete user profile (soft delete)
 * Protected route - requires authentication
 */
exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.user.uid;

        const deletedProfile = await userProfileService.deleteUserProfile(userId);

        // Invalidate all user sessions
        await sessionService.invalidateAllUserSessions(userId);

        res.json({
            message: 'User profile deleted successfully',
            profile: deletedProfile
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};

/**
 * Create a new session for the user
 * Protected route - requires authentication
 */
exports.createSession = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { device_type, browser, os, location_country, location_city } = req.body;

        // Extract metadata from request
        const ip_address = req.ip || req.connection.remoteAddress || '';
        const user_agent = req.headers['user-agent'] || '';

        const sessionData = {
            device_type: device_type || 'unknown',
            browser: browser || '',
            os: os || '',
            ip_address,
            user_agent,
            location_country: location_country || '',
            location_city: location_city || ''
        };

        const session = await sessionService.createSession(userId, sessionData);

        // Update last login information
        await userProfileService.updateLastLogin(userId, { ip_address, user_agent });

        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get session by token
 */
exports.getSession = async (req, res) => {
    try {
        const { session_token } = req.params;

        const session = await sessionService.getSession(session_token);

        if (!session) {
            return res.status(404).json({ error: 'Session not found or expired' });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all active sessions for current user
 * Protected route - requires authentication
 */
exports.getActiveSessions = async (req, res) => {
    try {
        const userId = req.user.uid;

        const sessions = await sessionService.getActiveSessionsByUser(userId);

        res.json({ sessions, count: sessions.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Invalidate a specific session
 * Protected route - requires authentication
 */
exports.invalidateSession = async (req, res) => {
    try {
        const { session_token } = req.params;

        const session = await sessionService.invalidateSession(session_token);

        res.json({
            message: 'Session invalidated successfully',
            session
        });
    } catch (error) {
        if (error.message === 'Session not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};

/**
 * Invalidate all sessions for current user
 * Protected route - requires authentication
 */
exports.invalidateAllSessions = async (req, res) => {
    try {
        const userId = req.user.uid;

        const count = await sessionService.invalidateAllUserSessions(userId);

        res.json({
            message: 'All sessions invalidated successfully',
            count
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Check if a user exists
 * Public route (used by other services)
 */
exports.checkUserExists = async (req, res) => {
    try {
        const { uid } = req.params;

        // If Firebase is not initialized, return a mock response for testing
        if (!auth) {
            console.warn(`Firebase not initialized. Returning mock response for user ${uid}`);
            return res.status(200).json({
                exists: true,
                uid,
                mock: true,
                message: 'Firebase not configured - returning mock response'
            });
        }

        // Try to get user profile
        const userProfile = await userProfileService.getUserProfile(uid);

        if (userProfile) {
            return res.status(200).json({ exists: true, uid });
        } else {
            // If profile not found, check Firebase Auth directly as fallback
            try {
                await auth.getUser(uid);
                return res.status(200).json({ exists: true, uid, profile_missing: true });
            } catch (authError) {
                if (authError.code === 'auth/user-not-found') {
                    return res.status(404).json({ exists: false, error: 'User not found' });
                }
                throw authError;
            }
        }
    } catch (error) {
        console.error(`Error checking user existence for ${req.params.uid}:`, error);
        res.status(500).json({ error: error.message });
    }
};

