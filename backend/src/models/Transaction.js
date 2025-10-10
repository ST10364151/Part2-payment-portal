// ============================================================================
// backend/src/models/Transaction.js
// ============================================================================
import mongoose from 'mongoose';
const transactionSchema = new mongoose.Schema({
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerAccountNumber: {
      type: String,
      required: true
    },
    // Payment details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      max: [999999999.99, 'Amount too large']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      length: 3
    },
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      uppercase: true,
      default: 'SWIFT'
    },
    // Payee details
    payeeName: {
      type: String,
      required: [true, 'Payee name is required']
    },
    payeeAccountNumber: {
      type: String,
      required: [true, 'Payee account number is required']
    },
    swiftCode: {
      type: String,
      required: [true, 'SWIFT code is required'],
      uppercase: true,
      minlength: 8,
      maxlength: 11
    },
    // Transaction status
    status: {
      type: String,
      enum: ['pending', 'verified', 'submitted', 'completed', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    verifiedAt: {
      type: Date
    },
    submittedAt: {
      type: Date
    },
    // Audit trail
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    notes: {
      type: String,
      maxlength: 500
    }
  }, {
    timestamps: true
  });
  
  // Indexes for querying
  //transactionSchema.index({ customerId: 1, createdAt: -1 });
  //transactionSchema.index({ status: 1, createdAt: -1 });
  //transactionSchema.index({ swiftCode: 1 });
  
  // Virtual for transaction reference
  transactionSchema.virtual('transactionRef').get(function() {
    return `TXN${this._id.toString().slice(-8).toUpperCase()}`;
  });
  
  // Ensure virtuals are included in JSON
  transactionSchema.set('toJSON', { virtuals: true });
  transactionSchema.set('toObject', { virtuals: true });
  
  export const Transaction = mongoose.model('Transaction', transactionSchema);