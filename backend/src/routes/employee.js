const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateEmployee } = require('../middleware/auth');
const rateLimiting = require('../middleware/rateLimiting');

// Login route (NO REGISTRATION ROUTE)
router.post('/login', rateLimiting, employeeController.loginEmployee);

// Protected routes
router.get('/profile', authenticateEmployee, employeeController.getEmployeeProfile);
router.get('/all', authenticateEmployee, employeeController.getAllEmployees);

module.exports = router;