const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// ==================== DANGEROUS PATTERNS BLOCKING ====================

// SQL Injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\bor\b|\band\b).*?[=<>]/i,
  /union.*select/i,
  /insert.*into/i,
  /delete.*from/i,
  /drop.*table/i,
  /update.*set/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /;\s*(drop|delete|insert|update|create)/i,
  /--/,
  /\/\*/,
  /xp_cmdshell/i,
  /script.*?>.*?<\/script/i
];

// XSS (Cross-Site Scripting) patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<img[^>]+src[^>]*>/gi,
  /<object[^>]*>/gi,
  /<embed[^>]*>/gi,
  /<applet[^>]*>/gi,
  /document\.cookie/gi,
  /document\.write/gi,
  /\.innerHTML/gi,
  /eval\(/gi,
  /expression\(/gi
];

// NoSQL Injection patterns
const NOSQL_INJECTION_PATTERNS = [
  /\$where/i,
  /\$ne/i,
  /\$gt/i,
  /\$lt/i,
  /\$or/i,
  /\$and/i,
  /\$regex/i,
  /\$exists/i,
  /\$nin/i,
  /\$in.*\[/i,
  /[{}\[\]]/
];

// Path Traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e\\/gi,
  /\.\.%2f/gi,
  /\.\.%5c/gi
];

// Command Injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /;.*?\s*(ls|cat|wget|curl|nc|bash|sh|cmd|powershell)/i,
  /\|.*?(ls|cat|wget|curl|nc|bash|sh|cmd)/i,
  /`.*?`/,
  /\$\(.*?\)/,
  /&&/,
  /\|\|/
];

