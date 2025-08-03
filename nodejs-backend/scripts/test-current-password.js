const bcrypt = require('bcryptjs');

// Test the current password hash from the database
const currentHash = '$2b$10$oJ5vyqLvaHxwl8ePVH51gu4.cgyvQFQr5XpwYHJUk3WmuJ1c9Hq0K';
const testPassword = 'admin123';

console.log('Testing current password hash...');
console.log('Current hash:', currentHash);
console.log('Test password:', testPassword);

// Test if the password matches the hash
const isValid = bcrypt.compareSync(testPassword, currentHash);
console.log('Password is valid:', isValid);

// Test with different passwords that might have been set
const possiblePasswords = ['admin123', 'password', '123456', 'admin', 'test'];
console.log('\nTesting with different possible passwords:');
possiblePasswords.forEach(pwd => {
  const valid = bcrypt.compareSync(pwd, currentHash);
  console.log(`Password "${pwd}": ${valid ? '✅ Valid' : '❌ Invalid'}`);
});

// Generate a new hash with the same password
const newHash = bcrypt.hashSync(testPassword, 10);
console.log('\nNew hash:', newHash);

// Test the new hash
const newHashValid = bcrypt.compareSync(testPassword, newHash);
console.log('New hash is valid:', newHashValid); 