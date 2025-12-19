// src/middleware/authMiddleware.js
const { auth } = require('../config/firebase');
const { getUserRole } = require('../services/userProfileService');
const { standardError } = require('../utils/errorHandler');
function requireRole(requiredRoles) {
    return async (req, res, next) => {
        if (!req.user || !req.user.uid) {
            const { statusCode, response } = standardError('UNAUTHORIZED', null);
            return res.status(statusCode).json(response);
        }
        try {
            const userRole = await getUserRole(req.user.uid);
            if (Array.isArray(requiredRoles) ? requiredRoles.includes(userRole) : userRole === requiredRoles) {
                return next();
            }
            const { statusCode, response } = standardError('FORBIDDEN', null);
            return res.status(statusCode).json(response);
        } catch (error) {
            const { statusCode, response } = standardError('INTERNAL_ERROR', error);
            return res.status(statusCode).json(response);
        }
    };
}
module.exports = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        const { statusCode, response } = standardError('UNAUTHORIZED', null);
        return res.status(statusCode).json(response);
    }
    const idToken = header.split(' ')[1];
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        const { statusCode, response } = standardError('INVALID_TOKEN', error);
        res.status(statusCode).json(response);
    }
};
module.exports.requireRole = requireRole;
