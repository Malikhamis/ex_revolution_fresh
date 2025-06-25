/**
 * Unit Tests for Middleware Functions
 * Testing authentication, validation, and performance middleware
 */

const { 
    responseTime, 
    staticCaching, 
    performanceMetrics 
} = require('../../middleware/performance');

const {
    AppError,
    ValidationError,
    AuthenticationError,
    NotFoundError
} = require('../../middleware/errorHandler');

describe('Performance Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            method: 'GET',
            url: '/test',
            ip: '127.0.0.1'
        };
        res = {
            set: jest.fn(),
            on: jest.fn()
        };
        next = jest.fn();
    });

    describe('responseTime middleware', () => {
        test('should add response time tracking', () => {
            responseTime(req, res, next);
            
            expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
            expect(next).toHaveBeenCalled();
        });

        test('should set X-Response-Time header on finish', (done) => {
            res.on.mockImplementation((event, callback) => {
                if (event === 'finish') {
                    setTimeout(() => {
                        callback();
                        expect(res.set).toHaveBeenCalledWith('X-Response-Time', expect.stringMatching(/\d+ms/));
                        done();
                    }, 10);
                }
            });

            responseTime(req, res, next);
        });
    });

    describe('staticCaching middleware', () => {
        test('should set cache headers for images', () => {
            req.url = '/test.jpg';
            
            staticCaching(req, res, next);
            
            expect(res.set).toHaveBeenCalledWith(expect.objectContaining({
                'Cache-Control': expect.stringContaining('public'),
                'Expires': expect.any(String)
            }));
            expect(next).toHaveBeenCalled();
        });

        test('should set no-cache headers for HTML', () => {
            req.url = '/test.html';
            
            staticCaching(req, res, next);
            
            expect(res.set).toHaveBeenCalledWith(expect.objectContaining({
                'Cache-Control': expect.stringContaining('no-cache')
            }));
            expect(next).toHaveBeenCalled();
        });

        test('should handle unknown file types', () => {
            req.url = '/test.unknown';
            
            staticCaching(req, res, next);
            
            expect(res.set).toHaveBeenCalledWith(expect.objectContaining({
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }));
            expect(next).toHaveBeenCalled();
        });
    });

    describe('performanceMetrics middleware', () => {
        test('should increment request counter', () => {
            const initialRequests = performanceMetrics.requests;
            
            performanceMetrics.middleware(req, res, next);
            
            expect(performanceMetrics.requests).toBe(initialRequests + 1);
            expect(next).toHaveBeenCalled();
        });

        test('should track response time', (done) => {
            res.on.mockImplementation((event, callback) => {
                if (event === 'finish') {
                    res.statusCode = 200;
                    setTimeout(() => {
                        callback();
                        done();
                    }, 10);
                }
            });

            performanceMetrics.middleware(req, res, next);
        });

        test('should track errors', (done) => {
            const initialErrors = performanceMetrics.errors;
            
            res.on.mockImplementation((event, callback) => {
                if (event === 'finish') {
                    res.statusCode = 500;
                    setTimeout(() => {
                        callback();
                        expect(performanceMetrics.errors).toBe(initialErrors + 1);
                        done();
                    }, 10);
                }
            });

            performanceMetrics.middleware(req, res, next);
        });
    });
});

describe('Error Classes', () => {
    describe('AppError', () => {
        test('should create error with correct properties', () => {
            const error = new AppError('Test error', 400, 'TEST_ERROR');
            
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.status).toBe('fail');
            expect(error.code).toBe('TEST_ERROR');
            expect(error.isOperational).toBe(true);
        });

        test('should set status to error for 5xx codes', () => {
            const error = new AppError('Server error', 500);
            
            expect(error.status).toBe('error');
        });
    });

    describe('ValidationError', () => {
        test('should create validation error with errors array', () => {
            const errors = [
                { field: 'email', message: 'Invalid email' },
                { field: 'password', message: 'Password too short' }
            ];
            const error = new ValidationError('Validation failed', errors);
            
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.errors).toEqual(errors);
        });
    });

    describe('AuthenticationError', () => {
        test('should create authentication error', () => {
            const error = new AuthenticationError();
            
            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('AUTHENTICATION_ERROR');
            expect(error.message).toBe('Authentication failed');
        });

        test('should accept custom message', () => {
            const error = new AuthenticationError('Invalid credentials');
            
            expect(error.message).toBe('Invalid credentials');
        });
    });

    describe('NotFoundError', () => {
        test('should create not found error', () => {
            const error = new NotFoundError();
            
            expect(error.statusCode).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
            expect(error.message).toBe('Resource not found');
        });
    });
});

describe('Performance Metrics', () => {
    describe('getStats', () => {
        test('should return performance statistics', () => {
            const stats = performanceMetrics.getStats();
            
            expect(stats).toHaveProperty('uptime');
            expect(stats).toHaveProperty('requests');
            expect(stats).toHaveProperty('errors');
            expect(stats).toHaveProperty('errorRate');
            expect(stats).toHaveProperty('averageResponseTime');
            expect(stats).toHaveProperty('requestsPerMinute');
            
            expect(typeof stats.uptime).toBe('number');
            expect(typeof stats.requests).toBe('number');
            expect(typeof stats.errors).toBe('number');
            expect(typeof stats.errorRate).toBe('string');
            expect(typeof stats.averageResponseTime).toBe('string');
            expect(typeof stats.requestsPerMinute).toBe('number');
        });
    });
});
