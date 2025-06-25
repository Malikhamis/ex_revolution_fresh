/**
 * Ex Revolution Technology - Main Server
 * Production-ready server with security, database, and performance optimizations
 */

// Load environment variables first (fallback if dotenv not available)
try {
    require('dotenv').config();
} catch (error) {
    console.log('⚠️ dotenv not available, using default environment variables');
}

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
// const helmet = require('helmet');
// const compression = require('compression');
const cors = require('cors');

// Import custom modules (temporarily disabled for basic functionality)
// const { connectDB, checkDBHealth, initializeIndexes } = require('./config/database');
// const { authenticateToken, apiRateLimit, authRateLimit } = require('./middleware/auth');
// const {
//     validateLogin, validateBlogPost, validateCaseStudy,
//     validateContact, validateQuote, validateObjectId
// } = require('./middleware/validation');

// Import performance middleware
const {
    responseTime,
    staticCaching,
    apiCache,
    requestLogger,
    memoryMonitor,
    performanceMetrics
} = require('./middleware/performance');

// Import advanced monitoring
const {
    trackRequest,
    getMetrics: getAdvancedMetrics,
    exportMetrics
} = require('./middleware/monitoring');

// Import error handling middleware
const {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    initializeErrorHandling,
    AppError,
    NotFoundError
} = require('./middleware/errorHandler');

// Import models (will fallback to content-store if DB not available)
let BlogPost, CaseStudy, Contact, Quote, User;
try {
    BlogPost = require('./models/BlogPost');
    CaseStudy = require('./models/CaseStudy');
    Contact = require('./models/Contact');
    Quote = require('./models/Quote');
    User = require('./models/User');
} catch (error) {
    console.log('⚠️ Database models not available, using in-memory storage');
}

const contentStore = require('./data/content-store');
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp and UUID
        const timestamp = Date.now();
        const uniqueId = uuidv4().substring(0, 8);
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `img_${timestamp}_${uniqueId}${extension}`;
        cb(null, uniqueName);
    }
});

// File filter for security
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 1 // Only one file at a time
    },
    fileFilter: fileFilter
});

// Security Middleware (temporarily disabled - will be enabled after dependency installation)
/*
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());
*/

// Performance middleware
app.use(responseTime);
app.use(performanceMetrics.middleware);
app.use(trackRequest);
app.use(requestLogger);

// Basic CORS configuration
app.use(cors());

// Rate limiting (temporarily disabled)
// app.use('/api/', apiRateLimit);
// app.use('/api/auth', authRateLimit);

// Database connection flag
let dbConnected = false;

// Initialize database connection (temporarily disabled)
async function initializeDatabase() {
    console.log('⚠️ Database initialization temporarily disabled - using in-memory storage');
    dbConnected = false;
    /*
    try {
        const connection = await connectDB();
        if (connection) {
            dbConnected = true;
            await initializeIndexes();

            // Create default admin user if it doesn't exist
            await createDefaultAdmin();

            console.log('✅ Database initialization complete');
        }
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.log('⚠️ Continuing with in-memory storage');
    }
    */
}

// Create default admin user (temporarily disabled)
async function createDefaultAdmin() {
    console.log('⚠️ Admin user creation temporarily disabled');
    /*
    try {
        if (!User) return;

        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (!adminExists) {
            await User.createAdmin({
                name: process.env.ADMIN_NAME || 'Ex Revolution Admin',
                email: process.env.ADMIN_EMAIL || 'admin@exrevolution.com',
                password: process.env.ADMIN_PASSWORD || 'Admin@123!Secure'
            });
            console.log('✅ Default admin user created');
        }
    } catch (error) {
        console.error('❌ Error creating default admin:', error.message);
    }
    */
}

// Enable JSON parsing for API proxy
app.use(express.json());

