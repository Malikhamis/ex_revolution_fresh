/**
 * Quote Routes
 * Routes for handling quote request submissions
 */

const express = require('express');
const router = express.Router();
const { 
  submitQuoteRequest, 
  getQuoteRequests, 
  getQuoteRequest, 
  updateQuoteStatus 
} = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/auth');

// Public route for submitting quote request
router.post('/', submitQuoteRequest);

// Protected routes for admin access
router.get('/', protect, authorize('admin'), getQuoteRequests);
router.get('/:id', protect, authorize('admin'), getQuoteRequest);
router.put('/:id', protect, authorize('admin'), updateQuoteStatus);

module.exports = router;
