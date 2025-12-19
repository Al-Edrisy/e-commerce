// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const { requireRole } = require('../middleware/authMiddleware');

// User Profile Routes
router.post('/register', [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], userController.register);
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/me', authMiddleware, userController.getMe);
router.put('/profile', authMiddleware, userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteProfile);
router.post('/restore', authMiddleware, userController.restoreProfile);

// Session Management Routes
router.post('/sessions', authMiddleware, [
    body('device_type').optional().isString(),
    body('browser').optional().isString(),
    body('os').optional().isString(),
    body('location_country').optional().isString(),
    body('location_city').optional().isString(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], userController.createSession);
router.get('/sessions', authMiddleware, userController.getActiveSessions);
router.get('/sessions/:session_token', userController.getSession);
router.delete('/sessions/:session_token', authMiddleware, userController.invalidateSession);
router.delete('/sessions', authMiddleware, userController.invalidateAllSessions);

// Email Verification Endpoints
router.post('/verify-email', authMiddleware, userController.verifyEmailToken);
router.post('/send-verification', authMiddleware, userController.sendEmailVerification);
router.post('/resend-verification', authMiddleware, userController.resendEmailVerification);

// Password Reset Endpoints
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// User Address Management Endpoints
router.get('/addresses', authMiddleware, userController.listAddresses);
router.post('/addresses', authMiddleware, userController.addAddress);
router.get('/addresses/:id', authMiddleware, userController.getAddress);
router.put('/addresses/:id', authMiddleware, userController.updateAddress);
router.delete('/addresses/:id', authMiddleware, userController.deleteAddress);
router.put('/addresses/:id/default', authMiddleware, userController.setDefaultAddress);

// Internal Service Routes
router.get('/:uid/exists', userController.checkUserExists);

// RBAC Endpoints
router.get('/role', authMiddleware, userController.getUserRole);
router.post('/set-role', authMiddleware, requireRole('admin'), userController.setUserRole);

// Admin Endpoints (RBAC, admins only)
router.get('/admin/users', authMiddleware, requireRole('admin'), userController.listAllUsers);
router.get('/admin/users/:uid', authMiddleware, requireRole('admin'), userController.getUserById);
router.put('/admin/users/:uid', authMiddleware, requireRole('admin'), userController.updateUserById);
router.delete('/admin/users/:uid', authMiddleware, requireRole('admin'), userController.deleteUserById);
router.post('/admin/users/:uid/restore', authMiddleware, requireRole('admin'), userController.restoreUserById);
router.put('/admin/users/:uid/status', authMiddleware, requireRole('admin'), userController.changeUserStatus);
router.get('/admin/users/stats', authMiddleware, requireRole('admin'), userController.userStats);
router.post('/admin/users/cleanup', authMiddleware, requireRole('admin'), userController.cleanupPermanentDeletes);
router.get('/admin/sessions', authMiddleware, requireRole('admin'), userController.adminListSessions);

router.get('/me/export', authMiddleware, userController.dataExport);
router.delete('/me/hard-delete', authMiddleware, userController.hardDelete);
router.post('/deactivate', authMiddleware, userController.deactivateAccount);
router.post('/reactivate', authMiddleware, userController.reactivateAccount);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);

// Password & Email Management
router.put('/change-password', authMiddleware, [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], userController.changePassword);
router.put('/change-email', authMiddleware, [
    body('new_email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required for email change'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], userController.changeEmail);

// GDPR & Compliance Endpoints
router.post('/consent/gdpr', authMiddleware, [
    body('consent_version').notEmpty().withMessage('Consent version is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], userController.acceptGDPRConsent);
router.post('/consent/tos', authMiddleware, [
    body('tos_version').notEmpty().withMessage('TOS version is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], userController.acceptTermsOfService);
router.post('/consent/privacy-policy', authMiddleware, [
    body('privacy_policy_version').notEmpty().withMessage('Privacy policy version is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], userController.acceptPrivacyPolicy);

module.exports = router;
