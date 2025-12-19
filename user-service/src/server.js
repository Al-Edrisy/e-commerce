// src/server.js
require('dotenv').config();
const app = require('./app');
const { config, validateConfig } = require('./config/config');
const logger = require('./services/loggingService');
try {
    validateConfig();
} catch (error) {
    logger.error('Failed to start server due to configuration errors:', error);
    process.exit(1);
}
const PORT = config.port;
const server = app.listen(PORT, () => {
    logger.info(`User Service listening on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
});
const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    server.close(() => {
        logger.info('HTTP server closed');
        try {
            const redis = require('redis');
            const redisClient = redis.createClient({ url: config.redis.url });
            redisClient.quit().catch(() => {});
        } catch {}
        logger.info('Graceful shutdown completed');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
