const express = require('express');
const cors = require('cors');
const app = express();

// Mock database
const subscribers = [];

// Middleware
app.use(express.json());

// Configure CORS
const corsOptions = {
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
};
app.use(cors(corsOptions));

// Routes
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ msg: 'Please include a valid email' });
  }
  
  // Check if email already exists
  const existingSubscriber = subscribers.find(sub => sub.email === email);
  
  if (existingSubscriber) {
    if (existingSubscriber.subscribed) {
      return res.status(400).json({ msg: 'Email already subscribed' });
    } else {
      // Resubscribe
      existingSubscriber.subscribed = true;
      existingSubscriber.subscribedDate = new Date();
      existingSubscriber.unsubscribedDate = null;
      
      return res.json({ msg: 'Resubscribed successfully' });
    }
  }
  
  // Add new subscriber
  subscribers.push({
    email,
    subscribed: true,
    subscribedDate: new Date(),
    unsubscribedDate: null
  });
  
  console.log(`New subscriber: ${email}`);
  console.log(`Total subscribers: ${subscribers.length}`);
  
  res.json({ msg: 'Subscription successful' });
});

app.post('/api/newsletter/unsubscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ msg: 'Please include a valid email' });
  }
  
  // Find subscriber
  const subscriberIndex = subscribers.findIndex(sub => sub.email === email);
  
  if (subscriberIndex === -1) {
    return res.status(404).json({ msg: 'Email not found in our subscribers list' });
  }
  
  // Update subscriber
  subscribers[subscriberIndex].subscribed = false;
  subscribers[subscriberIndex].unsubscribedDate = new Date();
  
  console.log(`Unsubscribed: ${email}`);
  console.log(`Active subscribers: ${subscribers.filter(sub => sub.subscribed).length}`);
  
  res.json({ msg: 'Unsubscribed successfully' });
});

app.get('/api/newsletter/subscribers', (req, res) => {
  res.json(subscribers);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Mock server running on port ${PORT}`));
