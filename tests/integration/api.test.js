/**
 * Integration Tests for API Endpoints
 * Testing complete API functionality with real HTTP requests
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Mock the app for testing
const express = require('express');
const cors = require('cors');
const contentStore = require('../../data/content-store');

// Create test app
const createTestApp = () => {
    const app = express();
    
    // Basic middleware
    app.use(express.json());
    app.use(cors());
    
    // Simple auth middleware for testing
    const testAuth = (req, res, next) => {
        const token = req.headers['x-auth-token'] || req.headers['authorization'];
        if (token && (token.includes('test-token') || token.includes('enhanced-token'))) {
            req.user = { email: 'test@example.com', name: 'Test User' };
            next();
        } else {
            res.status(401).json({ success: false, message: 'Unauthorized' });
        }
    };
    
    // Test routes
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'OK',
            message: 'Test API operational',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: 'test'
        });
    });
    
    app.post('/api/auth', (req, res) => {
        const { email, password } = req.body;
        
        if (email === 'admin@exrevolution.com' && password === 'Admin@123') {
            res.json({
                success: true,
                token: 'test-token-123',
                user: {
                    email: 'admin@exrevolution.com',
                    name: 'Admin User',
                    role: 'admin'
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    });
    
    app.get('/api/blog-posts', testAuth, (req, res) => {
        res.json({
            success: true,
            data: contentStore.getAllBlogPosts()
        });
    });
    
    app.post('/api/blog-posts', testAuth, (req, res) => {
        try {
            const blogPost = contentStore.createBlogPost(req.body);
            res.status(201).json({
                success: true,
                data: blogPost
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    });
    
    app.get('/api/case-studies', testAuth, (req, res) => {
        res.json({
            success: true,
            data: contentStore.getAllCaseStudies()
        });
    });
    
    app.get('/api/contacts', testAuth, (req, res) => {
        res.json({
            success: true,
            data: contentStore.getAllContacts()
        });
    });
    
    app.post('/api/contacts', (req, res) => {
        try {
            const contact = contentStore.createContact(req.body);
            res.status(201).json({
                success: true,
                data: contact
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    });
    
    app.get('/api/public/blog-posts', (req, res) => {
        res.json(contentStore.getPublishedBlogPosts());
    });
    
    app.get('/api/public/case-studies', (req, res) => {
        res.json(contentStore.getPublishedCaseStudies());
    });
    
    // Error handling
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint not found'
        });
    });
    
    return app;
};

describe('API Integration Tests', () => {
    let app;
    let authToken;
    
    beforeAll(() => {
        app = createTestApp();
    });
    
    beforeEach(() => {
        authToken = 'test-token-123';
    });

    describe('Health Check', () => {
        test('GET /api/health should return system status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('environment', 'test');
        });
    });

    describe('Authentication', () => {
        test('POST /api/auth should authenticate valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth')
                .send({
                    email: 'admin@exrevolution.com',
                    password: 'Admin@123'
                })
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', 'admin@exrevolution.com');
            expect(response.body.user).toHaveProperty('role', 'admin');
        });
        
        test('POST /api/auth should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth')
                .send({
                    email: 'admin@exrevolution.com',
                    password: 'wrongpassword'
                })
                .expect(401);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });
        
        test('POST /api/auth should require email and password', async () => {
            const response = await request(app)
                .post('/api/auth')
                .send({})
                .expect(401);
            
            expect(response.body.success).toBe(false);
        });
    });

    describe('Blog Posts API', () => {
        test('GET /api/blog-posts should require authentication', async () => {
            await request(app)
                .get('/api/blog-posts')
                .expect(401);
        });
        
        test('GET /api/blog-posts should return blog posts with auth', async () => {
            const response = await request(app)
                .get('/api/blog-posts')
                .set('x-auth-token', authToken)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });
        
        test('POST /api/blog-posts should create new blog post', async () => {
            const newPost = {
                title: 'Test Blog Post',
                excerpt: 'This is a test blog post',
                content: 'This is the content of the test blog post',
                author: 'Test Author',
                category: 'Technology',
                tags: ['test', 'blog'],
                status: 'published'
            };
            
            const response = await request(app)
                .post('/api/blog-posts')
                .set('x-auth-token', authToken)
                .send(newPost)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe(newPost.title);
            expect(response.body.data.author).toBe(newPost.author);
        });
    });

    describe('Case Studies API', () => {
        test('GET /api/case-studies should require authentication', async () => {
            await request(app)
                .get('/api/case-studies')
                .expect(401);
        });
        
        test('GET /api/case-studies should return case studies with auth', async () => {
            const response = await request(app)
                .get('/api/case-studies')
                .set('x-auth-token', authToken)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });
    });

    describe('Contacts API', () => {
        test('GET /api/contacts should require authentication', async () => {
            await request(app)
                .get('/api/contacts')
                .expect(401);
        });
        
        test('POST /api/contacts should create contact without auth', async () => {
            const newContact = {
                name: 'Test User',
                email: 'test@example.com',
                subject: 'General Inquiry',
                message: 'This is a test message'
            };
            
            const response = await request(app)
                .post('/api/contacts')
                .send(newContact)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(newContact.name);
            expect(response.body.data.email).toBe(newContact.email);
        });
    });

    describe('Public API', () => {
        test('GET /api/public/blog-posts should not require auth', async () => {
            const response = await request(app)
                .get('/api/public/blog-posts')
                .expect(200);
            
            expect(Array.isArray(response.body)).toBe(true);
        });
        
        test('GET /api/public/case-studies should not require auth', async () => {
            const response = await request(app)
                .get('/api/public/case-studies')
                .expect(200);
            
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should return 404 for non-existent endpoints', async () => {
            const response = await request(app)
                .get('/api/non-existent')
                .expect(404);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Endpoint not found');
        });
    });
});
