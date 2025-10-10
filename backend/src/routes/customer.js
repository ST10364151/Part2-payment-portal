// backend/src/routes/customer.js
import express from 'express';
import { 
  createPayment, 
  getMyTransactions 
} from '../controllers/customerController.js';
import { validatePayment } from '../middleware/inputValidation.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimiting.js';


const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(restrictTo('customer'));

// Payment routes
router.post('/payment', validatePayment, paymentLimiter, createPayment);
router.get('/transactions', getMyTransactions);

export default router;