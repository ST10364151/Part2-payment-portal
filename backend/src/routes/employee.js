import express from 'express';
import { 
  getPendingTransactions,
  verifyTransaction,
  submitToSwift
} from '../controllers/employeeController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validateTransactionId } from '../middleware/inputValidation.js';

const routerEmp = express.Router();

// All routes require authentication
routerEmp.use(protect);
routerEmp.use(restrictTo('employee'));

// Transaction management routes
routerEmp.get('/transactions/pending', getPendingTransactions);
routerEmp.put('/transactions/:id/verify', validateTransactionId, verifyTransaction);
routerEmp.post('/transactions/submit', submitToSwift);

// Export the router as default
export default routerEmp;
