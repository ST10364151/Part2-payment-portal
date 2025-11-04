// ============================================================================
// backend/src/controllers/employeeController.js (UPDATED - Accept username & accountNumber)
// ============================================================================

import { Transaction } from '../models/Transaction.js';
import { Employee } from '../models/Employee.js';
import Customer from '../models/Customer.js';
import { validatePasswordStrength } from '../utils/passwordUtils.js';
import { validateSAIDNumber } from '../utils/validators.js';

/**
 * Get all pending transactions for verification
 * GET /api/employee/transactions/pending
 */
export const getPendingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query - if status is provided, filter by it, otherwise show all
    const query = status ? { status } : { status: { $in: ['pending', 'verified', 'submitted'] } };
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(parseInt(limit))
      .skip(skip)
      .populate('customerId', 'fullName username accountNumber')
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
        customerName: t.customerName,
        customerAccountNumber: t.customerAccountNumber,
        customer: t.customerId ? {
          name: t.customerId.fullName,
          accountNumber: t.customerId.accountNumber
        } : null,
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
        verifiedAt: t.verifiedAt,
        submittedAt: t.submittedAt
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

/**
 * Create Customer Account 
 * POST /api/employee/create-customer
 */
export const createCustomerAccount = async (req, res) => {
  try {
    const { fullName, username, idNumber, accountNumber, password } = req.body;
    
    console.log('👤 Employee creating customer account:', { 
      employeeId: req.userId, 
      employeeRole: req.user.role,
      customerName: fullName,
      username,
      accountNumber
    });
    
    // Check employee role (only managers and admins can create accounts)
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Managers and Admins can create customer accounts'
      });
    }
    
    // Validate SA ID Number with Luhn algorithm
    if (!validateSAIDNumber(idNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid South African ID number'
      });
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }
    
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ username }, { idNumber }, { accountNumber }]
    });
    
    if (existingCustomer) {
      let field = 'User';
      if (existingCustomer.username === username) field = 'Username';
      else if (existingCustomer.idNumber === idNumber) field = 'ID number';
      else if (existingCustomer.accountNumber === accountNumber) field = 'Account number';
      
      return res.status(400).json({
        success: false,
        message: `${field} already registered`
      });
    }
    
    // Create customer account
    const customer = await Customer.create({
      fullName,
      username,
      idNumber,
      accountNumber,
      password, // Will be hashed by pre-save hook
      createdBy: req.userId,
      isActive: true
    });
    
    // Log account creation for audit trail
    console.log('Customer account created:', {
      customerId: customer._id,
      accountNumber: customer.accountNumber,
      username: customer.username,
      createdBy: req.user.fullName,
      employeeId: req.user.employeeId,
      timestamp: new Date().toISOString()
    });
    
    // Return account details (to give to customer)
    res.status(201).json({
      success: true,
      message: 'Customer account created successfully',
      account: {
        fullName: customer.fullName,
        username: customer.username,
        accountNumber: customer.accountNumber,
        idNumber: customer.idNumber,
        createdAt: customer.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create customer account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Account Creation Audit Log (Admin only)
 * GET /api/employee/account-creation-log
 */
export const getAccountCreationLog = async (req, res) => {
  try {
    // Only admins can view full audit log
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Admins can view account creation logs'
      });
    }
    
    const customers = await Customer.find()
      .select('fullName username accountNumber createdBy createdAt')
      .populate('createdBy', 'fullName employeeId role')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: customers.length,
      accounts: customers.map(c => ({
        customerId: c._id,
        fullName: c.fullName,
        username: c.username,
        accountNumber: c.accountNumber,
        createdBy: c.createdBy ? {
          name: c.createdBy.fullName,
          employeeId: c.createdBy.employeeId,
          role: c.createdBy.role
        } : null,
        createdAt: c.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get account creation log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching account creation log'
    });
  }
};