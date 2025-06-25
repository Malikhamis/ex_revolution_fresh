const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['newsletter', 'guide_download', 'contact_form', 'lead_form', 'other'],
    default: 'other'
  },
  interests: {
    type: [String],
    default: []
  },
  downloads: [
    {
      guide: {
        type: String,
        required: true
      },
      downloadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
