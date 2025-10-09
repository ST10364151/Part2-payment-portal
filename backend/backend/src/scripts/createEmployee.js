import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from '../models/Employee.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

const createEmployee = async () => {
  try {
    const testPassword = 'SecureEmpPass123!';
    
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ username: 'student_student' });
    
    if (existingEmployee) {
      console.log('⚠️  Employee already exists. Deleting old record...');
      await Employee.deleteOne({ username: 'student_student' });
    }

    console.log('Creating employee...');
    
    const employee = await Employee.create({
      fullName: 'Marene Lessing',
      username: 'student_student',
      employeeId: 'EMP002',
      password: testPassword, // ⚡ plain text
      role: 'verifier',
      department: 'International Payments',
      isActive: true
    });

    console.log('✅ Created employee successfully:');
    console.log({
      id: employee._id,
      fullName: employee.fullName,
      username: employee.username,
      employeeId: employee.employeeId,
      role: employee.role,
      department: employee.department,
      password: employee.password // plain text
    });

    console.log('\n🎯 Ready to login via Postman!');
  } catch (error) {
    console.error('❌ Error creating employee:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
};

createEmployee().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
