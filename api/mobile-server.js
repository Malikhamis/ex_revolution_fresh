const express = require('express');
const cors = require('cors');
const { networkInterfaces } = require('os');

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));

// Configure CORS for mobile access
const corsOptions = {
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
};
app.use(cors(corsOptions));

// Helper function to get local IP address
function getLocalIP() {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'mobile-development',
    emailConfigured: false,
    message: 'Mobile API Server Running'
  });
});

// Mock authentication endpoint
app.post('/api/auth', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Mobile login attempt:', { email, password });
  
  // Mock authentication - accept admin credentials
  if (email === 'admin@exrevolution.com' && (password === 'Admin@123' || password === 'admin123')) {
    const token = 'mock-jwt-token-for-mobile-testing';
    console.log('Mobile login successful for:', email);
    
    res.json({
      token,
      user: {
        id: 1,
        email: email,
        name: 'Admin User'
      },
      message: 'Login successful'
    });
  } else {
    console.log('Mobile login failed for:', email);
    res.status(400).json({
      msg: 'Invalid credentials'
    });
  }
});

// Mock newsletter endpoints
app.get('/api/newsletter/subscribers', (req, res) => {
  res.json([
    { id: 1, email: 'user1@example.com', subscribed: true },
    { id: 2, email: 'user2@example.com', subscribed: true }
  ]);
});

app.get('/api/newsletter/templates', (req, res) => {
  res.json([
    { id: 1, name: 'Welcome Newsletter', subject: 'Welcome!', sent: false },
    { id: 2, name: 'Monthly Update', subject: 'Monthly News', sent: true }
  ]);
});

// Mock contacts endpoint
app.get('/api/contacts', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com', message: 'Test message', date: new Date() }
  ]);
});

// Mock quotes endpoint
app.get('/api/quotes', (req, res) => {
  res.json([
    { id: 1, name: 'Jane Smith', email: 'jane@example.com', service: 'Web Development', budget: '$5000', date: new Date() }
  ]);
});

// Mock users endpoint
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Admin User', email: 'admin@exrevolution.com', role: 'admin' }
  ]);
});

// Mock settings endpoint
app.get('/api/settings', (req, res) => {
  res.json({
    siteName: 'Ex Revolution Technology',
    email: 'exrevolution8@gmail.com',
    phone: '+255 123 456 789'
  });
});

// Catch all other API routes
app.get('/api/*', (req, res) => {
  res.json({
    message: 'Mobile API endpoint',
    endpoint: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces for mobile access

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('🚀 Mobile API Server Started');
  console.log(`📡 Server running on ${HOST}:${PORT}`);
  console.log(`🏠 Local access: http://localhost:${PORT}`);
  console.log(`📱 Mobile access: http://${localIP}:${PORT}`);
  console.log('🔐 Admin Login Credentials:');
  console.log('   Email: admin@exrevolution.com');
  console.log('   Password: Admin@123 or admin123');
  console.log('');
  console.log('🌐 Test mobile login at:');
  console.log(`   http://${localIP}:3000/admin/login.html`);
  console.log('');
  console.log('💡 This server accepts connections from mobile devices');
});
