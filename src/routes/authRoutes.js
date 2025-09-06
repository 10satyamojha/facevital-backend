const express = require('express');
const authController = require('../controllers/authControllers');

const router = express.Router();

router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;

// ===== src/routes/profileRoutes.js =====