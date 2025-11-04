// ============================================================================
// backend/src/models/Customer.js
// ============================================================================
import mongoose from 'mongoose';
import { hashPassword } from '../utils/passwordUtils.js';

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    unique: true,
    length: 13
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
    minlength: 8,
    maxlength: 16
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  
  // NEW: Track which employee created this account
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false
  },
  
  // Flag for first login password change
  requirePasswordChange: {
    type: Boolean,
    default: true  // Set to true when employee creates account
  },
  
  // Track when password was last changed
  passwordLastChanged: {
    type: Date,
    default: Date.now
  },
  
  // Security fields
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: { 
    type: Date 
  },
  passwordChangedAt: { 
    type: Date 
  },
  passwordResetToken: { 
    type: String 
  },
  passwordResetExpires: { 
    type: Date 
  },
  lastLogin: { 
    type: Date 
  },
  lastLoginIP: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Virtual for locked accounts
customerSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await hashPassword(this.password);
    this.passwordChangedAt = Date.now() - 1000;
    this.passwordLastChanged = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

// Increment login attempts
customerSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ 
      $set: { loginAttempts: 1 }, 
      $unset: { lockUntil: 1 } 
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000;
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
customerSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({ 
    $set: { loginAttempts: 0 }, 
    $unset: { lockUntil: 1 } 
  });
};

export default mongoose.model('Customer', customerSchema);