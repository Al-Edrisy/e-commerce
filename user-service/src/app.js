// src/app.js
require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Middleware: JSON body parsing
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount user-related routes
app.use('/api/users', userRoutes);

// Ping route
app.get('/', (req, res) => res.send('User Service is running'));

module.exports = app;
