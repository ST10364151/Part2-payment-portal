// ============================================================================
// backend/src/routes/employee.js
// ============================================================================
import express from 'express';
import { 
  getPendingTransactions,
  verifyTransaction,
  submitToSwift,
  createCustomerAccount,
  getAccountCreationLog
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

// Customer account creation (Manager/Admin only)
routerEmp.post('/create-customer', createCustomerAccount);

// Account creation audit log (Admin only)
routerEmp.get('/account-creation-log', getAccountCreationLog);

export default routerEmp;