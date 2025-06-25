/**
 * Auth Routes
 * Routes for user authentication
 */

const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);

// Protected routes
router.get('/me', protect, getMe);

// Admin only routes
router.post('/register', protect, authorize('admin'), register);

module.exports = router;
