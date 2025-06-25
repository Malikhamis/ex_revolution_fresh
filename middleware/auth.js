/**
 * Authentication Middleware
 * Secure JWT-based authentication system
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and protects routes
 */
const authenticateToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access token required',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request
        req.user = decoded.user;
        
        console.log(`🔐 Authenticated user: ${req.user.email}`);
        next();
        
    } catch (error) {
        console.error('❌ Authentication error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Authentication server error',
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * Admin Role Middleware
 * Ensures user has admin privileges
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'NO_AUTH'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin privileges required',
            code: 'INSUFFICIENT_PRIVILEGES'
        });
    }

    next();
};

/**
 * Rate Limiting for Authentication Routes
 */
const authRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development';
    }
});

/**
 * General API Rate Limiting
 */
const apiRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        code: 'API_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Password Hashing Utilities
 */
const hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * JWT Token Generation
 */
const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'admin'
        }
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            issuer: 'exrevolution.com',
            audience: 'exrevolution-admin'
        }
    );
};

/**
 * Token Verification Utility
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    authRateLimit,
    apiRateLimit,
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
};
