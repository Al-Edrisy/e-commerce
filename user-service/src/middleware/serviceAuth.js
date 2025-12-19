// src/middleware/serviceAuth.js
// Simple service-to-service authentication using a shared token.
// Other services must send header: `x-service-token: <SERVICE_AUTH_TOKEN>`
const { standardError } = require('../utils/errorHandler');
module.exports = function serviceAuth(req, res, next) {
    const token = req.headers['x-service-token'];
    const expected = process.env.SERVICE_AUTH_TOKEN;
    if (!expected) {
        const { statusCode, response } = standardError('INTERNAL_ERROR', null, {
            message: 'SERVICE_AUTH_TOKEN not configured'
        });
        return res.status(statusCode).json(response);
    }
    if (!token || token !== expected) {
        const { statusCode, response } = standardError('UNAUTHORIZED', null, {
            message: 'Invalid service token'
        });
        return res.status(statusCode).json(response);
    }
    return next();
};
