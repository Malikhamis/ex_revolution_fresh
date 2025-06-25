const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  subscribedDate: {
    type: Date,
    default: Date.now
  },
  unsubscribedDate: {
    type: Date
  },
  // For tracking email opens and clicks
  interactions: [
    {
      newsletterId: {
        type: String
      },
      opened: {
        type: Boolean,
        default: false
      },
      clicked: {
        type: Boolean,
        default: false
      },
      openedAt: {
        type: Date
      },
      clickedAt: {
        type: Date
      }
    }
  ]
});

module.exports = mongoose.model('newsletter', NewsletterSchema);
