const express = require('express');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

const {
  blockDangerousPatterns,
  sanitizeRequest,
  validateCSRF,
  apiRateLimiter,
  authRateLimiter,
  securityHeaders,
  requestLogger,
  errorHandler
} = require('./middleware/security');

app.use(securityHeaders);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Session-Token']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  Potential NoSQL injection attempt detected in ${key}`);
  },
}));

app.use(requestLogger);
app.use(blockDangerousPatterns);
app.use(sanitizeRequest);
app.use(validateCSRF);
app.use('/api/', apiRateLimiter);

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const employeeRoutes = require('./routes/employee');

// Apply rate limiting only to auth endpoints
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/employee', employeeRoutes); // No rate limiter here - it's in the login route only

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    security: {
      rateLimiting: 'enabled',
      dangerousPatternBlocking: 'enabled',
      inputSanitization: 'enabled',
      xssProtection: 'enabled',
      sqlInjectionProtection: 'enabled',
      nosqlInjectionProtection: 'enabled'
    }
  });
});

app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.use(errorHandler);

const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (retries > 0) {
      console.log(`🔄 Retrying connection... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('💀 Failed to connect to MongoDB after multiple attempts');
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

connectDB();

const httpsOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
  secureProtocol: 'TLSv1_2_method',
  honorCipherOrder: true,
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'DHE-RSA-AES128-GCM-SHA256',
    '!aNULL',
    '!eNULL',
    '!EXPORT',
    '!DES',
    '!RC4',
    '!MD5',
    '!PSK'
  ].join(':')
};

const PORT = process.env.PORT || 3001;
const server = https.createServer(httpsOptions, app);

server.listen(PORT, () => {
  console.log(`\n${'🔒'.repeat(40)}`);
  console.log(`🚀 Secure server running on https://localhost:${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🛡️  Security features enabled:`);
  console.log(`   ✅ HTTPS/TLS encryption`);
  console.log(`   ✅ Helmet security headers`);
  console.log(`   ✅ Rate limiting (Auth: 5/15min, API: 100/15min, Payment: 10/hour)`);
  console.log(`   ✅ Dangerous pattern blocking (SQL, XSS, NoSQL, Command Injection)`);
  console.log(`   ✅ Input validation & sanitization`);
  console.log(`   ✅ XSS protection`);
  console.log(`   ✅ NoSQL injection prevention`);
  console.log(`   ✅ SQL injection prevention`);
  console.log(`   ✅ CSRF protection`);
  console.log(`   ✅ CORS policy`);
  console.log(`   ✅ Request logging`);
  console.log(`   ✅ Brute force protection`);
  console.log(`${'🔒'.repeat(40)}\n`);
});

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
