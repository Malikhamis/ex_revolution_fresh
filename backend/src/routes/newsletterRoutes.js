/**
 * Newsletter Routes
 * Routes for handling newsletter subscriptions
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder for newsletter controller
// Will be implemented in future
router.post('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Newsletter subscription received (placeholder)',
    data: req.body
  });
});

module.exports = router;
