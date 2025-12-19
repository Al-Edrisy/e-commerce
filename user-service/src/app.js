require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./services/loggingService');
const { errorHandler } = require('./utils/errorHandler');
const app = express();
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests, please try again later',
});
app.use(['/api/users/register', '/api/users/sessions', '/api/users/login'], apiLimiter);
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.originalUrl} user=${req.user ? req.user.uid : 'anon'}`);
  next();
});
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
app.use('/api/users', userRoutes);
app.use('/api/internal', serviceRoutes);
app.get('/', (req, res) => res.send('User Service is running'));
app.use(errorHandler);
module.exports = app;
