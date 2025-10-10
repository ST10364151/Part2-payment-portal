// backend/seed.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Employee Schema (simplified for seeding)
const employeeSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  employeeId: String,
  password: String,
  role: String,
  department: String,
  isActive: Boolean,
  whitelistedIPs: [String]
});

const Employee = mongoose.model('Employee', employeeSchema);

/**
 * Seed database with test data
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check if employees already exist
    const existingEmployees = await Employee.countDocuments();
    if (existingEmployees > 0) {
      console.log('⚠ Database already contains employee data');
      console.log('  Skipping seed to prevent duplicates\n');
      process.exit(0);
    }

    // Create test employees
    console.log('Creating test employees...\n');

    const employees = [
      {
        fullName: 'John Verifier',
        username: 'john.verifier',
        employeeId: 'EMP001',
        password: 'Employee@123',
        role: 'verifier',
        department: 'International Payments',
        isActive: true
      },
      {
        fullName: 'Sarah Manager',
        username: 'sarah.manager',
        employeeId: 'EMP002',
        password: 'Manager@456',
        role: 'manager',
        department: 'International Payments',
        isActive: true
      },
      {
        fullName: 'Mike Admin',
        username: 'mike.admin',
        employeeId: 'EMP003',
        password: 'Admin@789',
        role: 'admin',
        department: 'IT Security',
        isActive: true
      }
    ];

    for (const empData of employees) {
      const plainPassword = empData.password;
      empData.password = await bcrypt.hash(empData.password, 12);
      
      await Employee.create(empData);
      
      console.log(`✓ Created employee: ${empData.username}`);
      console.log(`  Name: ${empData.fullName}`);
      console.log(`  Role: ${empData.role}`);
      console.log(`  Password: ${plainPassword}\n`);
    }

    console.log('════════════════════════════════════════════════════');
    console.log('✓ Database seeded successfully!');
    console.log('════════════════════════════════════════════════════\n');
    
    console.log('Test Employee Credentials:\n');
    console.log('1. Verifier Account:');
    console.log('   Username: john.verifier');
    console.log('   Password: Employee@123\n');
    
    console.log('2. Manager Account:');
    console.log('   Username: sarah.manager');
    console.log('   Password: Manager@456\n');
    
    console.log('3. Admin Account:');
    console.log('   Username: mike.admin');
    console.log('   Password: Admin@789\n');

    process.exit(0);

  } catch (error) {
    console.error('✗ Seed failed:', error.message);
    process.exit(1);
  }
}

// Run seed
seed();