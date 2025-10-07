// ============================================================================
// backend/src/controllers/authController.js
// ============================================================================

import Customer from '../models/Customer.js';
import { Employee } from '../models/Employee.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/passwordUtils.js';
import { generateToken } from '../middleware/auth.js';


/**
 * Customer Registration
 * POST /api/auth/customer/register
 */
export const customerRegister = async (req, res) => {
  try {
    const { fullName, username, idNumber, accountNumber, password } = req.body;
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }
    
    // Check if user already exists
    const existingUser = await Customer.findOne({
      $or: [
        { username },
        { idNumber },
        { accountNumber }
      ]
    });
    
    if (existingUser) {
      let field = 'User';
      if (existingUser.username === username) field = 'Username';
      else if (existingUser.idNumber === idNumber) field = 'ID number';
      else if (existingUser.accountNumber === accountNumber) field = 'Account number';
      
      return res.status(400).json({
        success: false,
        message: `${field} already registered`
      });
    }
    
    // Create new customer
    const customer = await Customer.create({
      fullName,
      username,
      idNumber,
      accountNumber,
      password // Will be hashed by pre-save hook
    });
    
    // Generate token
    const token = generateToken(customer._id, 'customer');
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: customer._id,
        fullName: customer.fullName,
        username: customer.username,
        accountNumber: customer.accountNumber,
        role: 'customer'
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Customer Login
 * POST /api/auth/customer/login
 */
export const customerLogin = async (req, res) => {
  try {
    let { username, accountNumber, password } = req.body;

    // Normalize inputs
    username = username?.trim().toLowerCase();
    accountNumber = accountNumber?.trim();

    // Find customer by username only
    const customer = await Customer.findOne({ username }).select('+password');

    // If customer not found or accountNumber mismatch
    if (!customer || customer.accountNumber !== accountNumber) {
      // Optionally increment login attempts if customer exists
      if (customer) await customer.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        attemptsRemaining: Math.max(0, 5 - (customer ? customer.loginAttempts + 1 : 0))
      });
    }

    // Check if account is locked
    if (customer.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.',
        lockUntil: customer.lockUntil
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, customer.password);

    if (!isPasswordValid) {
      await customer.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        attemptsRemaining: Math.max(0, 5 - (customer.loginAttempts + 1))
      });
    }

    // Successful login: reset login attempts
    if (customer.loginAttempts > 0) await customer.resetLoginAttempts();

    // Update last login info
    customer.lastLogin = Date.now();
    customer.lastLoginIP = req.ip || req.connection.remoteAddress;
    await customer.save();

    // Generate token
    const token = generateToken(customer._id, 'customer');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: customer._id,
        fullName: customer.fullName,
        username: customer.username,
        accountNumber: customer.accountNumber,
        role: 'customer'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
};


/**
 * Employee Login
 * POST /api/auth/employee/login
 */
export const employeeLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find employee and include password
    const employee = await Employee.findOne({ username }).select('+password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (employee.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please contact IT support.',
        lockUntil: employee.lockUntil
      });
    }

    // Check if account is active
    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact IT support.'
      });
    }

    // Get client IP (needed even if not using whitelist)
    const clientIP = req.ip || req.connection.remoteAddress;

    // Verify password
    const isPasswordValid = await verifyPassword(password, employee.password);

    if (!isPasswordValid) {
      await employee.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts
    if (employee.loginAttempts > 0) {
      await employee.resetLoginAttempts();
    }

    // Update last login info
    employee.lastLogin = Date.now();
    employee.lastLoginIP = clientIP;
    await employee.save();

    // Generate token
    const token = generateToken(employee._id, 'employee');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: employee._id,
        fullName: employee.fullName,
        username: employee.username,
        role: 'employee',
        employeeRole: employee.role,
        department: employee.department
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
};


/**
 * Logout (invalidate token on client side)
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the logout event for audit purposes
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Get current logged in user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    let user;
    
    if (req.userRole === 'customer') {
      user = await Customer.findById(req.userId);
      if (user) {
        return res.json({
          success: true,
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            accountNumber: user.accountNumber,
            role: 'customer',
            lastLogin: user.lastLogin
          }
        });
      }
    } else if (req.userRole === 'employee') {
      user = await Employee.findById(req.userId);
      if (user) {
        return res.json({
          success: true,
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            role: 'employee',
            employeeRole: user.role,
            department: user.department,
            lastLogin: user.lastLogin
          }
        });
      }
    }
    
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};