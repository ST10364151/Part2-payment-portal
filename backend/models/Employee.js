const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'verifier', 'manager'],
        default: 'verifier'
    },
    salt: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password with salt AND pepper before saving
employeeSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        console.log('🔐 Hashing employee password for:', this.employeeId);
        
        // Step 1: Add pepper
        const pepper = process.env.PASSWORD_PEPPER || 'default-pepper-change-in-production';
        const pepperedPassword = this.password + pepper;
        
        // Step 2: Generate salt
        this.salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS || 12));
        
        // Step 3: Hash peppered password with salt
        this.password = await bcrypt.hash(pepperedPassword, this.salt);
        
        console.log('✅ Employee password hashed successfully with salt + pepper');
        next();
    } catch (error) {
        console.error('❌ Employee password hashing error:', error);
        next(error);
    }
});

// Compare password with salt AND pepper
employeeSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('🔍 Comparing employee passwords...');
        
        // Add pepper before comparing
        const pepper = process.env.PASSWORD_PEPPER || 'default-pepper-change-in-production';
        const pepperedPassword = candidatePassword + pepper;
        
        // Compare peppered password with stored hash
        const result = await bcrypt.compare(pepperedPassword, this.password);
        
        console.log('🔎 Employee password comparison result:', result);
        return result;
    } catch (error) {
        console.error('❌ Employee password comparison error:', error);
        return false;
    }
};

module.exports = mongoose.model('Employee', employeeSchema);
