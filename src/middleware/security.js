const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// ============================================
// DDOS PROTECTION - Advanced Rate Limiting
// ============================================

// Global API rate limiter (basic DDoS protection)
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per IP
    message: 'Too many requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true, // Trust proxy headers
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/api/health';
    }
});

// Strict limiter for authentication endpoints (Brute Force Protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful logins
    message: 'Too many login attempts. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true // Trust proxy headers
});

// Extra strict limiter for registration (prevent spam accounts)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: 'Too many accounts created. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true // Trust proxy headers
});

// Password reset limiter (prevent abuse)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 password reset attempts per hour
    message: 'Too many password reset attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true // Trust proxy headers
});

// Admin panel limiter (extra protection)
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 admin requests per 15 minutes
    message: 'Admin panel rate limit exceeded.',
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true // Trust proxy headers
});

// ============================================
// SQL INJECTION PROTECTION - Input Sanitization
// ============================================

// Sanitize string input (remove dangerous SQL characters)
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove common SQL injection patterns
    return str
        .replace(/['";]/g, '') // Remove quotes and semicolons
        .replace(/--/g, '')     // Remove SQL comments
        .replace(/\/\*/g, '')   // Remove block comments
        .replace(/\*\//g, '')
        .replace(/xp_/gi, '')   // Remove xp_ commands
        .replace(/exec/gi, '')  // Remove exec
        .replace(/execute/gi, '') // Remove execute
        .replace(/script/gi, '') // Remove script tags
        .trim();
};

// Middleware to sanitize all inputs
const sanitizeInputs = (req, res, next) => {
    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        });
    }
    
    // Sanitize query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeString(req.query[key]);
            }
        });
    }
    
    // Sanitize URL params
    if (req.params) {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = sanitizeString(req.params[key]);
            }
        });
    }
    
    next();
};

// ============================================
// XSS PROTECTION - HTML/Script Injection Prevention
// ============================================

const xssProtection = (req, res, next) => {
    // Set security headers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    next();
};

// ============================================
// INPUT VALIDATION RULES
// ============================================

// Email validation
const validateEmail = body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email too long');

// Password validation
const validatePassword = body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password too long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number');

// Name validation
const validateName = body('fullName')
    .isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces');

// Crypto address validation
const validateCryptoAddress = (field) => body(field)
    .isLength({ min: 26, max: 120 }).withMessage('Invalid crypto address length')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('Invalid crypto address format');

// Amount validation
const validateAmount = (field) => body(field)
    .isFloat({ min: 0.00000001, max: 1000000 }).withMessage('Invalid amount')
    .toFloat();

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array()
        });
    }
    next();
};

// ============================================
// IP BLOCKING (Optional - for extreme cases)
// ============================================

const blockedIPs = new Set();

const blockIP = (ip) => {
    blockedIPs.add(ip);
    console.log(`🚫 IP blocked: ${ip}`);
};

const checkBlockedIP = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    if (blockedIPs.has(ip)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }
    
    next();
};

// ============================================
// REQUEST SIZE LIMITING (Prevent large payload attacks)
// ============================================

const requestSizeLimit = (req, res, next) => {
    const maxSize = 1024 * 1024; // 1MB
    let size = 0;
    
    req.on('data', (chunk) => {
        size += chunk.length;
        if (size > maxSize) {
            res.status(413).json({
                success: false,
                message: 'Request too large'
            });
            req.connection.destroy();
        }
    });
    
    next();
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Rate limiters
    globalLimiter,
    authLimiter,
    registerLimiter,
    passwordResetLimiter,
    adminLimiter,
    
    // Sanitization
    sanitizeInputs,
    sanitizeString,
    
    // XSS Protection
    xssProtection,
    
    // Validation
    validateEmail,
    validatePassword,
    validateName,
    validateCryptoAddress,
    validateAmount,
    handleValidationErrors,
    
    // IP Blocking
    checkBlockedIP,
    blockIP,
    
    // Request size
    requestSizeLimit
};


