// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', userController.register);

// Get current user profile (protected)
router.get('/profile', authMiddleware, userController.getProfile);

// Update current user profile (protected)
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
