// src/utils/errorHandler.js
const logger = require('../services/loggingService');

const isProduction = process.env.NODE_ENV === 'production';
function createErrorResponse({ code, message, details = {}, statusCode = 500, error = null }) {
    if (error) {
        logger.error({ code, message, error: error.message, stack: error.stack, details });
    }
    const sanitizedMessage = sanitizeErrorMessage(message, error);
    const response = {
        success: false,
        error: {
            code: code || 'INTERNAL_ERROR',
            message: sanitizedMessage
        }
    };
    if (!isProduction && Object.keys(details).length > 0) {
        response.error.details = details;
    }
    if (!isProduction && error && error.stack) {
        response.error.stack = error.stack;
    }
    return { statusCode, response };
}
function sanitizeErrorMessage(message, error) {
    if (!message && error) {
        const errorMessage = error.message || 'An error occurred';
        const safeMessages = [
            'User not found',
            'Email already exists',
            'Invalid email format',
            'Password is too weak',
            'Invalid credentials',
            'Session not found',
            'Unauthorized',
            'Forbidden'
        ];
        const isSafe = safeMessages.some(safe => errorMessage.toLowerCase().includes(safe.toLowerCase()));
        if (isSafe) return errorMessage;
        if (isProduction) return 'An error occurred. Please try again later.';
        return errorMessage;
    }
    return message || 'An error occurred';
}
const ErrorCodes = {
    UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Authentication required', statusCode: 401 },
    FORBIDDEN: { code: 'FORBIDDEN', message: 'Insufficient permissions', statusCode: 403 },
    INVALID_TOKEN: { code: 'INVALID_TOKEN', message: 'Invalid or expired token', statusCode: 401 },
    USER_NOT_FOUND: { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 },
    USER_ALREADY_EXISTS: { code: 'USER_ALREADY_EXISTS', message: 'User already exists', statusCode: 400 },
    INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 },
    ACCOUNT_LOCKED: { code: 'ACCOUNT_LOCKED', message: 'Account is locked due to too many failed login attempts', statusCode: 403 },
    ACCOUNT_DEACTIVATED: { code: 'ACCOUNT_DEACTIVATED', message: 'Account is deactivated', statusCode: 403 },
    VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Validation failed', statusCode: 400 },
    INVALID_INPUT: { code: 'INVALID_INPUT', message: 'Invalid input provided', statusCode: 400 },
    MISSING_REQUIRED_FIELD: { code: 'MISSING_REQUIRED_FIELD', message: 'Required field is missing', statusCode: 400 },
    SESSION_NOT_FOUND: { code: 'SESSION_NOT_FOUND', message: 'Session not found or expired', statusCode: 404 },
    SESSION_INVALID: { code: 'SESSION_INVALID', message: 'Session validation failed', statusCode: 401 },
    INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'An internal error occurred', statusCode: 500 },
    DATABASE_ERROR: { code: 'DATABASE_ERROR', message: 'Database operation failed', statusCode: 500 },
    SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable', statusCode: 503 }
};
function standardError(errorKey, error = null, details = {}) {
    const errorConfig = ErrorCodes[errorKey] || ErrorCodes.INTERNAL_ERROR;
    return createErrorResponse({
        code: errorConfig.code,
        message: errorConfig.message,
        details,
        statusCode: errorConfig.statusCode,
        error
    });
}
function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);
    if (err.code && ErrorCodes[err.code]) {
        const errorConfig = ErrorCodes[err.code];
        const { statusCode, response } = createErrorResponse({
            code: errorConfig.code,
            message: err.message || errorConfig.message,
            details: err.details || {},
            statusCode: errorConfig.statusCode,
            error: err
        });
        return res.status(statusCode).json(response);
    }
    if (err.array && typeof err.array === 'function') {
        const { statusCode, response } = createErrorResponse({
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { errors: err.array() },
            statusCode: 400,
            error: err
        });
        return res.status(statusCode).json(response);
    }
    if (err.code && err.code.startsWith('auth/')) {
        let errorKey = 'INTERNAL_ERROR';
        let message = 'Authentication error';
        switch (err.code) {
            case 'auth/user-not-found': errorKey = 'USER_NOT_FOUND'; message = 'User not found'; break;
            case 'auth/email-already-exists': errorKey = 'USER_ALREADY_EXISTS'; message = 'Email already exists'; break;
            case 'auth/invalid-email': errorKey = 'VALIDATION_ERROR'; message = 'Invalid email format'; break;
            case 'auth/weak-password': errorKey = 'VALIDATION_ERROR'; message = 'Password is too weak'; break;
            case 'auth/invalid-credential':
            case 'auth/wrong-password': errorKey = 'INVALID_CREDENTIALS'; message = 'Invalid email or password'; break;
        }
        const { statusCode, response } = standardError(errorKey, err);
        return res.status(statusCode).json(response);
    }
    const { statusCode, response } = standardError('INTERNAL_ERROR', err);
    res.status(statusCode).json(response);
}
module.exports = {
    createErrorResponse,
    sanitizeErrorMessage,
    ErrorCodes,
    standardError,
    errorHandler
};

