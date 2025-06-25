/**
 * Chatbot Routes
 * Routes for handling chatbot interactions
 */

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Process chatbot messages
router.post('/message', chatbotController.processMessage);

// Store lead information from chatbot
router.post('/lead', chatbotController.storeLead);

module.exports = router;
