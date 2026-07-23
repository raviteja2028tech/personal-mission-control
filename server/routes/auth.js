const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { signup, login, logout, forgotPassword, verifyEmail, changePassword, resetPassword } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.put('/change-password', auth, changePassword);

module.exports = router;
