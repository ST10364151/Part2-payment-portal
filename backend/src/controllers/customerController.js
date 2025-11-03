// ============================================================================
// backend/src/controllers/customerController.js
// ============================================================================

import { Transaction } from '../models/Transaction.js';
import Customer from '../models/Customer.js';

/**
 * Create International Payment
 * POST /api/customer/payment
 */
export const createPayment = async (req, res) => {
  try {
    const { amount, currency, provider, payeeAccountNumber, swiftCode, payeeName } = req.body;
    
    // Get customer details
    const customer = await Customer.findById(req.userId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      customerId: customer._id,
      customerName: customer.fullName,
      customerAccountNumber: customer.accountNumber,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      provider: provider.toUpperCase(),
      payeeName,
      payeeAccountNumber,
      swiftCode: swiftCode.toUpperCase(),
      status: 'pending',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully and sent for verification',
      transaction: {
        id: transaction._id,
        transactionRef: transaction.transactionRef,
        amount: transaction.amount,
        currency: transaction.currency,
        payeeName: transaction.payeeName,
        status: transaction.status,
        createdAt: transaction.createdAt
      }
    });
    
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get customer's own transactions
 * GET /api/customer/transactions
 */
export const getMyTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { customerId: req.userId };
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('verifiedBy', 'fullName employeeId');
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      transactions: transactions.map(t => ({
        id: t._id,
        transactionRef: t.transactionRef,
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
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions'
    });
  }
};