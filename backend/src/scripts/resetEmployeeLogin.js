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

const resetLogin = async () => {
  try {
    const username = 'student_student'; // your test employee

    const result = await Employee.updateOne(
      { username },
      { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
    );

    console.log(`✅ Reset login attempts for ${username}:`, result);

  } catch (err) {
    console.error('❌ Error resetting login attempts:', err);
  } finally {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
  }
};

resetLogin();
