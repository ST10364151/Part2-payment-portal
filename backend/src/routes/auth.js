// ============================================================================
// backend/src/routes/auth.js
// ============================================================================
import express from 'express';
import {
  customerLogin,
  employeeLogin,
  changePassword,
  logout,
  getCurrentUser
} from '../controllers/authController.js';
import {
  validateLogin,
  validateEmployeeLogin
} from '../middleware/inputValidation.js';
import { loginLimiter } from '../middleware/rateLimiting.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/customer/login', validateLogin, loginLimiter, customerLogin);

// Employee routes
router.post('/employee/login', validateEmployeeLogin, loginLimiter, employeeLogin);

// Change password 
router.post('/change-password', protect, changePassword);

// Common routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);

export default router;