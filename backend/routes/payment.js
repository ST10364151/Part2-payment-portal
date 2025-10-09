const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const {
  validatePayment,
  authenticateToken,
  paymentRateLimiter
} = require('../middleware/security');

// Submit payment with rate limiting and comprehensive validation
router.post('/submit',
  paymentRateLimiter,
  authenticateToken,
  validatePayment,
  async (req, res, next) => {
    try {
      console.log(`[PAYMENT] Submission from user: ${req.user.userId}`);
      
      const { amount, currency, provider, payeeAccountNumber, swiftCode } = req.body;
      
      // Additional business logic validation
      const parsedAmount = parseFloat(amount);
      
      if (parsedAmount <= 0) {
        return res.status(400).json({
          error: 'Amount must be greater than zero'
        });
      }
      
      if (parsedAmount > 1000000) {
        return res.status(400).json({
          error: 'Amount exceeds maximum limit of 1,000,000'
        });
      }
      
      // Create transaction
      const transaction = new Transaction({
        userId: req.user.userId,
        amount: parsedAmount,
        currency: currency.toUpperCase(),
        provider: provider || 'SWIFT',
        payeeAccountNumber: payeeAccountNumber.trim(),
        swiftCode: swiftCode.toUpperCase().trim(),
        status: 'pending'
      });
      
      await transaction.save();
      
      console.log(`[PAYMENT] Success - Transaction ID: ${transaction._id}`);
      
      res.status(201).json({
        message: 'Payment submitted successfully',
        transactionId: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency
      });
      
    } catch (error) {
      console.error(`[PAYMENT] Error:`, error);
      next(error);
    }
  }
);

// Get user's transactions with pagination
router.get('/my-transactions',
  authenticateToken,
  async (req, res, next) => {
    try {
      console.log(`[TRANSACTIONS] Fetching for user: ${req.user.userId}`);
      
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
      const skip = (page - 1) * limit;
      
      const transactions = await Transaction.find({
        userId: req.user.userId
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v') // Exclude version key
        .lean(); // Return plain JavaScript objects
      
      const total = await Transaction.countDocuments({
        userId: req.user.userId
      });
      
      console.log(`[TRANSACTIONS] Found ${transactions.length} transactions`);
      
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
      console.error(`[TRANSACTIONS] Error:`, error);
      next(error);
    }
  }
);

module.exports = router;
