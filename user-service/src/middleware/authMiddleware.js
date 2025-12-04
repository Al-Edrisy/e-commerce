// src/middleware/authMiddleware.js
const { auth } = require('../config/firebase');

// Middleware to verify Firebase ID token
module.exports = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    const idToken = header.split(' ')[1];
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken; // add user info to request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
