// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// User Profile Routes
router.post('/register', userController.register);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteProfile);

// Session Management Routes
router.post('/sessions', authMiddleware, userController.createSession);
router.get('/sessions', authMiddleware, userController.getActiveSessions);
router.get('/sessions/:session_token', userController.getSession);
router.delete('/sessions/:session_token', authMiddleware, userController.invalidateSession);
router.delete('/sessions', authMiddleware, userController.invalidateAllSessions);

// Internal Service Routes
router.get('/:uid/exists', userController.checkUserExists);

module.exports = router;
