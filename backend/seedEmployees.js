const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

const employees = [
  {
    fullName: 'John Manager',
    employeeId: 'EMP001',
    email: 'john.manager@bank.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    fullName: 'Jane Verifier',
    employeeId: 'EMP002',
    email: 'jane.verifier@bank.com',
    password: 'Verify123!',
    role: 'verifier'
  },
  {
    fullName: 'Bob Smith',
    employeeId: 'EMP003',
    email: 'bob.smith@bank.com',
    password: 'Staff123!',
    role: 'verifier'
  }
];

async function seedEmployees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing employees
    await Employee.deleteMany({});
    console.log('Cleared existing employees');
    
    // Insert new employees
    for (const empData of employees) {
      const employee = new Employee(empData);
      await employee.save();
      console.log(`Created employee: ${empData.fullName} (${empData.employeeId})`);
    }
    
    console.log('\n✅ Employee seeding completed successfully!');
    console.log('\nPre-registered employees:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    employees.forEach(emp => {
      console.log(`Name: ${emp.fullName}`);
      console.log(`Employee ID: ${emp.employeeId}`);
      console.log(`Password: ${emp.password}`);
      console.log(`Role: ${emp.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding employees:', error);
    process.exit(1);
  }
}

seedEmployees();