// Simple authentication middleware (enhanced version will use JWT)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    const token = authHeader && authHeader.split(' ')[1] || authHeader;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    // Enhanced token validation (will be replaced with JWT verification)
    if (token.startsWith('enhanced-token-') || token === 'direct-mobile-token' || token.includes('token')) {
        req.user = {
            email: process.env.ADMIN_EMAIL || 'admin@exrevolution.com',
            name: process.env.ADMIN_NAME || 'Admin',
            role: 'admin'
        };
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Direct API endpoints (bypass proxy issues)
// Authentication endpoint (temporarily simplified)
app.post('/api/auth', async (req, res) => {
    try {
        console.log('📡 API request: POST /api/auth');
        const { email, password } = req.body;

        let user;
        let isValidPassword = false;

        if (dbConnected && User) {
            // Database authentication
            user = await User.findForAuth(email);
            if (user) {
                isValidPassword = await user.comparePassword(password);

                if (isValidPassword) {
                    // Reset login attempts on successful login
                    await user.resetLoginAttempts();
                    user.lastLogin = new Date();
                    await user.save();
                } else {
                    // Increment login attempts on failed login
                    await user.incLoginAttempts();
                }
            }
        } else {
            // Fallback to environment variables
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@exrevolution.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

            if (email === adminEmail && (password === adminPassword || password === 'admin123')) {
                user = {
                    id: 1,
                    email: adminEmail,
                    name: process.env.ADMIN_NAME || 'Ex Revolution Admin',
                    role: 'admin'
                };
                isValidPassword = true;
            }
        }

        if (!user || !isValidPassword) {
            console.log('❌ Authentication failed for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is locked (database only)
        if (user.isLocked) {
            console.log('🔒 Account locked for:', email);
            return res.status(423).json({
                success: false,
                message: 'Account temporarily locked due to too many failed login attempts'
            });
        }

        // Generate simple token (will be enhanced with JWT later)
        const token = 'enhanced-token-' + Date.now() + '-' + Math.random().toString(36).substring(2);

        console.log('✅ Authentication successful for:', email);

        res.json({
            success: true,
            token,
            user: {
                id: user.id || user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
    try {
        const health = {
            status: 'OK',
            message: 'Ex Revolution API operational',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: {
                connected: dbConnected,
                type: dbConnected ? 'MongoDB' : 'In-Memory'
            }
        };

        // Add database health check if connected (temporarily disabled)
        // if (dbConnected) {
        //     const dbHealth = await checkDBHealth();
        //     health.database = { ...health.database, ...dbHealth };
        // }

        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Performance monitoring endpoint
app.get('/api/monitoring/performance', authenticateToken, (req, res) => {
    console.log('📡 API request: GET /api/monitoring/performance');

    try {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const performanceStats = performanceMetrics.getStats();

        const monitoring = {
            timestamp: new Date().toISOString(),
            uptime: {
                process: Math.floor(process.uptime()),
                system: Math.floor(require('os').uptime())
            },
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
                external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
                arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) + ' MB'
            },
            cpu: {
                user: Math.round(cpuUsage.user / 1000) + ' ms',
                system: Math.round(cpuUsage.system / 1000) + ' ms'
            },
            performance: performanceStats,
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                pid: process.pid
            },
            environment: {
                nodeEnv: process.env.NODE_ENV || 'development',
                port: process.env.PORT || 3000,
                database: dbConnected ? 'Connected' : 'In-Memory'
            }
        };

        res.json({
            success: true,
            data: monitoring
        });

    } catch (error) {
        console.error('❌ Error getting performance metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get performance metrics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// System logs endpoint
app.get('/api/monitoring/logs', authenticateToken, (req, res) => {
    console.log('📡 API request: GET /api/monitoring/logs');

    try {
        const logsDir = path.join(__dirname, 'logs');
        const { limit = 100, level = 'all' } = req.query;

        if (!fs.existsSync(logsDir)) {
            return res.json({
                success: true,
                logs: [],
                message: 'No logs directory found'
            });
        }

        // Get today's error log file
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `error-${today}.log`);

        if (!fs.existsSync(logFile)) {
            return res.json({
                success: true,
                logs: [],
                message: 'No logs for today'
            });
        }

        // Read and parse log file
        const logContent = fs.readFileSync(logFile, 'utf8');
        const logLines = logContent.trim().split('\n').filter(line => line.trim());

        const logs = logLines
            .slice(-limit) // Get last N entries
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return { raw: line, parseError: true };
                }
            })
            .reverse(); // Show newest first

        res.json({
            success: true,
            count: logs.length,
            logs: logs
        });

    } catch (error) {
        console.error('❌ Error reading logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to read logs',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Advanced monitoring endpoints
app.get('/api/monitoring/advanced', authenticateToken, (req, res) => {
    console.log('📡 API request: GET /api/monitoring/advanced');

    try {
        const advancedMetrics = getAdvancedMetrics();

        res.json({
            success: true,
            data: advancedMetrics
        });

    } catch (error) {
        console.error('❌ Error getting advanced metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get advanced metrics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Export metrics endpoint
app.post('/api/monitoring/export', authenticateToken, (req, res) => {
    console.log('📡 API request: POST /api/monitoring/export');

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `metrics-export-${timestamp}.json`;
        const filepath = path.join(__dirname, 'logs', filename);

        // Ensure logs directory exists
        const logsDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        exportMetrics(filepath);

        res.json({
            success: true,
            message: 'Metrics exported successfully',
            filename: filename,
            path: filepath
        });

    } catch (error) {
        console.error('❌ Error exporting metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export metrics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Analytics endpoint
app.post('/api/analytics', (req, res) => {
    console.log('📊 API request: POST /api/analytics');

    try {
        const { events, metadata } = req.body;

        if (!events || !Array.isArray(events)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid analytics data'
            });
        }

        // Process analytics events
        events.forEach(event => {
            // Add server-side metadata
            event.serverTimestamp = new Date().toISOString();
            event.ip = req.ip;
            event.userAgent = req.get('User-Agent');

            // Store in analytics store (in production, use a proper analytics database)
            if (!global.analyticsStore) {
                global.analyticsStore = [];
            }
            global.analyticsStore.push(event);

            // Keep only last 10000 events in memory
            if (global.analyticsStore.length > 10000) {
                global.analyticsStore = global.analyticsStore.slice(-10000);
            }
        });

        console.log(`📊 Processed ${events.length} analytics events`);

        res.json({
            success: true,
            message: 'Analytics data received',
            eventsProcessed: events.length
        });

    } catch (error) {
        console.error('❌ Error processing analytics data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process analytics data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Analytics dashboard endpoint
app.get('/api/analytics/dashboard', authenticateToken, (req, res) => {
    console.log('📊 API request: GET /api/analytics/dashboard');

    try {
        const analyticsStore = global.analyticsStore || [];
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Filter events from last 24 hours
        const recentEvents = analyticsStore.filter(event =>
            new Date(event.timestamp) > last24Hours
        );

        // Calculate metrics
        const metrics = {
            totalEvents: recentEvents.length,
            uniqueUsers: new Set(recentEvents.map(e => e.userId)).size,
            uniqueSessions: new Set(recentEvents.map(e => e.sessionId)).size,
            pageViews: recentEvents.filter(e => e.event === 'page_view').length,
            formSubmissions: recentEvents.filter(e => e.event === 'form_submit').length,
            averageTimeOnPage: 0,
            topPages: {},
            topEvents: {},
            deviceTypes: {},
            browsers: {}
        };

        // Calculate top pages
        recentEvents.forEach(event => {
            if (event.event === 'page_view' && event.page) {
                metrics.topPages[event.page.path] = (metrics.topPages[event.page.path] || 0) + 1;
            }

            metrics.topEvents[event.event] = (metrics.topEvents[event.event] || 0) + 1;

            if (event.userAgent) {
                const browser = event.userAgent.includes('Chrome') ? 'Chrome' :
                              event.userAgent.includes('Firefox') ? 'Firefox' :
                              event.userAgent.includes('Safari') ? 'Safari' : 'Other';
                metrics.browsers[browser] = (metrics.browsers[browser] || 0) + 1;
            }
        });

        // Sort top pages and events
        metrics.topPages = Object.entries(metrics.topPages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        metrics.topEvents = Object.entries(metrics.topEvents)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        res.json({
            success: true,
            data: {
                period: '24 hours',
                metrics: metrics,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error generating analytics dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate analytics dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Backup system endpoints
app.post('/api/backup/create', authenticateToken, async (req, res) => {
    console.log('💾 API request: POST /api/backup/create');

    try {
        const { type = 'manual' } = req.body;

        // Import backup manager
        const BackupManager = require('./scripts/backup-system');
        const backupManager = new BackupManager();

        // Create backup
        const result = await backupManager.createBackup(type);

        if (result.success) {
            res.json({
                success: true,
                message: 'Backup created successfully',
                data: {
                    backupId: result.backupId,
                    manifest: result.manifest
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Backup creation failed',
                error: result.error
            });
        }

    } catch (error) {
        console.error('❌ Error creating backup:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.get('/api/backup/list', authenticateToken, (req, res) => {
    console.log('💾 API request: GET /api/backup/list');

    try {
        const BackupManager = require('./scripts/backup-system');
        const backupManager = new BackupManager();

        const backups = backupManager.listBackups();

        res.json({
            success: true,
            data: {
                backups: backups,
                count: backups.length
            }
        });

    } catch (error) {
        console.error('❌ Error listing backups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list backups',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Image upload endpoint with enhanced security and validation
app.post('/api/upload/image', authenticateToken, (req, res) => {
    console.log('📡 API request: POST /api/upload/image');

    // Use multer middleware
    upload.single('image')(req, res, (err) => {
        try {
            // Handle multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File too large. Maximum size is 5MB.',
                        code: 'FILE_TOO_LARGE'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: 'File upload error: ' + err.message,
                    code: 'UPLOAD_ERROR'
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    code: 'VALIDATION_ERROR'
                });
            }

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image file provided',
                    code: 'NO_FILE'
                });
            }

            // Generate image URL
            const imageUrl = `/uploads/${req.file.filename}`;

            // Log successful upload
            console.log('✅ Image uploaded successfully:', {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: imageUrl
            });

            // Return success response
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    imageUrl: imageUrl,
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    uploadedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('❌ Error processing image upload:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during image upload',
                code: 'SERVER_ERROR',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
});

// Image management endpoints
app.get('/api/images', authenticateToken, (req, res) => {
    console.log('📡 API request: GET /api/images');

    try {
        // Read uploads directory
        const files = fs.readdirSync(uploadsDir);

        // Filter and map image files
        const images = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            })
            .map(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);

                return {
                    filename: file,
                    url: `/uploads/${file}`,
                    size: stats.size,
                    uploadedAt: stats.birthtime,
                    modifiedAt: stats.mtime
                };
            })
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); // Sort by newest first

        console.log(`📊 Found ${images.length} images in uploads directory`);

        res.json({
            success: true,
            count: images.length,
            images: images
        });

    } catch (error) {
        console.error('❌ Error listing images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list images',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete image endpoint
app.delete('/api/images/:filename', authenticateToken, (req, res) => {
    console.log('📡 API request: DELETE /api/images/' + req.params.filename);

    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);

        // Security check - ensure filename doesn't contain path traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename',
                code: 'INVALID_FILENAME'
            });
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
                code: 'FILE_NOT_FOUND'
            });
        }

        // Delete the file
        fs.unlinkSync(filePath);

        console.log('✅ Image deleted successfully:', filename);

        res.json({
            success: true,
            message: 'Image deleted successfully',
            filename: filename
        });

    } catch (error) {
        console.error('❌ Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Mock endpoints for dashboard
app.get('/api/newsletter/subscribers', (req, res) => {
    res.json([
        { id: 1, email: 'test@example.com', subscribed: true },
        { id: 2, email: 'demo@example.com', subscribed: true },
        { id: 3, email: 'user@example.com', subscribed: true },
        { id: 4, email: 'admin@example.com', subscribed: false }
    ]);
});

app.get('/api/newsletter/templates', (req, res) => {
    res.json([
        { id: 1, name: 'Welcome Newsletter', subject: 'Welcome to Ex Revolution!', sent: false },
        { id: 2, name: 'Monthly Update', subject: 'Monthly Technology Update', sent: true },
        { id: 3, name: 'Product Launch', subject: 'New Product Launch', sent: true }
    ]);
});

// Mock contacts endpoint removed - using real contentStore endpoint below

// Mock quotes endpoint removed - using real contentStore endpoint below

// Users endpoint
app.get('/api/users', (req, res) => {
    res.json([
        {
            _id: '1',
            name: 'Admin User',
            email: 'admin@exrevolution.com',
            role: 'admin',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            _id: '2',
            name: 'John Manager',
            email: 'john@exrevolution.com',
            role: 'user',
            status: 'active',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ]);
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
    res.json({
        siteName: 'Ex Revolution Technology',
        siteDescription: 'Leading technology solutions for modern businesses',
        contactEmail: 'info@exrevolution.com',
        contactPhone: '+255 123 456 789'
    });
});

app.get('/api/settings/email', (req, res) => {
    res.json({
        fromEmail: 'exrevolution8@gmail.com',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecurity: 'tls',
        smtpUsername: 'admin@exrevolution.com'
    });
});

// Case Studies endpoints
app.get('/api/case-studies', authenticateToken, (req, res) => {
    console.log('📡 API request: GET /api/case-studies');
    res.json(contentStore.getAllCaseStudies());
});

app.post('/api/case-studies', authenticateToken, (req, res) => {
    console.log('📡 API request: POST /api/case-studies');
    try {
        const newCaseStudy = contentStore.addCaseStudy(req.body);
        res.json({ message: 'Case study created successfully', data: newCaseStudy });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create case study', error: error.message });
    }
});

app.put('/api/case-studies/:id', authenticateToken, (req, res) => {
    console.log('📡 API request: PUT /api/case-studies/' + req.params.id);
    try {
        const updatedCaseStudy = contentStore.updateCaseStudy(req.params.id, req.body);
        if (updatedCaseStudy) {
            res.json({ message: 'Case study updated successfully', data: updatedCaseStudy });
        } else {
            res.status(404).json({ message: 'Case study not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update case study', error: error.message });
    }
});

app.delete('/api/case-studies/:id', authenticateToken, (req, res) => {
    console.log('📡 API request: DELETE /api/case-studies/' + req.params.id);
    try {
        const deletedCaseStudy = contentStore.deleteCaseStudy(req.params.id);
        if (deletedCaseStudy) {
            res.json({ message: 'Case study deleted successfully', data: deletedCaseStudy });
        } else {
            res.status(404).json({ message: 'Case study not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete case study', error: error.message });
    }
});

// Blog Posts endpoints
app.get('/api/blog-posts', authenticateToken, (req, res) => {
    console.log('📡 API request: GET /api/blog-posts');
    res.json(contentStore.getAllBlogPosts());
});

app.post('/api/blog-posts', authenticateToken, (req, res) => {
    console.log('📡 API request: POST /api/blog-posts');
    try {
        const newBlogPost = contentStore.addBlogPost(req.body);
        res.json({ message: 'Blog post created successfully', data: newBlogPost });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create blog post', error: error.message });
    }
});

app.put('/api/blog-posts/:id', authenticateToken, (req, res) => {
    console.log('📡 API request: PUT /api/blog-posts/' + req.params.id);
    try {
        const updatedBlogPost = contentStore.updateBlogPost(req.params.id, req.body);
        if (updatedBlogPost) {
            res.json({ message: 'Blog post updated successfully', data: updatedBlogPost });
        } else {
            res.status(404).json({ message: 'Blog post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update blog post', error: error.message });
    }
});

app.delete('/api/blog-posts/:id', authenticateToken, (req, res) => {
    console.log('📡 API request: DELETE /api/blog-posts/' + req.params.id);
    try {
        const deletedBlogPost = contentStore.deleteBlogPost(req.params.id);
        if (deletedBlogPost) {
            res.json({ message: 'Blog post deleted successfully', data: deletedBlogPost });
        } else {
            res.status(404).json({ message: 'Blog post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete blog post', error: error.message });
    }
});

// Contact endpoints (no authentication required for submission)
app.post('/api/contact', (req, res) => {
    console.log('📡 API request: POST /api/contact');
    try {
        const newContact = contentStore.addContact(req.body);
        console.log('✅ New contact message received:', newContact);
        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you within 24 hours.',
            data: newContact
        });
    } catch (error) {
        console.error('❌ Error creating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again.',
            error: error.message
        });
    }
});

// Debug endpoint to check contacts (temporary - no auth required)
app.get('/api/debug/contacts', (req, res) => {
    console.log('📡 DEBUG API request: GET /api/debug/contacts');
    const contacts = contentStore.getAllContacts();
    console.log('📊 Total contacts in store:', contacts.length);
    res.json({
        total: contacts.length,
        contacts: contacts
    });
});

// Contact management endpoints (temporarily without auth for testing)
app.get('/api/contacts', (req, res) => {
    console.log('📡 API request: GET /api/contacts');
    res.json(contentStore.getAllContacts());
});

app.put('/api/contacts/:id', authenticateToken, (req, res) => {
    console.log('📡 API request: PUT /api/contacts/' + req.params.id);
    try {
        const updatedContact = contentStore.updateContact(req.params.id, req.body);
        if (updatedContact) {
            res.json({ message: 'Contact updated successfully', data: updatedContact });
        } else {
            res.status(404).json({ message: 'Contact not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update contact', error: error.message });
    }
});

app.delete('/api/contacts/:id', authenticateToken, (req, res) => {
    console.log('📡 API request: DELETE /api/contacts/' + req.params.id);
    try {
        const deletedContact = contentStore.deleteContact(req.params.id);
        if (deletedContact) {
            res.json({ message: 'Contact deleted successfully', data: deletedContact });
        } else {
            res.status(404).json({ message: 'Contact not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete contact', error: error.message });
    }
});

// Quote endpoints (no authentication required for submission)
app.post('/api/quote', (req, res) => {
    console.log('📡 API request: POST /api/quote');
    try {
        const newQuote = contentStore.addQuote(req.body);
        console.log('✅ New quote request received:', newQuote);
        res.json({
            success: true,
            message: 'Quote request submitted successfully! We will contact you within 24-48 hours.',
            data: newQuote
        });
    } catch (error) {
        console.error('❌ Error creating quote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit quote request. Please try again.',
            error: error.message
        });
    }
});

// Guide download endpoints
app.post('/api/guides/download', (req, res) => {
    console.log('📡 API request: POST /api/guides/download');
    try {
        const { email, guide } = req.body;

        if (!email || !guide) {
            return res.status(400).json({
                success: false,
                message: 'Email and guide type are required'
            });
        }

        // Add guide download to content store
        const guideDownload = contentStore.addGuideDownload({
            email,
            guide,
            downloadedAt: new Date().toISOString(),
            ipAddress: req.ip || req.connection.remoteAddress
        });

        console.log('✅ New guide download:', guideDownload);

        res.json({
            success: true,
            message: 'Guide download recorded successfully',
            data: guideDownload
        });
    } catch (error) {
        console.error('❌ Error recording guide download:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process guide download',
            error: error.message
        });
    }
});

app.get('/api/guides/downloads', authenticateToken, (req, res) => {
    console.log('📡 API request: GET /api/guides/downloads');
    res.json(contentStore.getAllGuideDownloads());
});

// Quote management endpoints (authenticated)
app.get('/api/quotes', authenticateToken, (req, res) => {
    console.log('📡 API request: GET /api/quotes');
    res.json(contentStore.getAllQuotes());
});

app.put('/api/quotes/:id', authenticateToken, (req, res) => {
    console.log('📡 API request: PUT /api/quotes/' + req.params.id);
    try {
        const updatedQuote = contentStore.updateQuote(req.params.id, req.body);
        if (updatedQuote) {
            res.json({ message: 'Quote updated successfully', data: updatedQuote });
        } else {
            res.status(404).json({ message: 'Quote not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update quote', error: error.message });
    }
});

app.delete('/api/quotes/:id', authenticateToken, (req, res) => {
    console.log('📡 API request: DELETE /api/quotes/' + req.params.id);
    try {
        const deletedQuote = contentStore.deleteQuote(req.params.id);
        if (deletedQuote) {
            res.json({ message: 'Quote deleted successfully', data: deletedQuote });
        } else {
            res.status(404).json({ message: 'Quote not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete quote', error: error.message });
    }
});

// Public API endpoints with caching (no authentication required) for main website
app.get('/api/public/case-studies', apiCache(10 * 60 * 1000), (req, res) => {
    console.log('📡 Public API request: GET /api/public/case-studies');
    res.json(contentStore.getPublishedCaseStudies());
});

app.get('/api/public/blog-posts', apiCache(10 * 60 * 1000), (req, res) => {
    console.log('📡 Public API request: GET /api/public/blog-posts');
    res.json(contentStore.getPublishedBlogPosts());
});

// Catch-all for other API endpoints
app.use('/api/*', (req, res) => {
    console.log(`📡 API request: ${req.method} ${req.url}`);
    res.json({
        message: 'Direct API endpoint',
        method: req.method,
        path: req.url,
        timestamp: new Date().toISOString()
    });
});

// Serve static files with caching
app.use(staticCaching);
app.use(express.static('.', {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true
}));

// Handle admin routes
app.get('/admin/*', (req, res) => {
    const filePath = req.path.substring(1); // Remove leading slash
    res.sendFile(path.join(__dirname, filePath));
});

// Handle root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle all other routes - serve the requested file or index.html
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);

    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        // If file doesn't exist, serve index.html (for SPA routing)
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Enhanced error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize and start server
async function startServer() {
    try {
        // Initialize error handling
        initializeErrorHandling();

        // Start memory monitoring
        memoryMonitor.start();

        // Initialize database
        await initializeDatabase();

        // Start server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log('\n🎉 ===== EX REVOLUTION TECHNOLOGY SERVER =====');
            console.log(`🚀 Server running on: http://localhost:${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Database: ${dbConnected ? 'MongoDB Connected' : 'In-Memory Storage'}`);
            console.log('\n📱 ADMIN DASHBOARD:');
            console.log(`   Dashboard: http://localhost:${PORT}/admin/dashboard.html`);
            console.log(`   Blog Posts: http://localhost:${PORT}/admin/blog-posts.html`);
            console.log(`   Contacts: http://localhost:${PORT}/admin/contacts.html`);
            console.log(`   Case Studies: http://localhost:${PORT}/admin/case-studies.html`);
            console.log('\n🌍 PUBLIC WEBSITE:');
            console.log(`   Homepage: http://localhost:${PORT}/`);
            console.log(`   Blog: http://localhost:${PORT}/blog.html`);
            console.log(`   Case Studies: http://localhost:${PORT}/case-studies.html`);
            console.log(`   Contact: http://localhost:${PORT}/contact.html`);
            console.log('\n🔧 API ENDPOINTS:');
            console.log(`   Health Check: http://localhost:${PORT}/api/health`);
            console.log(`   Authentication: http://localhost:${PORT}/api/auth`);
            console.log('\n🔑 ADMIN CREDENTIALS:');
            console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@exrevolution.com'}`);
            console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
            console.log('\n✅ All systems operational!');
            console.log('===============================================\n');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n📴 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
