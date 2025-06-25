const mongoose = require('mongoose');

/**
 * Lead Schema
 * Stores information about leads captured from various sources including the chatbot
 */
const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  interest: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    default: 'Chatbot',
    enum: ['Chatbot', 'Contact Form', 'Quote Form', 'Newsletter', 'Lead Magnet', 'Referral']
  },
  leadScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'New',
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']
  },
  notes: {
    type: String
  },
  referralCode: {
    type: String
  },
  landingPage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
