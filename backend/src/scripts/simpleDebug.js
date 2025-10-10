console.log('Script started...');

import dotenv from 'dotenv';
dotenv.config();

console.log('Environment loaded');
console.log('Pepper:', process.env.PASSWORD_PEPPER?.substring(0, 20));

import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';

console.log('Utils imported');

const test = async () => {
  console.log('Test function started');
  
  try {
    const hash = await hashPassword('SecureEmpPass123!');
    console.log('Hash:', hash.substring(0, 40));
    
    const valid = await verifyPassword('SecureEmpPass123!', hash);
    console.log('Valid:', valid);
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
};

test();