/**
 * Contact Routes
 * Routes for handling contact form submissions
 */

const express = require('express');
const router = express.Router();
const { 
  submitContactForm, 
  getContacts, 
  getContact, 
  updateContactStatus 
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public route for submitting contact form
router.post('/', submitContactForm);

// Protected routes for admin access
router.get('/', protect, authorize('admin'), getContacts);
router.get('/:id', protect, authorize('admin'), getContact);
router.put('/:id', protect, authorize('admin'), updateContactStatus);

module.exports = router;
