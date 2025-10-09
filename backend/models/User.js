const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    idNumber: {
        type: String,
        required: true,
        unique: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password with salt AND pepper before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        console.log('🔐 Hashing password for user:', this.username);
        
        // Step 1: Add pepper (from environment variable)
        const pepper = process.env.PASSWORD_PEPPER || 'default-pepper-change-in-production';
        const pepperedPassword = this.password + pepper;
        
        // Step 2: Generate unique salt (12 rounds = 2^12 iterations)
        this.salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS || 12));
        
        // Step 3: Hash peppered password with salt
        this.password = await bcrypt.hash(pepperedPassword, this.salt);
        
        console.log('✅ Password hashed successfully with salt + pepper');
        next();
    } catch (error) {
        console.error('❌ Password hashing error:', error);
        next(error);
    }
});

// Compare password with salt AND pepper
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('🔍 Comparing passwords...');
        
        // Add pepper before comparing
        const pepper = process.env.PASSWORD_PEPPER || 'default-pepper-change-in-production';
        const pepperedPassword = candidatePassword + pepper;
        
        // Compare peppered password with stored hash
        const result = await bcrypt.compare(pepperedPassword, this.password);
        
        console.log('🔎 Password comparison result:', result);
        return result;
    } catch (error) {
        console.error('❌ Password comparison error:', error);
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);
