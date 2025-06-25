/**
 * Quote Model
 * Stores quote request submissions
 */

const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['web_development', 'mobile_app', 'digital_marketing', 'it_consulting', 'branding', 'other']
  },
  budget: {
    type: String,
    enum: ['less_than_1000', '1000_5000', '5000_10000', 'more_than_10000', 'not_sure']
  },
  timeline: {
    type: String,
    enum: ['less_than_1_month', '1_3_months', '3_6_months', 'more_than_6_months', 'not_sure']
  },
  projectDetails: {
    type: String,
    required: [true, 'Project details are required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'quoted', 'accepted', 'declined', 'completed'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quote', QuoteSchema);
