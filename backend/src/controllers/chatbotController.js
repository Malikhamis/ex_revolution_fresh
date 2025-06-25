const Lead = require('../models/Lead');
const { sendEmail } = require('../utils/emailService');

/**
 * @desc    Process chatbot messages
 * @route   POST /api/chatbot/message
 * @access  Public
 */
exports.processMessage = async (req, res) => {
  try {
    const { message, userId, context } = req.body;
    
    // Log the incoming message
    console.log('Chatbot message received:', { message, userId, context });
    
    // Simple response logic based on keywords
    // In a production environment, this could be replaced with a more sophisticated NLP solution
    let response = {
      text: "I'm not sure I understand. Would you like to know about our services, get a quote, or speak with someone?",
      options: [
        { text: "Tell me about your services", value: "services" },
        { text: "I'd like a quote", value: "quote" },
        { text: "I want to speak with someone", value: "contact" }
      ]
    };
    
    // Process message based on keywords
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
      response.text = "Hello! How can I help you today?";
    } 
    else if (messageLower.includes('service') || messageLower.includes('offer') || messageLower.includes('provide')) {
      response.text = "We offer a range of services including software development, digital marketing, IT consulting, and branding solutions. Which service are you most interested in?";
      response.options = [
        { text: "Software Development", value: "software" },
        { text: "Digital Marketing", value: "marketing" },
        { text: "IT Consulting", value: "consulting" },
        { text: "Branding Solutions", value: "branding" }
      ];
    }
    else if (messageLower.includes('software') || messageLower.includes('development') || messageLower.includes('app')) {
      response.text = "Our software development services include web applications, mobile apps, custom software solutions, and enterprise systems. Would you like to discuss a specific project?";
      response.options = [
        { text: "Get a quote for my project", value: "quote" },
        { text: "Tell me more about your process", value: "process" }
      ];
    }
    else if (messageLower.includes('marketing') || messageLower.includes('digital marketing') || messageLower.includes('seo')) {
      response.text = "Our digital marketing services include SEO, social media marketing, content marketing, and PPC campaigns. We help businesses increase their online visibility and generate more leads.";
      response.options = [
        { text: "Get a marketing quote", value: "quote" },
        { text: "Tell me about your results", value: "results" }
      ];
    }
    else if (messageLower.includes('consult') || messageLower.includes('consulting') || messageLower.includes('advice')) {
      response.text = "Our IT consulting services help businesses make the right technology decisions. We provide strategic guidance, technology assessments, and digital transformation roadmaps.";
      response.options = [
        { text: "Schedule a consultation", value: "contact" },
        { text: "Learn more about consulting", value: "more" }
      ];
    }
    else if (messageLower.includes('brand') || messageLower.includes('logo') || messageLower.includes('design')) {
      response.text = "Our branding solutions include logo design, brand identity development, style guides, and marketing materials. We help businesses create a cohesive and memorable brand presence.";
      response.options = [
        { text: "See branding examples", value: "examples" },
        { text: "Get a branding quote", value: "quote" }
      ];
    }
    else if (messageLower.includes('quote') || messageLower.includes('cost') || messageLower.includes('price') || messageLower.includes('how much')) {
      response.text = "I'd be happy to help you get a quote. Could you provide some details about your project or which service you're interested in?";
      response.options = [
        { text: "Software Development", value: "software_quote" },
        { text: "Digital Marketing", value: "marketing_quote" },
        { text: "IT Consulting", value: "consulting_quote" },
        { text: "Branding Solutions", value: "branding_quote" }
      ];
      response.requiresLead = true;
    }
    else if (messageLower.includes('contact') || messageLower.includes('speak') || messageLower.includes('call') || messageLower.includes('talk')) {
      response.text = "I'll connect you with one of our representatives. Could you provide your contact information so someone can reach out to you?";
      response.requiresLead = true;
      response.leadType = "contact";
    }
    else if (messageLower.includes('thank')) {
      response.text = "You're welcome! Is there anything else I can help you with?";
      response.options = [
        { text: "No, that's all for now", value: "end" },
        { text: "Yes, I have another question", value: "more" }
      ];
    }
    
    // Return the response
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
};

/**
 * @desc    Store lead information from chatbot
 * @route   POST /api/chatbot/lead
 * @access  Public
 */
exports.storeLead = async (req, res) => {
  try {
    const { name, email, phone, interest, message, source, leadScore, landingPage } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Create new lead in database
    const lead = new Lead({
      name,
      email,
      phone,
      interest,
      message,
      source: source || 'Chatbot',
      leadScore: leadScore || 0,
      landingPage
    });
    
    await lead.save();
    
    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `New Lead from Chatbot: ${name || email}`,
        text: `
          New lead captured from the chatbot:
          
          Name: ${name || 'Not provided'}
          Email: ${email}
          Phone: ${phone || 'Not provided'}
          Interest: ${interest || 'Not specified'}
          Message: ${message || 'Not provided'}
          Source: Chatbot
          Lead Score: ${leadScore || 0}
          Landing Page: ${landingPage || 'Not tracked'}
          Date: ${new Date().toLocaleString()}
        `
      });
    } catch (emailError) {
      console.error('Error sending lead notification email:', emailError);
      // Continue execution even if email fails
    }
    
    res.json({
      success: true,
      message: 'Lead information stored successfully',
      data: {
        id: lead._id,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Error storing chatbot lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store lead information',
      error: error.message
    });
  }
};
