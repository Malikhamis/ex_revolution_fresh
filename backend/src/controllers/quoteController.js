/**
 * Quote Controller
 * Handles quote request submissions
 */

const Quote = require('../models/Quote');
const { sendEmail } = require('../utils/emailService');

// @desc    Submit a quote request
// @route   POST /api/quote
// @access  Public
exports.submitQuoteRequest = async (req, res) => {
  // Set CORS headers directly on this route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Received quote request:', req.body);
    const {
      name,
      email,
      phone,
      company,
      serviceType,
      budget,
      timeline,
      projectDetails
    } = req.body;

    // Create new quote request
    const quote = await Quote.create({
      name,
      email,
      phone,
      company,
      serviceType,
      budget,
      timeline,
      projectDetails
    });

    // Send notification email to admin
    await sendEmail({
      to: process.env.EMAIL_FROM,
      subject: `New Quote Request: ${serviceType}`,
      text: `
        New quote request from ${name}

        Email: ${email}
        Phone: ${phone || 'Not provided'}
        Company: ${company || 'Not provided'}

        Service Type: ${serviceType}
        Budget: ${budget || 'Not specified'}
        Timeline: ${timeline || 'Not specified'}

        Project Details:
        ${projectDetails}
      `
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for your quote request - Ex Revolution Technology',
      text: `
        Dear ${name},

        Thank you for requesting a quote from Ex Revolution Technology. We have received your request and will prepare a customized quote for your project as soon as possible.

        Project Summary:
        Service Type: ${serviceType}
        Budget Range: ${budget || 'Not specified'}
        Timeline: ${timeline || 'Not specified'}

        Our team will review your requirements and get back to you within 1-2 business days.

        Best regards,
        Ex Revolution Technology Team
      `
    });

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      data: quote
    });
  } catch (error) {
    console.error('Error submitting quote request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quote request',
      error: error.message
    });
  }
};

// @desc    Get all quote requests
// @route   GET /api/quote
// @access  Private (Admin only)
exports.getQuoteRequests = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote requests',
      error: error.message
    });
  }
};

// @desc    Get a single quote request
// @route   GET /api/quote/:id
// @access  Private (Admin only)
exports.getQuoteRequest = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error fetching quote request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote request',
      error: error.message
    });
  }
};

// @desc    Update quote request status
// @route   PUT /api/quote/:id
// @access  Private (Admin only)
exports.updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quote status',
      error: error.message
    });
  }
};
