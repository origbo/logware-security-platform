const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, verifyRefreshToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Registration and login routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', verifyRefreshToken, authController.refreshToken);

// Password management routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', authenticate, authController.updatePassword);

// 2FA routes
router.post('/verify-2fa', authController.verify2FA);
router.post('/setup-2fa', authenticate, authController.setup2FA);
router.post('/enable-2fa', authenticate, authController.enable2FA);
router.post('/disable-2fa', authenticate, authController.disable2FA);

// Current user info
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
