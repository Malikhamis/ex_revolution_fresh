const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
require('dotenv').config();

// @route   POST api/contact
// @desc    Send contact form
// @access  Public
router.post(
  '/',
  [
    check('name', 'Please include your name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('message', 'Message is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, subject, message } = req.body;

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
        subject: `Contact Form: ${subject || 'New Message'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0066cc;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
              ${message}
            </div>
            <p style="color: #888; font-size: 14px; margin-top: 20px;">This message was sent from the Ex Revolution Technology website contact form.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      // Send confirmation to user
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank You for Contacting Ex Revolution Technology',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://exrevolution.com/assets/images/logo.jpg" alt="Ex Revolution Technology" style="max-width: 200px;">
            </div>
            <h2 style="color: #0066cc; text-align: center;">Thank You for Contacting Us!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">Dear ${name},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">Thank you for reaching out to Ex Revolution Technology. We have received your message and will get back to you as soon as possible.</p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">Here's a summary of your message:</p>
            <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Subject:</strong> ${subject || 'Not provided'}</p>
              <p><strong>Message:</strong> ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">If you have any additional questions or information to provide, please don't hesitate to reply to this email.</p>
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

      res.json({ msg: 'Contact form submitted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
