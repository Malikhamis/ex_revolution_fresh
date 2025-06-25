/**
 * Email Service
 * Utility for sending emails
 */

const nodemailer = require('nodemailer');

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} [options.html] - HTML email content (optional)
 * @returns {Promise} - Resolves when email is sent
 */
exports.sendEmail = async (options) => {
  // Check if we're in test mode (NODE_ENV is not production)
  const isTestMode = process.env.NODE_ENV !== 'production';

  try {
    if (isTestMode) {
      // In test mode, log the email instead of sending it
      console.log('========== EMAIL WOULD BE SENT ==========');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content: ${options.text.substring(0, 100)}...`);
      console.log('========================================');

      // Return a mock successful response
      return {
        messageId: `test-${Date.now()}`,
        response: 'Test mode - email not actually sent'
      };
    } else {
      // In production mode, actually send the email
      // Create a transporter
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Define email options
      const mailOptions = {
        from: `Ex Revolution Technology <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      console.log(`Email sent: ${info.messageId}`);
      return info;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw an error in test mode, just log it
    if (isTestMode) {
      console.log('Email error would be handled in production');
      return {
        messageId: `error-${Date.now()}`,
        response: 'Test mode - email error logged but not thrown'
      };
    } else {
      throw new Error('Email could not be sent');
    }
  }
};
