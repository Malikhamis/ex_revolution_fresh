/**
 * Local Development Server for Admin Panel
 * Simple mock server that doesn't require MongoDB
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// Mock data storage (in-memory)
let mockUsers = [
    {
        id: '1',
        name: 'Admin',
        email: 'admin@exrevolution.com',
        password: 'Admin@123', // Plain text for development
        isAdmin: true
    }
];

let mockNewsletters = [
    {
        _id: '1',
        name: 'Welcome Newsletter',
        subject: 'Welcome to Ex Revolution Technology',
        content: '<h2>Welcome!</h2><p>Thank you for subscribing to our newsletter.</p>',
        scheduledFor: null,
        sent: false,
        createdAt: new Date()
    }
];

let mockSubscribers = [
    {
        _id: '1',
        email: 'test@example.com',
        subscribed: true,
        subscribedDate: new Date()
    },
    {
        _id: '2',
        email: 'demo@example.com',
        subscribed: true,
        subscribedDate: new Date()
    }
];

// Email configuration storage
let emailConfig = {
    fromEmail: 'exrevolution8@gmail.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecurity: 'tls',
    smtpUsername: 'admin@exrevolution.com',
    smtpPassword: '' // Will be set through admin panel
};

// Mock contact requests
let mockContacts = [
    {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Website Development Inquiry',
        message: 'I am interested in developing a new website for my business.',
        status: 'pending',
        createdAt: new Date('2024-01-15'),
        respondedAt: null
    },
    {
        _id: '2',
        name: 'Sarah Smith',
        email: 'sarah@company.com',
        subject: 'Mobile App Development',
        message: 'We need a mobile app for our e-commerce platform.',
        status: 'responded',
        createdAt: new Date('2024-01-10'),
        respondedAt: new Date('2024-01-12')
    }
];

// Mock quote requests
let mockQuotes = [
    {
        _id: '1',
        clientName: 'Tech Startup Inc.',
        email: 'contact@techstartup.com',
        phone: '+1-555-0123',
        service: 'Full Stack Web Development',
        budget: '$10,000 - $25,000',
        timeline: '3-4 months',
        description: 'Need a complete web application with user authentication, payment processing, and admin dashboard.',
        status: 'pending',
        priority: 'high',
        estimatedValue: 20000,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
    },
    {
        _id: '2',
        clientName: 'Local Restaurant',
        email: 'owner@restaurant.com',
        phone: '+1-555-0456',
        service: 'Website Design',
        budget: '$2,000 - $5,000',
        timeline: '1-2 months',
        description: 'Simple restaurant website with menu, location, and online ordering.',
        status: 'approved',
        priority: 'medium',
        estimatedValue: 3500,
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-22')
    }
];

// Mock users
let mockAppUsers = [
    {
        _id: '1',
        name: 'Admin User',
        email: 'admin@exrevolution.com',
        role: 'admin',
        status: 'active',
        lastLogin: new Date(),
        createdAt: new Date('2024-01-01')
    },
    {
        _id: '2',
        name: 'John Customer',
        email: 'john@example.com',
        role: 'user',
        status: 'active',
        lastLogin: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10')
    }
];

// JWT Secret
const JWT_SECRET = 'local_dev_secret';

// Auth middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Routes

// @route   POST /api/auth
// @desc    Authenticate user & get token
app.post('/api/auth', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', { email, password }); // Debug log

        // Find user
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check password (simple string comparison for development)
        if (password !== user.password) {
            console.log('Password mismatch:', { provided: password, expected: user.password });
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log('Login successful for:', email);

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                isAdmin: user.isAdmin
            }
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Auth error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/newsletter/templates
// @desc    Get all newsletter templates
app.get('/api/newsletter/templates', auth, (req, res) => {
    res.json(mockNewsletters);
});

// @route   POST /api/newsletter/template
// @desc    Create newsletter template
app.post('/api/newsletter/template', auth, (req, res) => {
    try {
        const { name, subject, content, scheduledFor } = req.body;

        const newNewsletter = {
            _id: (mockNewsletters.length + 1).toString(),
            name,
            subject,
            content,
            scheduledFor: scheduledFor || null,
            sent: false,
            createdAt: new Date()
        };

        mockNewsletters.push(newNewsletter);
        res.json(newNewsletter);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/newsletter/subscribers
// @desc    Get all subscribers
app.get('/api/newsletter/subscribers', auth, (req, res) => {
    res.json(mockSubscribers);
});

// @route   POST /api/newsletter/send
// @desc    Send newsletter to all subscribers
app.post('/api/newsletter/send', auth, async (req, res) => {
    try {
        const { subject, content } = req.body;

        if (!emailConfig.smtpPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email configuration incomplete. Please set SMTP password in settings.'
            });
        }

        const activeSubscribers = mockSubscribers.filter(s => s.subscribed);

        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: emailConfig.smtpHost,
            port: emailConfig.smtpPort,
            secure: emailConfig.smtpSecurity === 'ssl',
            auth: {
                user: emailConfig.smtpUsername,
                pass: emailConfig.smtpPassword
            }
        });

        let successCount = 0;
        let failCount = 0;

        // Send to all active subscribers
        for (const subscriber of activeSubscribers) {
            try {
                await transporter.sendMail({
                    from: `"Ex Revolution Technology" <${emailConfig.fromEmail}>`,
                    to: subscriber.email,
                    subject: subject,
                    html: content
                });
                successCount++;
                console.log(`Newsletter sent to: ${subscriber.email}`);
            } catch (emailError) {
                console.error(`Failed to send to ${subscriber.email}:`, emailError.message);
                failCount++;
            }
        }

        res.json({
            success: true,
            count: successCount,
            failed: failCount,
            message: `Newsletter sent to ${successCount} subscribers${failCount > 0 ? `, ${failCount} failed` : ''}`
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/settings/email
// @desc    Get email configuration
app.get('/api/settings/email', auth, (req, res) => {
    // Don't send password in response
    const { smtpPassword, ...safeConfig } = emailConfig;
    res.json(safeConfig);
});

// @route   POST /api/settings/email
// @desc    Update email configuration
app.post('/api/settings/email', auth, (req, res) => {
    try {
        const { fromEmail, smtpHost, smtpPort, smtpSecurity, smtpUsername, smtpPassword } = req.body;

        // Update email configuration
        emailConfig = {
            fromEmail: fromEmail || emailConfig.fromEmail,
            smtpHost: smtpHost || emailConfig.smtpHost,
            smtpPort: smtpPort || emailConfig.smtpPort,
            smtpSecurity: smtpSecurity || emailConfig.smtpSecurity,
            smtpUsername: smtpUsername || emailConfig.smtpUsername,
            smtpPassword: smtpPassword || emailConfig.smtpPassword
        };

        console.log('Email configuration updated');
        res.json({ success: true, message: 'Email configuration updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/settings/email/test
// @desc    Test email configuration
app.post('/api/settings/email/test', auth, async (req, res) => {
    try {
        if (!emailConfig.smtpPassword) {
            return res.status(400).json({
                success: false,
                message: 'SMTP password not configured'
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: emailConfig.smtpHost,
            port: emailConfig.smtpPort,
            secure: emailConfig.smtpSecurity === 'ssl',
            auth: {
                user: emailConfig.smtpUsername,
                pass: emailConfig.smtpPassword
            }
        });

        // Send test email
        await transporter.sendMail({
            from: `"Ex Revolution Technology" <${emailConfig.fromEmail}>`,
            to: emailConfig.fromEmail, // Send test email to the configured from email
            subject: 'Test Email - Ex Revolution Admin Panel',
            html: `
                <h2>Email Configuration Test</h2>
                <p>This is a test email to verify your SMTP configuration is working correctly.</p>
                <p><strong>Configuration Details:</strong></p>
                <ul>
                    <li>SMTP Host: ${emailConfig.smtpHost}</li>
                    <li>SMTP Port: ${emailConfig.smtpPort}</li>
                    <li>Security: ${emailConfig.smtpSecurity.toUpperCase()}</li>
                    <li>Username: ${emailConfig.smtpUsername}</li>
                </ul>
                <p>If you received this email, your configuration is working properly!</p>
                <hr>
                <p><small>Ex Revolution Technology Admin Panel</small></p>
            `
        });

        console.log('Test email sent successfully');
        res.json({
            success: true,
            message: 'Test email sent successfully! Check your inbox.'
        });
    } catch (err) {
        console.error('Test email failed:', err.message);
        res.status(400).json({
            success: false,
            message: `Test email failed: ${err.message}`
        });
    }
});

// @route   GET /api/contacts
// @desc    Get all contact requests
app.get('/api/contacts', auth, (req, res) => {
    res.json(mockContacts);
});

// @route   POST /api/contacts
// @desc    Create new contact request
app.post('/api/contacts', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const newContact = {
            _id: (mockContacts.length + 1).toString(),
            name,
            email,
            subject,
            message,
            status: 'pending',
            createdAt: new Date(),
            respondedAt: null
        };

        mockContacts.push(newContact);
        res.json(newContact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact status
app.put('/api/contacts/:id', auth, (req, res) => {
    try {
        const { status } = req.body;
        const contact = mockContacts.find(c => c._id === req.params.id);

        if (!contact) {
            return res.status(404).json({ msg: 'Contact not found' });
        }

        contact.status = status;
        if (status === 'responded') {
            contact.respondedAt = new Date();
        }

        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/quotes
// @desc    Get all quote requests
app.get('/api/quotes', auth, (req, res) => {
    res.json(mockQuotes);
});

// @route   POST /api/quotes
// @desc    Create new quote request
app.post('/api/quotes', (req, res) => {
    try {
        const { clientName, email, phone, service, budget, timeline, description } = req.body;

        const newQuote = {
            _id: (mockQuotes.length + 1).toString(),
            clientName,
            email,
            phone,
            service,
            budget,
            timeline,
            description,
            status: 'pending',
            priority: 'medium',
            estimatedValue: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockQuotes.push(newQuote);
        res.json(newQuote);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/quotes/:id
// @desc    Update quote
app.put('/api/quotes/:id', auth, (req, res) => {
    try {
        const quote = mockQuotes.find(q => q._id === req.params.id);

        if (!quote) {
            return res.status(404).json({ msg: 'Quote not found' });
        }

        Object.assign(quote, req.body);
        quote.updatedAt = new Date();

        res.json(quote);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/users
// @desc    Get all users
app.get('/api/users', auth, (req, res) => {
    res.json(mockAppUsers);
});

// @route   POST /api/users
// @desc    Create new user
app.post('/api/users', auth, (req, res) => {
    try {
        const { name, email, role } = req.body;

        const newUser = {
            _id: (mockAppUsers.length + 1).toString(),
            name,
            email,
            role: role || 'user',
            status: 'active',
            lastLogin: null,
            createdAt: new Date()
        };

        mockAppUsers.push(newUser);
        res.json(newUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
app.put('/api/users/:id', auth, (req, res) => {
    try {
        const user = mockAppUsers.find(u => u._id === req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        Object.assign(user, req.body);
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
app.delete('/api/users/:id', auth, (req, res) => {
    try {
        const userIndex = mockAppUsers.findIndex(u => u._id === req.params.id);

        if (userIndex === -1) {
            return res.status(404).json({ msg: 'User not found' });
        }

        mockAppUsers.splice(userIndex, 1);
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Local development server running',
        timestamp: new Date().toISOString(),
        emailConfigured: !!emailConfig.smtpPassword
    });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces for mobile access

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

app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log('🚀 Local Development Server Started');
    console.log(`📡 Server running on ${HOST}:${PORT}`);
    console.log(`🏠 Local access: http://localhost:${PORT}`);
    console.log(`📱 Mobile access: http://${localIP}:${PORT}`);
    console.log('🔐 Admin Login Credentials:');
    console.log('   Email: admin@exrevolution.com');
    console.log('   Password: Admin@123');
    console.log('');
    console.log('🌐 Test mobile login at:');
    console.log(`   http://${localIP}:3000/admin/login.html`);
    console.log('');
    console.log('💡 This server accepts connections from mobile devices');
});
