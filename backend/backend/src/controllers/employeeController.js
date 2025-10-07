// ============================================================================
// backend/src/controllers/employeeController.js
// ============================================================================

import { Transaction } from '../models/Transaction.js';
import { Employee } from '../models/Employee.js';

/**
 * Get all pending transactions for verification
 * GET /api/employee/transactions/pending
 */
export const getPendingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find({ 
      status: { $in: ['pending', 'verified'] }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('customerId', 'fullName username')
      .populate('verifiedBy', 'fullName employeeId');
    
    const total = await Transaction.countDocuments({ 
      status: { $in: ['pending', 'verified'] }
    });
    
    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      transactions: transactions.map(t => ({
        id: t._id,
        transactionRef: t.transactionRef,
        customer: {
          name: t.customerName,
          accountNumber: t.customerAccountNumber
        },
        amount: t.amount,
        currency: t.currency,
        payeeName: t.payeeName,
        payeeAccountNumber: t.payeeAccountNumber,
        swiftCode: t.swiftCode,
        provider: t.provider,
        status: t.status,
        createdAt: t.createdAt,
        verifiedBy: t.verifiedBy ? {
          name: t.verifiedBy.fullName,
          employeeId: t.verifiedBy.employeeId
        } : null,
        verifiedAt: t.verifiedAt
      }))
    });
    
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions'
    });
  }
};

/**
 * Verify a transaction
 * PUT /api/employee/transactions/:id/verify
 */
export const verifyTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Transaction already ${transaction.status}`
      });
    }
    
    // Update transaction
    transaction.status = 'verified';
    transaction.verifiedBy = req.userId;
    transaction.verifiedAt = Date.now();
    if (notes) {
      transaction.notes = notes;
    }
    
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Transaction verified successfully',
      transaction: {
        id: transaction._id,
        transactionRef: transaction.transactionRef,
        status: transaction.status,
        verifiedAt: transaction.verifiedAt
      }
    });
    
  } catch (error) {
    console.error('Verify transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying transaction'
    });
  }
};

/**
 * Submit verified transactions to SWIFT
 * POST /api/employee/transactions/submit
 */
export const submitToSwift = async (req, res) => {
  try {
    const { transactionIds } = req.body;
    
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide transaction IDs to submit'
      });
    }
    
    // Find all verified transactions
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      status: 'verified'
    });
    
    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No verified transactions found'
      });
    }
    
    // Update all to submitted status
    const updatePromises = transactions.map(t => {
      t.status = 'submitted';
      t.submittedAt = Date.now();
      return t.save();
    });
    
    await Promise.all(updatePromises);
    
    // In production, this is where you would integrate with actual SWIFT API
    // For now, we just mark as submitted
    
    res.json({
      success: true,
      message: `Successfully submitted ${transactions.length} transaction(s) to SWIFT`,
      submittedCount: transactions.length,
      transactions: transactions.map(t => ({
        id: t._id,
        transactionRef: t.transactionRef,
        amount: t.amount,
        currency: t.currency,
        swiftCode: t.swiftCode
      }))
    });
    
  } catch (error) {
    console.error('Submit to SWIFT error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting transactions to SWIFT'
    });
  }
};