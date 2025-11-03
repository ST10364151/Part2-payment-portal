const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// Login employee (NO REGISTRATION ENDPOINT)
exports.loginEmployee = async (req, res) => {
  try {
    const { username, employeeId, password } = req.body;

    // Input validation with RegEx
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const employeeIdRegex = /^EMP[0-9]{3,6}$/;

    if (!username || !employeeId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Whitelist validation
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid username format' 
      });
    }

    if (!employeeIdRegex.test(employeeId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid employee ID format' 
      });
    }

    // Find employee by username and employeeId
    const employee = await Employee.findOne({ 
      username, 
      employeeId,
      isActive: true 
    });

    if (!employee) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isPasswordValid = await employee.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: employee._id, 
        username: employee.username,
        employeeId: employee.employeeId,
        role: employee.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      employee: {
        id: employee._id,
        username: employee.username,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department,
        role: employee.role
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// Get employee profile
exports.getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    res.status(200).json({
      success: true,
      employee
    });

  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all employees (admin only)
exports.getAllEmployees = async (req, res) => {
  try {
    // Check if user is admin
    if (req.employee.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const employees = await Employee.find({ isActive: true }).select('-password');
    
    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });

  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};