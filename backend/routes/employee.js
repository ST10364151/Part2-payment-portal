const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const Transaction = require('../models/Transaction');
const {
  validateEmployeeLogin,
  authenticateToken
} = require('../middleware/security');
const ExpressBrute = require('express-brute');

// Brute force protection ONLY for employee login
const store = new ExpressBrute.MemoryStore();
const employeeBruteforce = new ExpressBrute(store, {
  freeRetries: 3,
  minWait: 10 * 60 * 1000, // 10 minutes
  maxWait: 2 * 60 * 60 * 1000, // 2 hours
  lifetime: 24 * 60 * 60, // 24 hours
  failCallback: (req, res, next, nextValidRequestDate) => {
    console.log(`[EMPLOYEE] Brute force protection triggered for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many failed login attempts. Account temporarily locked.',
      retryAfter: new Date(nextValidRequestDate).toISOString()
    });
  }
});

// Employee authentication middleware
const authenticateEmployee = (req, res, next) => {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    
    if (!req.user.employeeId || req.user.type !== 'employee') {
      console.log(`[EMPLOYEE] Unauthorized access attempt`);
      return res.status(403).json({
        error: 'Access denied. Employee credentials required.'
      });
    }
    
    next();
  });
};

// Employee login with brute force protection
router.post('/login',
  employeeBruteforce.prevent,
  validateEmployeeLogin,
  async (req, res, next) => {
    try {
      console.log(`[EMPLOYEE LOGIN] Attempt from IP: ${req.ip}`);
      console.log(`[EMPLOYEE LOGIN] Employee ID: ${req.body.employeeId}`);

      const { employeeId, password } = req.body;
      
      const employee = await Employee.findOne({
        employeeId: employeeId.toUpperCase().trim()
      });
      
      if (!employee) {
        console.log(`[EMPLOYEE LOGIN] Failed - Employee not found`);
        return res.status(401).json({
          error: 'Invalid employee credentials'
        });
      }
      
      console.log(`[EMPLOYEE LOGIN] Employee found - Name: ${employee.fullName}`);
      
      const isValidPassword = await employee.comparePassword(password);
      
      if (!isValidPassword) {
        console.log(`[EMPLOYEE LOGIN] Failed - Invalid password`);
        return res.status(401).json({
          error: 'Invalid employee credentials'
        });
      }
      
      console.log(`[EMPLOYEE LOGIN] Password verified`);
      
      const tokenPayload = {
        employeeId: employee._id,
        employeeIdNum: employee.employeeId,
        role: employee.role,
        iat: Math.floor(Date.now() / 1000),
        type: 'employee'
      };
      
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        {
          expiresIn: '8h',
          issuer: 'secure-bank-api',
          audience: 'secure-bank-employee'
        }
      );
      
      console.log(`[EMPLOYEE LOGIN] Success - Token generated for: ${employee.fullName}`);
      
      if (req.brute && req.brute.reset) {
        req.brute.reset();
      }
      
      res.json({
        message: 'Login successful',
        token,
        expiresIn: 28800,
        employee: {
          id: employee._id,
          fullName: employee.fullName,
          employeeId: employee.employeeId,
          email: employee.email,
          role: employee.role
        }
      });
      
    } catch (error) {
      console.error(`[EMPLOYEE LOGIN] Error:`, error);
      next(error);
    }
  }
);

// Get pending transactions (NO rate limiting)
router.get('/transactions/pending',
  authenticateEmployee,
  async (req, res, next) => {
    try {
      console.log(`[EMPLOYEE] Fetching pending transactions - Employee: ${req.user.employeeIdNum}`);
      
      const transactions = await Transaction.find({
        status: 'pending'
      })
        .populate('userId', 'fullName accountNumber')
        .sort({ createdAt: -1 })
        .lean();
      
      console.log(`[EMPLOYEE] Found ${transactions.length} pending transactions`);
      
      res.json({
        transactions,
        count: transactions.length
      });
      
    } catch (error) {
      console.error(`[EMPLOYEE] Error fetching pending transactions:`, error);
      next(error);
    }
  }
);

// Get all transactions (NO rate limiting)
router.get('/transactions/all',
  authenticateEmployee,
  async (req, res, next) => {
    try {
      console.log(`[EMPLOYEE] Fetching all transactions - Employee: ${req.user.employeeIdNum}`);
      
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const skip = (page - 1) * limit;
      
      const transactions = await Transaction.find()
        .populate('userId', 'fullName accountNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await Transaction.countDocuments();
      
      console.log(`[EMPLOYEE] Found ${transactions.length} transactions`);
      
      res.json({
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error(`[EMPLOYEE] Error fetching transactions:`, error);
      next(error);
    }
  }
);

// Verify/Approve transaction
router.patch('/transactions/:id/verify',
  authenticateEmployee,
  async (req, res, next) => {
    try {
      const transactionId = req.params.id;
      
      console.log(`[EMPLOYEE] Verifying transaction ${transactionId} - Employee: ${req.user.employeeIdNum}`);
      
      if (!transactionId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          error: 'Invalid transaction ID format'
        });
      }
      
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        console.log(`[EMPLOYEE] Transaction not found: ${transactionId}`);
        return res.status(404).json({
          error: 'Transaction not found'
        });
      }
      
      if (transaction.status !== 'pending') {
        console.log(`[EMPLOYEE] Transaction already processed: ${transaction.status}`);
        return res.status(400).json({
          error: `Transaction already ${transaction.status}`,
          currentStatus: transaction.status
        });
      }
      
      transaction.status = 'verified';
      transaction.verifiedBy = req.user.employeeId;
      transaction.verifiedAt = new Date();
      
      await transaction.save();
      
      console.log(`[EMPLOYEE] Transaction verified successfully: ${transactionId}`);
      
      res.json({
        message: 'Transaction verified successfully',
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          verifiedAt: transaction.verifiedAt
        }
      });
      
    } catch (error) {
      console.error(`[EMPLOYEE] Error verifying transaction:`, error);
      next(error);
    }
  }
);

// Submit transactions to SWIFT (bulk operation)
router.post('/transactions/submit-swift',
  authenticateEmployee,
  async (req, res, next) => {
    try {
      const { transactionIds } = req.body;
      
      console.log(`[EMPLOYEE] SWIFT submission - Employee: ${req.user.employeeIdNum}`);
      console.log(`[EMPLOYEE] Submitting ${transactionIds?.length || 0} transactions`);
      
      if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
        return res.status(400).json({
          error: 'Transaction IDs array is required'
        });
      }
      
      if (transactionIds.length > 100) {
        return res.status(400).json({
          error: 'Cannot submit more than 100 transactions at once'
        });
      }
      
      const invalidIds = transactionIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          error: 'Invalid transaction ID format',
          invalidIds
        });
      }
      
      const transactions = await Transaction.find({
        _id: { $in: transactionIds },
        status: 'verified'
      });
      
      if (transactions.length === 0) {
        return res.status(404).json({
          error: 'No verified transactions found with the provided IDs'
        });
      }
      
      if (req.user.role !== 'admin' && req.user.role !== 'verifier') {
        console.log(`[EMPLOYEE] Insufficient permissions - Role: ${req.user.role}`);
        return res.status(403).json({
          error: 'Insufficient permissions to submit to SWIFT'
        });
      }
      
      const updateResult = await Transaction.updateMany(
        {
          _id: { $in: transactions.map(t => t._id) },
          status: 'verified'
        },
        {
          $set: {
            status: 'submitted',
            submittedBy: req.user.employeeId,
            submittedAt: new Date()
          }
        }
      );
      
      console.log(`[EMPLOYEE] SWIFT submission complete - Updated: ${updateResult.modifiedCount} transactions`);
      
      res.json({
        message: `Successfully submitted ${updateResult.modifiedCount} transactions to SWIFT`,
        submittedCount: updateResult.modifiedCount,
        totalRequested: transactionIds.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`[EMPLOYEE] Error submitting to SWIFT:`, error);
      next(error);
    }
  }
);

// Get employee dashboard statistics
router.get('/dashboard/stats',
  authenticateEmployee,
  async (req, res, next) => {
    try {
      console.log(`[EMPLOYEE] Fetching dashboard stats - Employee: ${req.user.employeeIdNum}`);
      
      const [
        pendingCount,
        verifiedCount,
        submittedCount,
        totalAmount
      ] = await Promise.all([
        Transaction.countDocuments({ status: 'pending' }),
        Transaction.countDocuments({ status: 'verified' }),
        Transaction.countDocuments({ status: 'submitted' }),
        Transaction.aggregate([
          { $match: { status: { $in: ['pending', 'verified', 'submitted'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);
      
      res.json({
        statistics: {
          pending: pendingCount,
          verified: verifiedCount,
          submitted: submittedCount,
          totalAmount: totalAmount[0]?.total || 0
        },
        employee: {
          name: req.user.employeeIdNum,
          role: req.user.role
        }
      });
      
    } catch (error) {
      console.error(`[EMPLOYEE] Error fetching stats:`, error);
      next(error);
    }
  }
);

module.exports = router;
