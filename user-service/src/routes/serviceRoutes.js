// src/routes/serviceRoutes.js
// Internal API for service-to-service communication (feature 12.1)
const express = require('express');
const router = express.Router();
const userProfileService = require('../services/userProfileService');
const serviceAuth = require('../middleware/serviceAuth');
const { standardError } = require('../utils/errorHandler');

// GET /api/internal/users/:uid
// Allows other services to verify a user (protected by service token)
router.get('/users/:uid', serviceAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await userProfileService.getUserProfile(uid);
    if (!user) {
      const { statusCode, response } = standardError('USER_NOT_FOUND');
      return res.status(statusCode).json(response);
    }
    res.json({ exists: true, user });
  } catch (error) {
    const { statusCode, response } = standardError('INTERNAL_ERROR', error);
    res.status(statusCode).json(response);
  }
});

// GET /api/internal/users/email/:email
router.get('/users/email/:email', serviceAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userProfileService.getUserByEmail(email);
    if (!user) {
      const { statusCode, response } = standardError('USER_NOT_FOUND');
      return res.status(statusCode).json(response);
    }
    res.json({ exists: true, user });
  } catch (error) {
    const { statusCode, response } = standardError('INTERNAL_ERROR', error);
    res.status(statusCode).json(response);
  }
});

// POST /api/internal/users/batch-verify
router.post('/users/batch-verify', serviceAuth, async (req, res) => {
  try {
    const { uids } = req.body;
    if (!Array.isArray(uids)) {
      const { statusCode, response } = standardError('VALIDATION_ERROR', null, { message: 'uids must be array' });
      return res.status(statusCode).json(response);
    }
    // Batch check
    const users = await Promise.all(
      uids.map(async uid => {
        const user = await userProfileService.getUserProfile(uid);
        return user ? { uid, user } : { uid, user: null };
      })
    );
    res.json({ users });
  } catch (error) {
    const { statusCode, response } = standardError('INTERNAL_ERROR', error);
    res.status(statusCode).json(response);
  }
});

module.exports = router;

