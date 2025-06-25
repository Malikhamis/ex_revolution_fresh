/**
 * Comprehensive Error Handling Middleware
 * Production-ready error handling with logging and monitoring
 */

const fs = require('fs');
const path = require('path');

/**
 * Error Logger
 * Logs errors to file and console with detailed information
 */
class ErrorLogger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(error, req, additionalInfo = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                status: error.status || error.statusCode
            },
            request: {
                method: req?.method,
                url: req?.url,
                headers: req?.headers,
                body: req?.body,
                params: req?.params,
                query: req?.query,
                ip: req?.ip,
                userAgent: req?.get('User-Agent')
            },
            additionalInfo,
            environment: process.env.NODE_ENV || 'development'
        };

        // Remove sensitive information
        if (logEntry.request.headers) {
            delete logEntry.request.headers.authorization;
            delete logEntry.request.headers['x-auth-token'];
            delete logEntry.request.headers.cookie;
        }

        if (logEntry.request.body) {
            const sanitizedBody = { ...logEntry.request.body };
            delete sanitizedBody.password;
            delete sanitizedBody.token;
            delete sanitizedBody.secret;
            logEntry.request.body = sanitizedBody;
        }

        // Console logging with colors
        console.error('\n🚨 ===== ERROR OCCURRED =====');
        console.error(`⏰ Time: ${timestamp}`);
        console.error(`🔍 Error: ${error.name}: ${error.message}`);
        console.error(`📍 Location: ${req?.method} ${req?.url}`);
        console.error(`💻 IP: ${req?.ip}`);
        console.error(`📱 User Agent: ${req?.get('User-Agent')}`);
        if (error.stack) {
            console.error(`📚 Stack Trace:\n${error.stack}`);
        }
        console.error('🚨 ========================\n');

        // File logging
        try {
            const logFile = path.join(this.logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
            const logLine = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(logFile, logLine);
        } catch (fileError) {
            console.error('❌ Failed to write error log to file:', fileError.message);
        }
    }
}

const errorLogger = new ErrorLogger();

/**
 * Custom Error Classes
 */
class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.code = code;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

/**
 * Error Response Formatter
 */
const formatErrorResponse = (error, req) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const response = {
        success: false,
        error: {
            message: error.message,
            code: error.code || 'INTERNAL_ERROR',
            status: error.statusCode || 500
        },
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
    };

    // Add additional error details in development
    if (isDevelopment) {
        response.error.stack = error.stack;
        response.error.name = error.name;
    }

    // Add validation errors if present
    if (error.errors && Array.isArray(error.errors)) {
        response.error.details = error.errors;
    }

    return response;
};

/**
 * Main Error Handling Middleware
 */
const errorHandler = (error, req, res, next) => {
    // Log the error
    errorLogger.log(error, req);

    // Set default error values
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let code = error.code || 'INTERNAL_ERROR';

    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
    } else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        code = 'INVALID_ID';
    } else if (error.code === 11000) {
        statusCode = 409;
        message = 'Duplicate field value';
        code = 'DUPLICATE_FIELD';
    } else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'INVALID_TOKEN';
    } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        code = 'TOKEN_EXPIRED';
    } else if (error.name === 'MulterError') {
        statusCode = 400;
        if (error.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large';
            code = 'FILE_TOO_LARGE';
        } else {
            message = 'File upload error';
            code = 'UPLOAD_ERROR';
        }
    }

    // Create error object with updated values
    const errorObj = {
        ...error,
        statusCode,
        message,
        code
    };

    // Format and send error response
    const response = formatErrorResponse(errorObj, req);
    res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Unhandled Promise Rejection Handler
 */
const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('🚨 Unhandled Promise Rejection:', reason);
        errorLogger.log(new Error(`Unhandled Promise Rejection: ${reason}`), null, {
            type: 'unhandledRejection',
            promise: promise.toString()
        });
        
        // Graceful shutdown
        console.log('🔄 Shutting down server due to unhandled promise rejection...');
        process.exit(1);
    });
};

/**
 * Uncaught Exception Handler
 */
const handleUncaughtException = () => {
    process.on('uncaughtException', (error) => {
        console.error('🚨 Uncaught Exception:', error);
        errorLogger.log(error, null, {
            type: 'uncaughtException'
        });
        
        // Graceful shutdown
        console.log('🔄 Shutting down server due to uncaught exception...');
        process.exit(1);
    });
};

/**
 * Initialize Error Handling
 */
const initializeErrorHandling = () => {
    handleUnhandledRejection();
    handleUncaughtException();
    console.log('✅ Error handling initialized');
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    initializeErrorHandling,
    ErrorLogger,
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError
};
