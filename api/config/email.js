/**
 * Email Configuration
 */

// Load environment variables
require('dotenv').config();

// Email configuration
const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  user: process.env.EMAIL_USER || 'exrevolution8@gmail.com',
  pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || '',
  from: process.env.EMAIL_FROM || 'Ex Revolution Technology <exrevolution8@gmail.com>',
  admin: process.env.ADMIN_EMAIL || 'exrevolution8@gmail.com'
};

module.exports = emailConfig;
