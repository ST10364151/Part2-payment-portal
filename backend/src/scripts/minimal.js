// backend/src/scripts/minimal.js
console.log('Step 1: Script loaded');

(async () => {
  console.log('Step 2: Async function started');
  
  try {
    console.log('Step 3: Importing dotenv...');
    const dotenv = await import('dotenv');
    dotenv.config();
    console.log('Step 4: Dotenv loaded');
    console.log('Pepper exists:', !!process.env.PASSWORD_PEPPER);
    
    console.log('Step 5: Importing passwordUtils...');
    const utils = await import('../utils/passwordUtils.js');
    console.log('Step 6: Utils imported');
    
    console.log('Step 7: Hashing password...');
    const hash = await utils.hashPassword('test');
    console.log('Step 8: Hash created:', hash.substring(0, 20));
    
  } catch (error) {
    console.error('ERROR at step:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
})();