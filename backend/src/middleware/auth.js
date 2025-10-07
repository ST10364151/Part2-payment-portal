// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import { Employee } from '../models/Employee.js';

/**
 * Generate JWT Token
 */
export const generateToken = (userId, role = 'customer') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '24h',
      issuer: 'international-payments-portal',
      audience: 'payment-portal-users'
    }
  );
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'international-payments-portal',
      audience: 'payment-portal-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Protect routes - require authentication
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please log in.'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Check if user still exists and is active
    let user;
    if (decoded.role === 'customer') {
      user = await Customer.findById(decoded.id).select('+password');
    } else if (decoded.role === 'employee') {
      user = await Employee.findById(decoded.id).select('+password');
    }
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or is inactive'
      });
    }
    
    // Check if user changed password after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          message: 'Password was changed recently. Please log in again.'
        });
      }
    }
    
    // Grant access to protected route
    req.user = user;
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Not authorized to access this route'
    });
  }
};

/**
 * Restrict access to specific roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

/**
 * Check if customer owns the resource
 */
export const checkOwnership = (req, res, next) => {
  if (req.userRole === 'customer' && req.user._id.toString() !== req.params.customerId) {
    return res.status(403).json({
      success: false,
      message: 'You can only access your own resources'
    });
  }
  next();
};