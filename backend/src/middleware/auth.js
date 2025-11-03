const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Authenticate employee
exports.authenticateEmployee = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find employee
    const employee = await Employee.findById(decoded.id).select('-password');

    if (!employee || !employee.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Employee not found or inactive' 
      });
    }

    // Attach employee to request
    req.employee = {
      id: employee._id,
      username: employee.username,
      employeeId: employee.employeeId,
      role: employee.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};