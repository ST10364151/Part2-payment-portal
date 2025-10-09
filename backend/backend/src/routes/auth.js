// backend/src/routes/auth.js
import express from 'express';
import {
  customerRegister,
  customerLogin,
  employeeLogin,
  employeeLoginDebug,
  logout,
  getCurrentUser
} from '../controllers/authController.js';

import {
  validateCustomerRegistration,
  validateLogin,
  validateEmployeeLogin
} from '../middleware/inputValidation.js';

// Use the new rate-limit middleware names exported from rateLimiting.js
import { loginLimiter } from '../middleware/rateLimiting.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/customer/register', validateCustomerRegistration, customerRegister);
router.post('/customer/login', validateLogin, loginLimiter, customerLogin);


// Employee routes
router.post('/employee/login', validateEmployeeLogin, loginLimiter, employeeLogin);


// Common routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);

export default router;