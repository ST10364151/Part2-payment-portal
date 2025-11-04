// ============================================================================
// backend/src/controllers/authController.js
// ============================================================================
import bcrypt from 'bcrypt';
import Customer from '../models/Customer.js';
import { Employee } from '../models/Employee.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/passwordUtils.js';
import { generateToken } from '../middleware/auth.js';
import { isIPWhitelisted } from '../utils/validators.js';

/**
 * Customer Login
 * POST /api/auth/customer/login
 */
export const customerLogin = async (req, res) => {
  try {
    let { username, accountNumber, password } = req.body;

    console.log('Customer login attempt:', { username, accountNumber });

    // Normalize inputs
    username = username?.trim().toLowerCase();
    accountNumber = accountNumber?.trim();

    // Find customer by username only
    const customer = await Customer.findOne({ username }).select('+password');

    console.log('Customer found:', customer ? 'Yes' : 'No');

    // If customer not found or accountNumber mismatch
    if (!customer || customer.accountNumber !== accountNumber) {
      console.log('Invalid credentials - customer not found or account mismatch');
      
      if (customer) {
        await customer.incLoginAttempts();
      }

      return res.status(401).json({
        success: false,
        message: customer 
          ? 'Invalid account number for this username' 
          : 'Invalid username',
        attemptsRemaining: customer ? Math.max(0, 5 - (customer.loginAttempts + 1)) : 5
      });
    }

    console.log('Customer and account number match');
    console.log('Account locked:', customer.isLocked);

    // Check if account is locked
    if (customer.isLocked) {
      console.log('Account is locked until:', customer.lockUntil);
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.',
        lockUntil: customer.lockUntil
      });
    }

    // Verify password
    console.log('Verifying password...');
    const isPasswordValid = await verifyPassword(password, customer.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      await customer.incLoginAttempts();
      
      const attemptsRemaining = Math.max(0, 5 - (customer.loginAttempts + 1));

      return res.status(401).json({
        success: false,
        message: 'Invalid password',
        attemptsRemaining
      });
    }

    console.log('Password verified successfully');

    // Successful login: reset login attempts
    if (customer.loginAttempts > 0) {
      await customer.resetLoginAttempts();
    }

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
        role: 'customer',
        requirePasswordChange: customer.requirePasswordChange 
      }
    });

    console.log('Login response sent successfully');

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change Password
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    console.log('Password change request for user:', userId);

    // Find customer
    const customer = await Customer.findById(userId).select('+password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if new password is same as current
    const isSamePassword = await verifyPassword(newPassword, customer.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password and clear requirePasswordChange flag
    customer.password = newPassword;  // Will be hashed by pre-save hook
    customer.requirePasswordChange = false;
    customer.passwordLastChanged = Date.now();
    customer.passwordChangedAt = Date.now();

    await customer.save();

    console.log('Password changed successfully for user:', userId);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    console.log('Employee login attempt:', { username });

    const employee = await Employee.findOne({ username }).select('+password');

    if (!employee) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        attemptsRemaining: 5
      });
    }

    if (employee.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please contact IT support.',
        lockUntil: employee.lockUntil
      });
    }

    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact IT support.'
      });
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    if (employee.whitelistedIPs && employee.whitelistedIPs.length > 0) {
      if (!isIPWhitelisted(clientIP, employee.whitelistedIPs)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied from this IP address' 
        });
      }
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      await employee.incLoginAttempts();
      
      const attemptsRemaining = Math.max(0, 5 - (employee.loginAttempts + 1));
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password',
        attemptsRemaining
      });
    }

    if (employee.loginAttempts > 0) {
      await employee.resetLoginAttempts();
    }

    employee.lastLogin = Date.now();
    employee.lastLoginIP = clientIP;
    await employee.save();

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
    res.status(500).json({ success: false, message: 'Error during login' });
  }
};

/**
 * Logout (invalidate token on client side)
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
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
            requirePasswordChange: user.requirePasswordChange,
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