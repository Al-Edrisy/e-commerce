// src/services/loggingService.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, json, colorize } = format;
const isProduction = process.env.NODE_ENV === 'production';
const logFormat = isProduction
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        printf(({ level, message, timestamp, stack }) => `${timestamp} [${level}]: ${stack || message}`)
    );
const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' })
    ],
    exitOnError: false,
});
module.exports = logger;
