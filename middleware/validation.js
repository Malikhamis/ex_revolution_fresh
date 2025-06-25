/**
 * Input Validation Middleware
 * Express-validator rules for API endpoints
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));
        
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }
    
    next();
};

/**
 * Authentication Validation
 */
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    handleValidationErrors
];

const validateUserRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('role')
        .optional()
        .isIn(['admin', 'editor', 'viewer'])
        .withMessage('Invalid role specified'),
    handleValidationErrors
];

/**
 * Blog Post Validation
 */
const validateBlogPost = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters')
        .escape(),
    body('excerpt')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Excerpt must be between 1 and 500 characters')
        .escape(),
    body('content')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Content is required'),
    body('author')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Author must be between 1 and 100 characters')
        .escape(),
    body('category')
        .isIn([
            'Technology', 'Software Development', 'Digital Marketing',
            'Data Analytics', 'Artificial Intelligence', 'Business',
            'IT Consulting', 'Web Development', 'Mobile Development', 'Cybersecurity'
        ])
        .withMessage('Invalid category'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Each tag must be 50 characters or less')
        .escape(),
    body('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Invalid status'),
    body('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean'),
    body('image')
        .optional()
        .trim()
        .isURL()
        .withMessage('Image must be a valid URL'),
    handleValidationErrors
];

/**
 * Case Study Validation
 */
const validateCaseStudy = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters')
        .escape(),
    body('excerpt')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Excerpt must be between 1 and 500 characters')
        .escape(),
    body('content')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Content is required'),
    body('client')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Client name must be between 1 and 100 characters')
        .escape(),
    body('industry')
        .isIn([
            'Transportation & Logistics', 'Education', 'Healthcare', 'Finance',
            'E-commerce', 'Manufacturing', 'Technology', 'Real Estate',
            'Hospitality', 'Government', 'Non-profit', 'Other'
        ])
        .withMessage('Invalid industry'),
    body('technologies')
        .optional()
        .isArray()
        .withMessage('Technologies must be an array'),
    body('projectType')
        .isIn([
            'Website Development', 'Mobile App', 'Software Development',
            'Digital Marketing', 'Branding', 'IT Consulting', 'Data Analytics',
            'E-commerce', 'System Integration'
        ])
        .withMessage('Invalid project type'),
    handleValidationErrors
];

/**
 * Contact Form Validation
 */
const validateContact = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .escape(),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('phone')
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters')
        .escape(),
    body('subject')
        .isIn([
            'Software Development', 'Digital Marketing', 'IT Consulting',
            'Data Analytics', 'Branding & Design', 'Website Development',
            'Mobile App Development', 'General Inquiry', 'Support',
            'Partnership', 'Other'
        ])
        .withMessage('Invalid subject'),
    body('message')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Message must be between 1 and 2000 characters')
        .escape(),
    handleValidationErrors
];

/**
 * Quote Request Validation
 */
const validateQuote = [
    body('clientInfo.name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Client name must be between 1 and 100 characters')
        .escape(),
    body('clientInfo.email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('clientInfo.phone')
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('projectInfo.title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Project title must be between 1 and 200 characters')
        .escape(),
    body('projectInfo.description')
        .trim()
        .isLength({ min: 1, max: 3000 })
        .withMessage('Project description must be between 1 and 3000 characters')
        .escape(),
    body('projectInfo.type')
        .isIn([
            'Website Development', 'Mobile App Development', 'Software Development',
            'Digital Marketing', 'Branding & Design', 'IT Consulting',
            'Data Analytics', 'E-commerce Solution', 'System Integration',
            'Maintenance & Support', 'Other'
        ])
        .withMessage('Invalid project type'),
    body('projectInfo.budget.range')
        .optional()
        .isIn([
            'Under $5,000', '$5,000 - $15,000', '$15,000 - $50,000',
            '$50,000 - $100,000', 'Over $100,000', 'Not Sure'
        ])
        .withMessage('Invalid budget range'),
    handleValidationErrors
];

/**
 * Parameter Validation
 */
const validateObjectId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),
    handleValidationErrors
];

const validateSlug = [
    param('slug')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Invalid slug format'),
    handleValidationErrors
];

/**
 * Query Validation
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('sort')
        .optional()
        .isIn(['createdAt', '-createdAt', 'title', '-title', 'publishedAt', '-publishedAt'])
        .withMessage('Invalid sort field'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateLogin,
    validateUserRegistration,
    validateBlogPost,
    validateCaseStudy,
    validateContact,
    validateQuote,
    validateObjectId,
    validateSlug,
    validatePagination
};
