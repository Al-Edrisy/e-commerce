// src/config/config.js
const logger = require('../services/loggingService');
const config = {
    port: parseInt(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    },
    cors: {
        origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    session: {
        expiryDays: parseInt(process.env.SESSION_EXPIRY_DAYS) || 7,
        maxSessionsPerUser: parseInt(process.env.MAX_SESSIONS_PER_USER) || 5,
        secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
        strictValidation: process.env.STRICT_SESSION_VALIDATION === 'true'
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
};
function validateConfig() {
    const errors = [];
    if (!config.firebase.projectId) { errors.push('FIREBASE_PROJECT_ID is required'); }
    if (!config.firebase.privateKey) { errors.push('FIREBASE_PRIVATE_KEY is required'); }
    if (!config.firebase.clientEmail) { errors.push('FIREBASE_CLIENT_EMAIL is required'); }
    if (isNaN(config.port) || config.port < 1 || config.port > 65535) { errors.push('PORT must be a valid port number (1-65535)'); }
    const validEnvs = ['development', 'staging', 'production', 'test'];
    if (!validEnvs.includes(config.nodeEnv)) { errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`); }
    if (errors.length > 0) {
        const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
    if (config.nodeEnv === 'production') {
        if (config.session.secret === 'default-secret-change-in-production') {
            logger.warn('WARNING: Using default SESSION_SECRET in production. Change this immediately!');
        }
        if (config.cors.origins.includes('*')) {
            logger.warn('WARNING: CORS allows all origins in production. Consider restricting this.');
        }
    }
    logger.info('Configuration validated successfully');
    return true;
}
module.exports = { config, validateConfig };

