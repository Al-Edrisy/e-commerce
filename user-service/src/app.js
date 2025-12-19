// src/app.js
require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Middleware: JSON body parsing
app.use(express.json());

// Mount user-related routes
app.use('/api/users', userRoutes);

// Ping route
app.get('/', (req, res) => res.send('User Service is running'));

module.exports = app;
