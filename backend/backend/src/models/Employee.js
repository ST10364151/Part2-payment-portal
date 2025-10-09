// backend/src/models/Employee.js
import mongoose from 'mongoose';
import { hashPassword } from '../utils/passwordUtils.js';

const employeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'verifier', 'manager'],
    default: 'verifier'
  },
  department: {
    type: String,
    default: 'International Payments'
  },
  // Security features
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
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
  },
  whitelistedIPs: [{
    type: String
  }]
}, {
  timestamps: true
});

// Virtual for account lock check
employeeSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

//Hash password before saving (using passwordUtils with pepper support)
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Use the hashPassword from passwordUtils.js (includes pepper)
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Login attempt methods
employeeSchema.methods.incLoginAttempts = function() {
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

employeeSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

export const Employee = mongoose.model('Employee', employeeSchema);