const mongoose = require('mongoose');

/**
 * Conversation Schema
 * Stores chatbot conversations for training and improvement
 */
const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true
      },
      message: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  leadCaptured: {
    type: Boolean,
    default: false
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  userAgent: String,
  ipAddress: String,
  referrer: String,
  landingPage: String
});

// Update lastUpdatedAt on save
conversationSchema.pre('save', function(next) {
  this.lastUpdatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
