// backend/src/server.js
import events from 'events';
events.EventEmitter.defaultMaxListeners = 20;

import https from 'https';
import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import dotenv from 'dotenv';

// Import rate limiters from centralized middleware
import { apiLimiter, loginLimiter, paymentLimiter } from './middleware/rateLimiting.js';

// Import routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customer.js';
import employeeRoutes from './routes/employee.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

// Load environment variables
dotenv.config();

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE CONFIGURATION
// ============================================================================
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
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
}));

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['https://localhost:3000', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// ============================================================================
// RATE LIMITING (centralized)
// ============================================================================
// General API limiter applied to all /api routes
app.use('/api/', apiLimiter);

// Login limiter - apply to auth login endpoints. If your login endpoints are
// /api/auth/customer/login and /api/auth/employee/login it might be better
// to apply the limiter inside the auth router for specific routes.
// For simplicity we apply to /api/auth/* (adjust if you want it narrower).
app.use('/api/auth', loginLimiter);

// Payment limiter - apply to the payment creation route(s)
// If your payment POST is exactly /api/customer/payment this will apply correctly.
// Alternatively apply paymentLimiter inside the customer router for just the POST.
app.use('/api/customer/payment', paymentLimiter);

// ============================================================================
// BODY PARSING / SANITIZATION / PROTECTION
// ============================================================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(hpp());
app.use(requestLogger);

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected Successfully');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// ============================================================================
// ROUTES
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/employee', employeeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), ssl: true });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

// ============================================================================
// SSL/TLS CONFIGURATION
// ============================================================================
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3001;
  
  const sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH || './ssl/key.pem'),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH || './ssl/cert.pem'),
    minVersion: 'TLSv1.2',
    ciphers: [
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA384'
    ].join(':'),
    honorCipherOrder: true
  };

  const httpsServer = https.createServer(sslOptions, app);

  httpsServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   Secure International Payments Portal                         ║
║                                                                ║
║   Server running on: https://localhost:${PORT}                 ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
║   SSL/TLS: ✓ Enabled                                           ║
║   Database: ✓ Connected                                        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    httpsServer.close(() => {
      mongoose.connection.close(false, () => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
