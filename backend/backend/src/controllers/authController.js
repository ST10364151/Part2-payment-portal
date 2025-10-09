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


// /**
//  * Employee Login
//  * POST /api/auth/employee/login
//  */
export const employeeLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('📝 Login attempt:', { username });

    // Find employee and include password
    const employee = await Employee.findOne({ username }).select('+password');

    if (!employee) {
      console.log('❌ Employee not found for username:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('✅ Employee found:', { id: employee._id, username: employee.username });

    // Check if account is locked
    if (employee.isLocked) {
      console.log('🔒 Account locked:', { username, lockUntil: employee.lockUntil });
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please contact IT support.',
        lockUntil: employee.lockUntil
      });
    }

    // Check if account is active
    if (!employee.isActive) {
      console.log('⛔ Account inactive:', username);
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact IT support.'
      });
    }

    // Get client IP
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log('🌐 Client IP:', clientIP);

    // Optional: skip whitelist check for debugging
    if (employee.whitelistedIPs && employee.whitelistedIPs.length > 0) {
      console.log('🔑 Employee whitelist:', employee.whitelistedIPs);
      if (!isIPWhitelisted(clientIP, employee.whitelistedIPs)) {
        console.log('❌ IP not whitelisted:', clientIP);
        return res.status(403).json({ success: false, message: 'IP not allowed' });
      }
    }

    // Verify password
    //const isPasswordValid = await verifyPassword(password, employee.password);
    const isPasswordValid = await bcrypt.compare(password, employee.password); // no pepper
    console.log('🔐 Stored hash:', employee.password);
    console.log('🔐 Password check result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for username:', username);
      await employee.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('✅ Password verified for username:', username);

    // Reset login attempts if needed
    if (employee.loginAttempts > 0) {
      await employee.resetLoginAttempts();
      console.log('🔄 Login attempts reset for username:', username);
    }

    // Update last login info
    employee.lastLogin = Date.now();
    employee.lastLoginIP = clientIP;
    await employee.save();
    console.log('🕒 Last login updated:', { lastLogin: employee.lastLogin, lastLoginIP: employee.lastLoginIP });

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
    console.error('❌ Employee login error:', error);
    res.status(500).json({ success: false, message: 'Error during login' });
  }
};


/**
 * DEBUG Employee Login
 * POST /api/auth/employee/login/debug
 */
export const employeeLoginDebug = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔍 DEBUG: Login attempt');
    console.log('Username:', username);
    console.log('Password received:', password);
    console.log('Pepper (first 20):', process.env.PASSWORD_PEPPER?.substring(0, 20));

    const employee = await Employee.findOne({ username }).select('+password');

    if (!employee) {
      console.log('❌ Employee not found');
      return res.status(401).json({
        success: false,
        message: 'Employee not found in database'
      });
    }

    console.log('✓ Employee found:', employee.username);
    console.log('Stored hash (first 40):', employee.password.substring(0, 40));
    
    // Manual verification test
    const { verifyPassword } = await import('../utils/passwordUtils.js');
    const isPasswordValid = await verifyPassword(password, employee.password);
    
    console.log('Password valid:', isPasswordValid);

    return res.json({
      success: isPasswordValid,
      message: isPasswordValid ? 'Password correct' : 'Password incorrect',
      debug: {
        username: employee.username,
        employeeId: employee.employeeId,
        hashPrefix: employee.password.substring(0, 40),
        pepperLoaded: !!process.env.PASSWORD_PEPPER,
        passwordVerificationResult: isPasswordValid
      }
    });

  } catch (error) {
    console.error('Debug login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during debug login',
      error: error.message
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