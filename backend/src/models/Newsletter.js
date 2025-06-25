/**
 * Newsletter Model
 * Stores newsletter subscribers
 */

const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  name: {
    type: String,
    trim: true
  },
  interests: {
    type: [String],
    enum: ['web_development', 'mobile_apps', 'digital_marketing', 'it_consulting', 'branding', 'technology_news'],
    default: ['technology_news']
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  source: {
    type: String,
    enum: ['website', 'blog', 'social_media', 'referral', 'other'],
    default: 'website'
  }
});

module.exports = mongoose.model('Newsletter', NewsletterSchema);
