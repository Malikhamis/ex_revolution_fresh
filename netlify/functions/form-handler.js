// Netlify Form Handler - Sends form submissions to Gmail
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only process POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const formName = data['form-name'];
    
    // Configure email transporter (you'll need to set up SMTP)
    // For Gmail, you'll need to use App Passwords
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'exrevolution8@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD // Set this in Netlify environment variables
      }
    });

    let subject = '';
    let body = '';

    // Customize email content based on form type
    switch (formName) {
      case 'contact':
        subject = 'New Contact Form Submission - Ex Revolution Technology';
        body = `
New contact form submission:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Service: ${data.subject}
Message: ${data.message}

Submitted on: ${new Date().toLocaleString()}
        `;
        break;
        
      case 'quote-request':
        subject = 'New Quote Request - Ex Revolution Technology';
        body = `
New quote request:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Company: ${data.company}
Services: ${data['services-selected']}
Budget: ${data.budget}
Timeline: ${data.timeline}
Description: ${data.description}

Submitted on: ${new Date().toLocaleString()}
        `;
        break;
        
      case 'newsletter-subscription':
        subject = 'New Newsletter Subscription - Ex Revolution Technology';
        body = `
New newsletter subscription:

Email: ${data.email}

Subscribed on: ${new Date().toLocaleString()}
        `;
        break;
        
      case 'guide-download':
        subject = 'New Guide Download Request - Ex Revolution Technology';
        body = `
New guide download request:

Email: ${data.email}

Requested on: ${new Date().toLocaleString()}
        `;
        break;
        
      case 'lead-capture':
        subject = 'New Lead Capture - Ex Revolution Technology';
        body = `
New lead captured:

Email: ${data.email}

Captured on: ${new Date().toLocaleString()}
        `;
        break;
        
      default:
        subject = 'New Form Submission - Ex Revolution Technology';
        body = `
New form submission:

Form: ${formName}
Data: ${JSON.stringify(data, null, 2)}

Submitted on: ${new Date().toLocaleString()}
        `;
    }

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER || 'exrevolution8@gmail.com',
      to: 'exrevolution8@gmail.com',
      subject: subject,
      text: body
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Form submitted successfully and email sent!' 
      })
    };

  } catch (error) {
    console.error('Form submission error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error processing form submission',
        error: error.message 
      })
    };
  }
};
