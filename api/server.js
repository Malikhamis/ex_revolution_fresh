const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Configure CORS
const corsOptions = {
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
};
app.use(cors(corsOptions));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
  });
});

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/quote', require('./routes/quote'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/guides', require('./routes/guides'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('../'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server started on ${HOST}:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://${getLocalIP()}:${PORT}`);
});

// Helper function to get local IP address
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return 'localhost';
}

// Schedule newsletter sending
const cron = require('node-cron');
const NewsletterTemplate = require('./models/NewsletterTemplate');
const Newsletter = require('./models/Newsletter');
const nodemailer = require('nodemailer');

// Run every hour to check for scheduled newsletters
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Checking for scheduled newsletters...');

    const now = new Date();

    // Find newsletters scheduled to be sent
    const scheduledNewsletters = await NewsletterTemplate.find({
      scheduledFor: { $lte: now },
      sent: false
    });

    if (scheduledNewsletters.length === 0) {
      return;
    }

    console.log(`Found ${scheduledNewsletters.length} newsletters to send`);

    // Get all active subscribers
    const subscribers = await Newsletter.find({ subscribed: true });

    if (subscribers.length === 0) {
      console.log('No active subscribers found');
      return;
    }

    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Send each newsletter
    for (const newsletter of scheduledNewsletters) {
      console.log(`Sending newsletter: ${newsletter.name}`);

      // Create email template
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://exrevolution.com/assets/images/logo.jpg" alt="Ex Revolution Technology" style="max-width: 200px;">
          </div>
          <h2 style="color: #0066cc; text-align: center;">${newsletter.subject}</h2>
          <div style="font-size: 16px; line-height: 1.6; color: #444;">
            ${newsletter.content}
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
          subject: newsletter.subject,
          html: htmlContent
        };
        return transporter.sendMail(mailOptions);
      });

      await Promise.all(emailPromises);

      // Update newsletter as sent
      newsletter.sent = true;
      newsletter.sentAt = new Date();
      newsletter.stats.totalSent = subscribers.length;
      await newsletter.save();

      console.log(`Newsletter "${newsletter.name}" sent to ${subscribers.length} subscribers`);
    }
  } catch (err) {
    console.error('Error sending scheduled newsletters:', err);
  }
});
