/**
 * Ex Revolution Technology Backend Server
 * Main server file that initializes the Express application
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const contactRoutes = require('./routes/contactRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle OPTIONS preflight requests
app.options('*', cors());

// Add CORS headers to all responses as a fallback
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ex Revolution Technology API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An error occurred on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Email service: ${process.env.EMAIL_SERVICE}`);
      console.log(`Email user: ${process.env.EMAIL_USER}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
