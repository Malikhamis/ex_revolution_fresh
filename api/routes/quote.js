const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
require('dotenv').config();

// @route   POST api/quote
// @desc    Send quote request
// @access  Public
router.post(
  '/',
  [
    check('name', 'Please include your name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('service', 'Service is required').not().isEmpty(),
    check('details', 'Project details are required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, company, service, budget, timeline, details } = req.body;

    try {
      // Send email notification
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'exrevolution8@gmail.com', // Admin email
        subject: `Quote Request: ${service}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0066cc;">New Quote Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Company:</strong> ${company || 'Not provided'}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
            <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
            <p><strong>Project Details:</strong></p>
            <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
              ${details}
            </div>
            <p style="color: #888; font-size: 14px; margin-top: 20px;">This message was sent from the Ex Revolution Technology website quote request form.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      // Send confirmation to user
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Quote Request - Ex Revolution Technology',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://exrevolution.com/assets/images/logo.jpg" alt="Ex Revolution Technology" style="max-width: 200px;">
            </div>
            <h2 style="color: #0066cc; text-align: center;">Thank You for Your Quote Request!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">Dear ${name},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">Thank you for your interest in Ex Revolution Technology services. We have received your quote request for <strong>${service}</strong> and our team is reviewing it.</p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">We will prepare a customized quote based on your requirements and get back to you within 1-2 business days.</p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">If you have any questions or need to provide additional information, please don't hesitate to contact us at <a href="mailto:info@exrevolution.com" style="color: #0066cc; text-decoration: none;">info@exrevolution.com</a> or call us at <a href="tel:+255744622649" style="color: #0066cc; text-decoration: none;">+255 744 622 649</a>.</p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">Best regards,<br>The Ex Revolution Technology Team</p>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 14px;">© 2024 Ex Revolution Technology. All rights reserved.</p>
              <p style="color: #888; font-size: 14px;">Junction of Samora and Morogoro Rd, Dar es Salaam, Tanzania</p>
              <div style="margin-top: 10px;">
                <a href="https://facebook.com/exrevolution" style="color: #0066cc; text-decoration: none; margin: 0 5px;">Facebook</a>
                <a href="https://twitter.com/exrevolution" style="color: #0066cc; text-decoration: none; margin: 0 5px;">Twitter</a>
                <a href="https://linkedin.com/company/exrevolution" style="color: #0066cc; text-decoration: none; margin: 0 5px;">LinkedIn</a>
                <a href="https://instagram.com/exrevolution" style="color: #0066cc; text-decoration: none; margin: 0 5px;">Instagram</a>
              </div>
            </div>
          </div>
        `
      };

      await transporter.sendMail(userMailOptions);

      res.json({ msg: 'Quote request submitted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
