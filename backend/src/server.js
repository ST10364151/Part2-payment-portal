// backend/src/server.js
import events from 'events';
events.EventEmitter.defaultMaxListeners = 20;

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ============================================================================
// DEBUG: Check environment variables on startup
// ============================================================================
console.log('\n🔐 ENVIRONMENT VARIABLE CHECK');
console.log('════════════════════════════════════════');
console.log('PASSWORD_PEPPER loaded:', !!process.env.PASSWORD_PEPPER);
console.log('PASSWORD_PEPPER (first 40):', process.env.PASSWORD_PEPPER?.substring(0, 20));
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI);
console.log('════════════════════════════════════════\n');

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

// CORS - Configure allowed origins
const corsOptions = {
  origin: ['https://localhost:3000', 'http://localhost:3000'], // Allow both
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// ============================================================================
// RATE LIMITING (centralized)
// ============================================================================
// General API limiter applied to all /api routes
app.use('/api/', apiLimiter);

// Login limiter - apply to auth login endpoints
app.use('/api/auth', loginLimiter);

// Payment limiter - apply to the payment creation route(s)
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
// SSL/TLS CONFIGURATION WITH CERTIFICATE VALIDATION
// ============================================================================
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3001;
  
  // Resolve SSL certificate paths
  const sslKeyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../ssl/key.pem');
  const sslCertPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../ssl/cert.pem');
  
  // ============================================================================
  // CHECK IF SSL CERTIFICATES EXIST
  // ============================================================================
  if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║                                                                ║');
    console.error('║   ❌ SSL CERTIFICATES NOT FOUND!                               ║');
    console.error('║                                                                ║');
    console.error('╚════════════════════════════════════════════════════════════════╝');
    console.error('\n⚠️  SSL certificates are required but missing.');
    console.error('   These certificates are machine-specific and must be');
    console.error('   generated on YOUR computer.\n');
    console.error('📋 To fix this, run ONE of these commands:\n');
    console.error('   Option 1 - Automated (recommended):');
    console.error('     ./setup.sh         (macOS/Linux)');
    console.error('     setup.bat          (Windows)\n');
    console.error('   Option 2 - Manual:');
    console.error('     cd backend/ssl');
    console.error('     openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes');
    console.error('     cd ../..\n');
    console.error('Missing files:');
    if (!fs.existsSync(sslKeyPath)) console.error(`   ❌ ${sslKeyPath}`);
    if (!fs.existsSync(sslCertPath)) console.error(`   ❌ ${sslCertPath}`);
    console.error('\n════════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
  
  // ============================================================================
  // VALIDATE SSL CERTIFICATE CONTENT
  // ============================================================================
  try {
    const keyContent = fs.readFileSync(sslKeyPath, 'utf8');
    const certContent = fs.readFileSync(sslCertPath, 'utf8');
    
    // Basic validation - check if files contain valid PEM headers
    if (!keyContent.includes('BEGIN PRIVATE KEY') && !keyContent.includes('BEGIN RSA PRIVATE KEY')) {
      throw new Error('Invalid private key format - missing PEM header');
    }
    
    if (!certContent.includes('BEGIN CERTIFICATE')) {
      throw new Error('Invalid certificate format - missing PEM header');
    }
    
    // Check file sizes (certificates should be reasonably sized)
    const keyStats = fs.statSync(sslKeyPath);
    const certStats = fs.statSync(sslCertPath);
    
    if (keyStats.size < 100 || certStats.size < 100) {
      throw new Error('Certificate files appear to be empty or corrupted');
    }
    
  } catch (validationError) {
    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║                                                                ║');
    console.error('║   ❌ SSL CERTIFICATE VALIDATION FAILED!                        ║');
    console.error('║                                                                ║');
    console.error('╚════════════════════════════════════════════════════════════════╝');
    console.error(`\n⚠️  Error: ${validationError.message}\n`);
    console.error('📋 Your certificates may be corrupted. Regenerate them:\n');
    console.error('   cd backend/ssl');
    console.error('   rm -f *.pem  # Remove old certificates');
    console.error('   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes');
    console.error('   cd ../..\n');
    console.error('════════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
  
  // ============================================================================
  // CREATE SSL OPTIONS
  // ============================================================================
  const sslOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
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
║   Certificates: ✓ Valid                                        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    httpsServer.close(() => {
      mongoose.connection.close(false, () => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  });
  
  process.on('SIGINT', () => {
    console.log('\nSIGINT received, closing server gracefully...');
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