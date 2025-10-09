// backend/src/scripts/debugAuth.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from '../models/Employee.js';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';

dotenv.config();

console.log('═══════════════════════════════════════════════════════');
console.log('           AUTHENTICATION DEBUG SCRIPT');
console.log('═══════════════════════════════════════════════════════\n');

// Step 1: Check environment variables
console.log('1️⃣  ENVIRONMENT VARIABLES');
console.log('─────────────────────────────────────────────────────');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ Missing');
console.log('PASSWORD_PEPPER:', process.env.PASSWORD_PEPPER ? '✓ Loaded' : '✗ Missing');
console.log('Pepper value:', process.env.PASSWORD_PEPPER?.substring(0, 20) + '...');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ Missing');
console.log('SALT_ROUNDS:', process.env.SALT_ROUNDS || '(using default: 12)');

// Step 2: Test password hashing
console.log('\n2️⃣  PASSWORD HASHING TEST');
console.log('─────────────────────────────────────────────────────');

const testPassword = 'SecureEmpPass123!';
console.log('Test password:', testPassword);

const runTests = async () => {
  try {
    // Hash the password
    const hash1 = await hashPassword(testPassword);
    console.log('Hash created:', hash1.substring(0, 60) + '...');
    
    // Verify the password
    const isValid = await verifyPassword(testPassword, hash1);
    console.log('Verification:', isValid ? '✓ SUCCESS' : '✗ FAILED');
    
    if (!isValid) {
      console.error('❌ CRITICAL: Password verification failed!');
      console.error('   This means your pepper is inconsistent.');
      process.exit(1);
    }

    // Step 3: Connect to database
    console.log('\n3️⃣  DATABASE CONNECTION');
    console.log('─────────────────────────────────────────────────────');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Step 4: Check existing employee
    console.log('\n4️⃣  EXISTING EMPLOYEE CHECK');
    console.log('─────────────────────────────────────────────────────');
    
    const existingEmployee = await Employee.findOne({ username: 'john_smith' }).select('+password');
    
    if (existingEmployee) {
      console.log('✓ Employee found in database');
      console.log('  Username:', existingEmployee.username);
      console.log('  Employee ID:', existingEmployee.employeeId);
      console.log('  Stored hash:', existingEmployee.password?.substring(0, 60) + '...');
      
      // Test if current pepper can verify stored password
      console.log('\n5️⃣  PASSWORD VERIFICATION TEST');
      console.log('─────────────────────────────────────────────────────');
      console.log('Testing password:', testPassword);
      
      const canVerify = await verifyPassword(testPassword, existingEmployee.password);
      console.log('Result:', canVerify ? '✓ SUCCESS' : '✗ FAILED');
      
      if (!canVerify) {
        console.log('\n❌ PROBLEM IDENTIFIED:');
        console.log('   The stored password was hashed with a DIFFERENT pepper!');
        console.log('💡 SOLUTION: Delete and recreate the employee.\n');
        
        await Employee.deleteOne({ username: 'john_smith' });
        console.log('✓ Old employee deleted');
        
        console.log('\n6️⃣  CREATING NEW EMPLOYEE');
        console.log('─────────────────────────────────────────────────────');
        
        const newEmployee = await Employee.create({
          fullName: 'John Smith',
          username: 'john_smith',
          employeeId: 'EMP001',
          password: testPassword,
          role: 'verifier',
          department: 'International Payments'
        });
        
        console.log('✓ New employee created');
        console.log('  ID:', newEmployee._id);
        
        // Verify the new employee
        console.log('\n7️⃣  VERIFICATION OF NEW EMPLOYEE');
        console.log('─────────────────────────────────────────────────────');
        
        const freshEmployee = await Employee.findOne({ username: 'john_smith' }).select('+password');
        const finalTest = await verifyPassword(testPassword, freshEmployee.password);
        
        console.log('Final verification:', finalTest ? '✓ SUCCESS' : '✗ FAILED');
        
        if (finalTest) {
          console.log('\n✅ ALL TESTS PASSED!');
          console.log('─────────────────────────────────────────────────────');
          console.log('📝 Login credentials:');
          console.log('   Username: john_smith');
          console.log('   Password: SecureEmpPass123!');
          console.log('\n🔐 You can now login via Postman!');
        } else {
          console.log('\n❌ STILL FAILED - Check your passwordUtils.js file');
        }
      } else {
        console.log('\n✅ AUTHENTICATION IS WORKING CORRECTLY!');
        console.log('─────────────────────────────────────────────────────');
        console.log('📝 Login credentials:');
        console.log('   Username: john_smith');
        console.log('   Password: SecureEmpPass123!');
      }
      
    } else {
      console.log('✗ No employee found');
      console.log('\n6️⃣  CREATING NEW EMPLOYEE');
      console.log('─────────────────────────────────────────────────────');
      
      const newEmployee = await Employee.create({
        fullName: 'John Smith',
        username: 'john_smith',
        employeeId: 'EMP001',
        password: testPassword,
        role: 'verifier',
        department: 'International Payments'
      });
      
      console.log('✓ Employee created:', newEmployee._id);
      
      const freshEmployee = await Employee.findOne({ username: 'john_smith' }).select('+password');
      const verification = await verifyPassword(testPassword, freshEmployee.password);
      
      console.log('Verification:', verification ? '✓ SUCCESS' : '✗ FAILED');
      
      if (verification) {
        console.log('\n✅ ALL TESTS PASSED!');
        console.log('─────────────────────────────────────────────────────');
        console.log('📝 Login credentials:');
        console.log('   Username: john_smith');
        console.log('   Password: SecureEmpPass123!');
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
  }
};

// ✅ THIS IS THE FIX - properly call and handle the async function
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});