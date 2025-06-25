/**
 * Performance Middleware
 * Compression, caching, and optimization utilities
 */

const fs = require('fs');
const path = require('path');

/**
 * Response Time Middleware
 * Adds X-Response-Time header to track API performance
 */
const responseTime = (req, res, next) => {
    const start = Date.now();

    // Set header before response is sent
    const originalSend = res.send;
    const originalJson = res.json;

    const addResponseTime = () => {
        const duration = Date.now() - start;

        // Only set header if response hasn't been sent yet
        if (!res.headersSent) {
            res.set('X-Response-Time', `${duration}ms`);
        }

        // Log slow requests (over 1 second)
        if (duration > 1000) {
            console.warn(`⚠️ Slow request: ${req.method} ${req.url} - ${duration}ms`);
        }

        // Log API requests with timing
        if (req.url.startsWith('/api/')) {
            console.log(`📊 API ${req.method} ${req.url} - ${duration}ms`);
        }
    };

    // Override send method
    res.send = function(data) {
        addResponseTime();
        return originalSend.call(this, data);
    };

    // Override json method
    res.json = function(data) {
        addResponseTime();
        return originalJson.call(this, data);
    };

    next();
};

/**
 * Static File Caching Middleware
 * Sets appropriate cache headers for static assets
 */
const staticCaching = (req, res, next) => {
    const ext = path.extname(req.url).toLowerCase();

    // Cache settings for different file types
    const cacheSettings = {
        // Images - cache for 30 days
        '.jpg': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.jpeg': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.png': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.gif': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.webp': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.svg': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.ico': { maxAge: 30 * 24 * 60 * 60, immutable: true },

        // CSS and JS - cache for 7 days
        '.css': { maxAge: 7 * 24 * 60 * 60, immutable: false },
        '.js': { maxAge: 7 * 24 * 60 * 60, immutable: false },

        // Fonts - cache for 30 days
        '.woff': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.woff2': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.ttf': { maxAge: 30 * 24 * 60 * 60, immutable: true },
        '.eot': { maxAge: 30 * 24 * 60 * 60, immutable: true },

        // HTML - cache for 1 hour
        '.html': { maxAge: 60 * 60, immutable: false },

        // Default - no cache
        'default': { maxAge: 0, immutable: false }
    };

    const settings = cacheSettings[ext] || cacheSettings['default'];

    if (settings.maxAge > 0) {
        res.set({
            'Cache-Control': `public, max-age=${settings.maxAge}${settings.immutable ? ', immutable' : ''}`,
            'Expires': new Date(Date.now() + settings.maxAge * 1000).toUTCString()
        });
    } else {
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
    }

    next();
};

/**
 * API Response Caching Middleware
 * Simple in-memory cache for API responses
 */
const apiCache = (() => {
    const cache = new Map();
    const maxCacheSize = 100; // Maximum number of cached responses
    const defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

    return (ttl = defaultTTL) => {
        return (req, res, next) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }

            const key = req.originalUrl;
            const cached = cache.get(key);

            // Check if we have a valid cached response
            if (cached && Date.now() < cached.expires) {
                console.log(`💾 Cache hit: ${key}`);
                res.set('X-Cache', 'HIT');
                return res.json(cached.data);
            }

            // Store original json method
            const originalJson = res.json;

            // Override json method to cache the response
            res.json = function(data) {
                // Cache the response
                if (res.statusCode === 200) {
                    // Clean up cache if it's getting too large
                    if (cache.size >= maxCacheSize) {
                        const firstKey = cache.keys().next().value;
                        cache.delete(firstKey);
                    }

                    cache.set(key, {
                        data: data,
                        expires: Date.now() + ttl
                    });

                    console.log(`💾 Cache set: ${key} (TTL: ${ttl}ms)`);
                }

                res.set('X-Cache', 'MISS');
                return originalJson.call(this, data);
            };

            next();
        };
    };
})();

/**
 * Request Logging Middleware
 * Enhanced logging for monitoring and debugging
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    // Log request start
    console.log(`📥 ${timestamp} ${req.method} ${req.url} - ${req.ip}`);

    // Log request body for POST/PUT requests (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const logBody = { ...req.body };

        // Remove sensitive fields
        delete logBody.password;
        delete logBody.token;
        delete logBody.secret;

        if (Object.keys(logBody).length > 0) {
            console.log(`📝 Request body:`, JSON.stringify(logBody, null, 2));
        }
    }

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '❌' : '✅';
        console.log(`📤 ${statusColor} ${res.statusCode} ${req.method} ${req.url} - ${duration}ms`);
    });

    next();
};

/**
 * Memory Usage Monitoring
 * Logs memory usage periodically
 */
const memoryMonitor = {
    start: () => {
        setInterval(() => {
            const usage = process.memoryUsage();
            const formatBytes = (bytes) => {
                return (bytes / 1024 / 1024).toFixed(2) + ' MB';
            };

            console.log(`💾 Memory Usage: RSS: ${formatBytes(usage.rss)}, Heap: ${formatBytes(usage.heapUsed)}/${formatBytes(usage.heapTotal)}`);

            // Warn if memory usage is high
            if (usage.heapUsed > 100 * 1024 * 1024) { // 100MB
                console.warn(`⚠️ High memory usage detected: ${formatBytes(usage.heapUsed)}`);
            }
        }, 60000); // Every minute
    }
};

/**
 * File Size Formatter
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Performance Metrics Collection
 */
const performanceMetrics = {
    requests: 0,
    totalResponseTime: 0,
    errors: 0,
    startTime: Date.now(),

    middleware: (req, res, next) => {
        const start = Date.now();
        performanceMetrics.requests++;

        res.on('finish', () => {
            const duration = Date.now() - start;
            performanceMetrics.totalResponseTime += duration;

            if (res.statusCode >= 400) {
                performanceMetrics.errors++;
            }
        });

        next();
    },

    getStats: () => {
        const uptime = Date.now() - performanceMetrics.startTime;
        const avgResponseTime = performanceMetrics.requests > 0
            ? performanceMetrics.totalResponseTime / performanceMetrics.requests
            : 0;

        return {
            uptime: uptime,
            requests: performanceMetrics.requests,
            errors: performanceMetrics.errors,
            errorRate: performanceMetrics.requests > 0
                ? (performanceMetrics.errors / performanceMetrics.requests * 100).toFixed(2) + '%'
                : '0%',
            averageResponseTime: Math.round(avgResponseTime) + 'ms',
            requestsPerMinute: Math.round(performanceMetrics.requests / (uptime / 60000))
        };
    }
};

module.exports = {
    responseTime,
    staticCaching,
    apiCache,
    requestLogger,
    memoryMonitor,
    formatFileSize,
    performanceMetrics
};