// LDAP Injection patterns
const LDAP_INJECTION_PATTERNS = [
  /\*\)/,
  /\(\|/,
  /\(&/,
  /\(!/,
  /~=/
];

// XML Injection patterns
const XML_INJECTION_PATTERNS = [
  /<\?xml/i,
  /<!DOCTYPE/i,
  /<!ENTITY/i,
  /SYSTEM/i
];

// Check for dangerous patterns
const containsDangerousPattern = (input) => {
  if (typeof input !== 'string') return false;
  
  const allPatterns = [
    ...SQL_INJECTION_PATTERNS,
    ...XSS_PATTERNS,
    ...NOSQL_INJECTION_PATTERNS,
    ...PATH_TRAVERSAL_PATTERNS,
    ...COMMAND_INJECTION_PATTERNS,
    ...LDAP_INJECTION_PATTERNS,
    ...XML_INJECTION_PATTERNS
  ];
  
  for (const pattern of allPatterns) {
    if (pattern.test(input)) {
      console.error(`🚨 SECURITY ALERT: Dangerous pattern detected: ${pattern}`);
      console.error(`Input: ${input.substring(0, 100)}...`);
      return true;
    }
  }
  
  return false;
};

// Block requests with dangerous patterns
const blockDangerousPatterns = (req, res, next) => {
  try {
    // Check all input sources
    const checkObject = (obj, source) => {
      if (!obj) return false;
      
      for (const key in obj) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          if (containsDangerousPattern(value)) {
            console.error(`🚨 BLOCKED: Dangerous pattern in ${source}.${key}`);
            console.error(`IP: ${req.ip}`);
            console.error(`User-Agent: ${req.headers['user-agent']}`);
            return true;
          }
        } else if (typeof value === 'object' && value !== null) {
          if (checkObject(value, `${source}.${key}`)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Check body, query, and params
    if (checkObject(req.body, 'body') ||
        checkObject(req.query, 'query') ||
        checkObject(req.params, 'params')) {
      
      return res.status(400).json({
        error: 'Invalid input detected. Request blocked for security reasons.',
        code: 'SECURITY_VIOLATION'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in dangerous pattern detection:', error);
    next();
  }
};

// ==================== INPUT VALIDATION PATTERNS ====================

const patterns = {
  fullName: /^[a-zA-Z\s]{2,100}$/,
  username: /^[a-zA-Z0-9_]{3,30}$/,
  idNumber: /^[0-9]{13}$/,
  accountNumber: /^[0-9]{10,16}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  amount: /^[0-9]+(\.[0-9]{1,2})?$/,
  currency: /^[A-Z]{3}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  employeeId: /^[A-Z]{3}[0-9]{3}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

// Validate input against pattern
const validateInput = (field, value) => {
  if (!patterns[field]) {
    throw new Error(`No validation pattern for field: ${field}`);
  }
  return patterns[field].test(value);
};

// ==================== SANITIZATION ====================

// SQL Injection Prevention - Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove dangerous characters
  return input
    .replace(/[;'"\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
};

// XSS Prevention - Escape HTML
const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return text.replace(/[&<>"'`=\/]/g, (m) => map[m]);
};

// Comprehensive input sanitization middleware
const sanitizeRequest = (req, res, next) => {
  try {
    const sanitizeObject = (obj) => {
      if (!obj) return obj;
      
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeInput(obj[key]);
          obj[key] = escapeHtml(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };
    
    // Sanitize all input sources
    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);
    
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
};

// ==================== VALIDATION MIDDLEWARE ====================

// Validate registration data
const validateRegistration = (req, res, next) => {
  const { fullName, username, idNumber, accountNumber, password } = req.body;
  const errors = [];
  
  if (!fullName || !validateInput('fullName', fullName)) {
    errors.push('Invalid full name format (2-100 letters and spaces only)');
  }
  
  if (!username || !validateInput('username', username)) {
    errors.push('Invalid username format (3-30 alphanumeric characters and underscore)');
  }
  
  if (!idNumber || !validateInput('idNumber', idNumber)) {
    errors.push('Invalid ID number format (exactly 13 digits)');
  }
  
  if (!accountNumber || !validateInput('accountNumber', accountNumber)) {
    errors.push('Invalid account number format (10-16 digits)');
  }
  
  if (!password || !validateInput('password', password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, number and special character (@$!%*?&)');
  }
  
  if (errors.length > 0) {
    console.log('❌ Registration validation failed:', errors);
    return res.status(400).json({ errors });
  }
  
  console.log('✅ Registration validation passed');
  next();
};

// Validate login data
const validateLogin = (req, res, next) => {
  const { username, accountNumber, password } = req.body;
  const errors = [];
  
  if (!username || !validateInput('username', username)) {
    errors.push('Invalid username format');
  }
  
  if (!accountNumber || !validateInput('accountNumber', accountNumber)) {
    errors.push('Invalid account number format');
  }
  
  if (!password || password.length < 8) {
    errors.push('Invalid password');
  }
  
  if (errors.length > 0) {
    console.log('❌ Login validation failed:', errors);
    return res.status(400).json({ errors });
  }
  
  console.log('✅ Login validation passed');
  next();
};

// Validate employee login
const validateEmployeeLogin = (req, res, next) => {
  const { employeeId, password } = req.body;
  const errors = [];
  
  if (!employeeId || !validateInput('employeeId', employeeId)) {
    errors.push('Invalid employee ID format (e.g., EMP001)');
  }
  
  if (!password || password.length < 8) {
    errors.push('Invalid password');
  }
  
  if (errors.length > 0) {
    console.log('❌ Employee login validation failed:', errors);
    return res.status(400).json({ errors });
  }
  
  console.log('✅ Employee login validation passed');
  next();
};

// Validate payment data
const validatePayment = (req, res, next) => {
  const { amount, currency, payeeAccountNumber, swiftCode } = req.body;
  const errors = [];
  
  if (!amount || !validateInput('amount', amount.toString())) {
    errors.push('Invalid amount format (numbers with up to 2 decimals)');
  }
  
  if (!currency || !validateInput('currency', currency)) {
    errors.push('Invalid currency format (3-letter code, e.g., USD)');
  }
  
  if (!payeeAccountNumber || !validateInput('accountNumber', payeeAccountNumber)) {
    errors.push('Invalid payee account number format (10-16 digits)');
  }
  
  if (!swiftCode || !validateInput('swiftCode', swiftCode)) {
    errors.push('Invalid SWIFT code format (8 or 11 characters, e.g., ABCDEF12)');
  }
  
  if (errors.length > 0) {
    console.log('❌ Payment validation failed:', errors);
    return res.status(400).json({ errors });
  }
  
  console.log('✅ Payment validation passed');
  next();
};

// ==================== AUTHENTICATION ====================

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('❌ Authentication failed: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Authentication failed: Invalid token');
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired. Please login again.' });
      }
      
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    console.log('✅ Authentication successful for user:', user.userId || user.employeeId);
    req.user = user;
    next();
  });
};

// ==================== CSRF PROTECTION ====================

const validateCSRF = (req, res, next) => {
  // Skip CSRF for GET requests and login/register
  if (req.method === 'GET' || req.path.includes('/login') || req.path.includes('/register')) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.headers['x-session-token'];
  
  // In production, implement proper CSRF token validation
  if (!csrfToken || !sessionToken) {
    console.log('⚠️  CSRF validation: Headers missing (development mode - allowing)');
  }
  
  next();
};

// ==================== RATE LIMITING ====================

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
      console.log(`🚫 Rate limit exceeded for IP: ${req.ip} - Path: ${req.path}`);
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  });
};

// Strict rate limiter for authentication endpoints (5 requests per 15 minutes)
const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts. Please try again in 15 minutes.'
);

// General API rate limiter (100 requests per 15 minutes)
const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100,
  'Too many requests. Please try again later.'
);

// Payment rate limiter - more restrictive (10 payments per hour)
const paymentRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  'Too many payment requests. Please try again in an hour.'
);

// Employee rate limiter - stricter (3 attempts per 15 minutes)
const employeeRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  3,
  'Too many employee authentication attempts. Account temporarily locked.'
);

// ==================== SECURITY HEADERS ====================

const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'");
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
};

// ==================== LOGGING ====================

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 [${timestamp}] ${req.method} ${req.path}`);
  console.log(`🌐 IP: ${ip}`);
  console.log(`💻 User-Agent: ${userAgent}`);
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    console.log(`📦 Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  console.log(`${'='.repeat(80)}\n`);
  
  next();
};

// ==================== ERROR HANDLING ====================

const errorHandler = (err, req, res, next) => {
  console.error(`\n${'!'.repeat(80)}`);
  console.error('💥 ERROR OCCURRED:');
  console.error(`Path: ${req.path}`);
  console.error(`Method: ${req.method}`);
  console.error(`IP: ${req.ip}`);
  console.error(`Message: ${err.message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`Stack: ${err.stack}`);
  }
  console.error(`${'!'.repeat(80)}\n`);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry',
      details: 'A record with this information already exists'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Authentication token expired' });
  }
  
  // Cast error (invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  // Pattern detection
  containsDangerousPattern,
  blockDangerousPatterns,
  
  // Validation
  validateInput,
  validateRegistration,
  validateLogin,
  validateEmployeeLogin,
  validatePayment,
  
  // Sanitization
  sanitizeInput,
  escapeHtml,
  sanitizeRequest,
  
  // Authentication
  authenticateToken,
  validateCSRF,
  
  // Rate limiting
  authRateLimiter,
  apiRateLimiter,
  paymentRateLimiter,
  employeeRateLimiter,
  
  // Security
  securityHeaders,
  requestLogger,
  errorHandler
};
