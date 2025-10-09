const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/security');
const ExpressBrute = require('express-brute');

// Brute force protection store
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  lifetime: 24 * 60 * 60, // 24 hours
  failCallback: (req, res, next, nextValidRequestDate) => {
    console.log(`Brute force protection triggered for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many failed login attempts. Please try again later.',
      retryAfter: new Date(nextValidRequestDate).toISOString()
    });
  }
});

// Registration endpoint with comprehensive error handling
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    console.log(`[REGISTER] Attempt from IP: ${req.ip}`);
    console.log(`[REGISTER] Username: ${req.body.username}`);

    const { fullName, username, idNumber, accountNumber, password } = req.body;
    
    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { idNumber: idNumber },
        { accountNumber: accountNumber }
      ]
    });
    
    if (existingUser) {
      console.log(`[REGISTER] Failed - User already exists`);
      
      // Don't reveal which field is duplicate for security
      return res.status(400).json({
        error: 'A user with this information already exists'
      });
    }
    
    // Create new user
    const user = new User({
      fullName: fullName.trim(),
      username: username.trim(),
      idNumber: idNumber.trim(),
      accountNumber: accountNumber.trim(),
      password // Will be hashed by pre-save hook
    });
    
    await user.save();
    
    console.log(`[REGISTER] Success - User ID: ${user._id}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id
    });
    
  } catch (error) {
    console.error(`[REGISTER] Error:`, error);
    next(error);
  }
});

// Login endpoint with brute force protection and comprehensive error handling
router.post('/login', bruteforce.prevent, validateLogin, async (req, res, next) => {
  try {
    console.log(`[LOGIN] Attempt from IP: ${req.ip}`);
    console.log(`[LOGIN] Username: ${req.body.username}, Account: ${req.body.accountNumber}`);

    const { username, accountNumber, password } = req.body;
    
    // Find user by username AND account number
    const user = await User.findOne({
      username: username.trim(),
      accountNumber: accountNumber.trim()
    });
    
    if (!user) {
      console.log(`[LOGIN] Failed - User not found`);
      
      // Generic error message for security
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    console.log(`[LOGIN] User found - ID: ${user._id}`);
    
    // Verify password
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      console.log(`[LOGIN] Failed - Invalid password`);
      
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    console.log(`[LOGIN] Password verified`);
    
    // Generate JWT token with additional claims
    const tokenPayload = {
      userId: user._id,
      username: user.username,
      accountNumber: user.accountNumber,
      iat: Math.floor(Date.now() / 1000),
      type: 'customer'
    };
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: '30m',
        issuer: 'secure-bank-api',
        audience: 'secure-bank-customer'
      }
    );
    
    console.log(`[LOGIN] Success - Token generated for user: ${user.username}`);
    
    // Reset brute force counter on successful login
    if (req.brute && req.brute.reset) {
      req.brute.reset();
    }
    
    res.json({
      message: 'Login successful',
      token,
      expiresIn: 1800, // 30 minutes in seconds
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username
      }
    });
    
  } catch (error) {
    console.error(`[LOGIN] Error:`, error);
    next(error);
  }
});

// Logout endpoint (optional - for token blacklisting if implemented)
router.post('/logout', (req, res) => {
  console.log(`[LOGOUT] User logged out from IP: ${req.ip}`);
  
  // In a production system, you'd invalidate the token here
  // by adding it to a blacklist or removing from whitelist
  
  res.json({
    message: 'Logged out successfully'
  });
});

module.exports = router;
