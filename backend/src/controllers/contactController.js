/**
 * Contact Controller
 * Handles contact form submissions
 */

const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/emailService');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  // Set CORS headers directly on this route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Received contact form submission:', req.body);
    const { name, email, phone, subject, message } = req.body;

    // Create new contact entry
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    });

    // Send notification email to admin
    await sendEmail({
      to: process.env.EMAIL_FROM,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        New contact form submission from ${name}

        Email: ${email}
        Phone: ${phone || 'Not provided'}

        Message:
        ${message}
      `
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting Ex Revolution Technology',
      text: `
        Dear ${name},

        Thank you for contacting Ex Revolution Technology. We have received your message and will get back to you as soon as possible.

        Your message:
        ${message}

        Best regards,
        Ex Revolution Technology Team
      `
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private (Admin only)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
};

// @desc    Get a single contact submission
// @route   GET /api/contact/:id
// @access  Private (Admin only)
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: error.message
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private (Admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: error.message
    });
  }
};
