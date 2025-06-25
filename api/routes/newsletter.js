const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Newsletter = require('../models/Newsletter');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

// @route   POST api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post(
  '/subscribe',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Check if email already exists
      let subscriber = await Newsletter.findOne({ email });

      if (subscriber) {
        return res.status(400).json({ msg: 'Email already subscribed' });
      }

      // Create new subscriber
      subscriber = new Newsletter({
        email,
        subscribed: true,
        subscribedDate: Date.now()
      });

      await subscriber.save();

      // Send confirmation email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Ex Revolution Newsletter',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://exrevolution.com/assets/images/logo.jpg" alt="Ex Revolution Technology" style="max-width: 200px;">
            </div>
            <h2 style="color: #0066cc; text-align: center;">Thank You for Subscribing!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">You've successfully subscribed to the Ex Revolution Technology newsletter. You'll now receive the latest insights, tips, and trends in technology and digital marketing.</p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">We're excited to share our knowledge and help your business grow with technology.</p>
            <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">If you didn't subscribe to our newsletter, please <a href="https://exrevolution.com/unsubscribe?email=${email}" style="color: #0066cc; text-decoration: none;">click here to unsubscribe</a>.</p>
            </div>
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

      await transporter.sendMail(mailOptions);

      res.json({ msg: 'Subscription successful' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post(
  '/unsubscribe',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Find and update subscriber
      const subscriber = await Newsletter.findOne({ email });

      if (!subscriber) {
        return res.status(404).json({ msg: 'Email not found in our subscribers list' });
      }

      subscriber.subscribed = false;
      subscriber.unsubscribedDate = Date.now();
      await subscriber.save();

      res.json({ msg: 'Unsubscribed successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/newsletter/subscribers
// @desc    Get all subscribers
// @access  Private (Admin only)
router.get('/subscribers', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const subscribers = await Newsletter.find().sort({ subscribedDate: -1 });
    res.json(subscribers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/newsletter/send
// @desc    Send newsletter to all subscribers
// @access  Private (Admin only)
router.post(
  '/send',
  [
    auth,
    [
      check('subject', 'Subject is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ msg: 'Not authorized' });
      }

      const { subject, content } = req.body;

      // Get all active subscribers
      const subscribers = await Newsletter.find({ subscribed: true });

      if (subscribers.length === 0) {
        return res.status(404).json({ msg: 'No active subscribers found' });
      }

      // Send newsletter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Create email template
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://exrevolution.com/assets/images/logo.jpg" alt="Ex Revolution Technology" style="max-width: 200px;">
          </div>
          <h2 style="color: #0066cc; text-align: center;">${subject}</h2>
          <div style="font-size: 16px; line-height: 1.6; color: #444;">
            ${content}
          </div>
          <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">You're receiving this email because you subscribed to the Ex Revolution Technology newsletter. To unsubscribe, <a href="https://exrevolution.com/unsubscribe" style="color: #0066cc; text-decoration: none;">click here</a>.</p>
          </div>
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
      `;

      // Send to all subscribers
      const emailPromises = subscribers.map(subscriber => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: subscriber.email,
          subject: subject,
          html: htmlContent
        };
        return transporter.sendMail(mailOptions);
      });

      await Promise.all(emailPromises);

      res.json({ msg: 'Newsletter sent successfully', count: subscribers.length });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
