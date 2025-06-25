/**
 * Guide Routes
 * Handles all guide-related API endpoints
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Import models
let Subscriber;
try {
    Subscriber = require('../models/Subscriber');
} catch (err) {
    console.error('Error importing Subscriber model:', err);
}

// Import config
let emailConfig;
try {
    emailConfig = require('../config/email');
} catch (err) {
    console.error('Error importing email config:', err);
    // Fallback config
    emailConfig = {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER || 'exrevolution8@gmail.com',
        pass: process.env.EMAIL_PASS || '',
        from: process.env.EMAIL_FROM || 'Ex Revolution Technology <exrevolution8@gmail.com>'
    };
}

/**
 * @route   POST /api/guides/download
 * @desc    Download a guide and subscribe to newsletter
 * @access  Public
 */
router.post('/download', [
    check('email', 'Please include a valid email').isEmail(),
    check('guide', 'Guide type is required').not().isEmpty()
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, guide } = req.body;

    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            // Check if subscriber already exists
            let subscriber = await Subscriber.findOne({ email });

            if (!subscriber) {
                // Create new subscriber
                subscriber = new Subscriber({
                    email,
                    subscribed: true,
                    source: 'guide_download',
                    interests: ['digital_marketing']
                });

                await subscriber.save();
            } else {
                // Update existing subscriber
                subscriber.subscribed = true;
                subscriber.interests = [...new Set([...subscriber.interests, 'digital_marketing'])];
                subscriber.lastUpdated = Date.now();
                
                await subscriber.save();
            }

            // Add download to subscriber's history
            await Subscriber.findOneAndUpdate(
                { email },
                { 
                    $push: { 
                        downloads: {
                            guide,
                            downloadedAt: Date.now()
                        }
                    }
                }
            );
        }

        // Send email with guide
        await sendGuideEmail(email, guide);

        return res.json({
            success: true,
            message: 'Guide download request processed successfully'
        });
    } catch (err) {
        console.error('Guide download error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error processing guide download'
        });
    }
});

/**
 * Send guide download email
 * @param {string} email - Recipient email
 * @param {string} guideType - Type of guide
 */
async function sendGuideEmail(email, guideType) {
    // Configure email transporter
    const transporter = nodemailer.createTransport({
        service: emailConfig.service,
        auth: {
            user: emailConfig.user,
            pass: emailConfig.pass
        }
    });

    // Determine guide details based on type
    let guideDetails = {
        title: 'Digital Marketing Guide',
        filename: 'digital-marketing-guide.pdf',
        subject: 'Your Free Digital Marketing Guide from Ex Revolution Technology',
        text: 'Thank you for requesting our Digital Marketing Guide. Please find it attached to this email.'
    };

    // Customize based on guide type
    if (guideType === 'seo') {
        guideDetails = {
            title: 'SEO Guide',
            filename: 'seo-guide.pdf',
            subject: 'Your Free SEO Guide from Ex Revolution Technology',
            text: 'Thank you for requesting our SEO Guide. Please find it attached to this email.'
        };
    }

    // Prepare email content
    const mailOptions = {
        from: emailConfig.from,
        to: email,
        subject: guideDetails.subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #0066cc; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Your Free Guide is Here!</h1>
                </div>
                <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                    <p>Hello,</p>
                    <p>Thank you for requesting our ${guideDetails.title}. You can download it using the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://exrevolution.com/assets/guides/${guideDetails.filename}" 
                           style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                           Download Your Guide
                        </a>
                    </div>
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p><a href="https://exrevolution.com/assets/guides/${guideDetails.filename}">https://exrevolution.com/assets/guides/${guideDetails.filename}</a></p>
                    <p>We hope you find this guide valuable for your business. If you have any questions or need assistance, feel free to reply to this email or contact us at <a href="mailto:info@exrevolution.com">info@exrevolution.com</a>.</p>
                    <p>Best regards,<br>The Ex Revolution Technology Team</p>
                </div>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                    <p>© 2024 Ex Revolution Technology. All rights reserved.</p>
                    <p>
                        <a href="https://exrevolution.com/privacy-policy.html" style="color: #0066cc; text-decoration: none;">Privacy Policy</a> | 
                        <a href="https://exrevolution.com/terms-of-service.html" style="color: #0066cc; text-decoration: none;">Terms of Service</a> | 
                        <a href="https://exrevolution.com/unsubscribe.html?email=${email}" style="color: #0066cc; text-decoration: none;">Unsubscribe</a>
                    </p>
                </div>
            </div>
        `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
}

module.exports = router;
