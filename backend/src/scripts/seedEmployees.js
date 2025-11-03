const mongoose = require('mongoose');
const Employee = require('../models/Employee');
require('dotenv').config();

const employees = [
  {
    username: 'admin001',
    employeeId: 'EMP001',
    password: 'Admin@2024!Secure',
    fullName: 'John Administrator',
    email: 'admin@bank.com',
    department: 'IT Security',
    role: 'admin'
  },
  {
    username: 'verifier001',
    employeeId: 'EMP002',
    password: 'Verify@2024!Secure',
    fullName: 'Sarah Verifier',
    email: 'sarah.verifier@bank.com',
    department: 'International Payments',
    role: 'verifier'
  },
  {
    username: 'verifier002',
    employeeId: 'EMP003',
    password: 'Verify@2024!Secure',
    fullName: 'Michael Checker',
    email: 'michael.checker@bank.com',
    department: 'International Payments',
    role: 'verifier'
  },
  {
    username: 'manager001',
    employeeId: 'EMP004',
    password: 'Manager@2024!Secure',
    fullName: 'Emily Manager',
    email: 'emily.manager@bank.com',
    department: 'International Payments',
    role: 'manager'
  },
  {
    username: 'verifier003',
    employeeId: 'EMP005',
    password: 'Verify@2024!Secure',
    fullName: 'David Wilson',
    email: 'david.wilson@bank.com',
    department: 'International Payments',
    role: 'verifier'
  }
];

const seedEmployees = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payment-portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing employees (optional - comment out if you want to keep existing data)
    await Employee.deleteMany({});
    console.log('Cleared existing employees');

    // Create new employees
    for (const employeeData of employees) {
      const employee = new Employee(employeeData);
      await employee.save();
      console.log(`Created employee: ${employee.username} (${employee.fullName})`);
    }

    console.log('\n=== Employee Seeding Complete ===');
    console.log('You can login with the following credentials:');
    console.log('\nAdmin Account:');
    console.log('Username: admin001 | Password: Admin@2024!Secure');
    console.log('\nVerifier Accounts:');
    console.log('Username: verifier001 | Password: Verify@2024!Secure');
    console.log('Username: verifier002 | Password: Verify@2024!Secure');
    console.log('Username: verifier003 | Password: Verify@2024!Secure');
    console.log('\nManager Account:');
    console.log('Username: manager001 | Password: Manager@2024!Secure');
    console.log('\n================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding employees:', error);
    process.exit(1);
  }
};

seedEmployees();