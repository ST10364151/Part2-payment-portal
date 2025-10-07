import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from '../models/Employee.js';
import { hashPassword } from '../utils/passwordUtils.js';

// Load .env variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const createEmployee = async () => {
  try {
    console.log('Hashing password...');
    const password = await hashPassword('SecureEmpPass123!');
    console.log('Password hashed:', password);

    console.log('Creating employee...');
    const employee = await Employee.create({
        fullName: 'John Smith',
        username: 'john_smith',
        employeeId: 'EMP001',
        password,
        role: 'verifier',
        department: 'International Payments'
      });
      

    console.log('Created employee:', employee);
  } catch (error) {
    console.error('Error creating employee:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createEmployee();
