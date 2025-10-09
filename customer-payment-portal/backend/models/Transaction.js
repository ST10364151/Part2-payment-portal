const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0'],
    max: [1000000, 'Amount cannot exceed 1,000,000']
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'CNY', 'AUD', 'CAD'],
    default: 'USD'
  },
  provider: {
    type: String,
    required: true,
    default: 'SWIFT'
  },
  payeeAccountNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10,16}$/.test(v);
      },
      message: 'Invalid payee account number format'
    }
  },
  swiftCode: {
    type: String,
    required: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v);
      },
      message: 'Invalid SWIFT code format'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'submitted', 'failed'],
    default: 'pending',
    index: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  submittedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound indexes for common queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ verifiedBy: 1, verifiedAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
