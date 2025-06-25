const mongoose = require('mongoose');

const NewsletterTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scheduledFor: {
    type: Date
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  stats: {
    totalSent: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    }
  }
});

module.exports = mongoose.model('newsletterTemplate', NewsletterTemplateSchema);
