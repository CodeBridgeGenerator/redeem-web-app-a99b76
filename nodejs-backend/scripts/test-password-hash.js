const bcrypt = require('bcryptjs');

// Test the current password hash
const currentHash = '$2a$10$fq4Od3tznfn0eth5LarQ4uZ/NEcoVbxCptca5P4TCbfpCt4JZqcQS';
const testPassword = 'admin123';

console.log('Testing password hash...');
console.log('Current hash:', currentHash);
console.log('Test password:', testPassword);

// Test if the password matches the hash
const isValid = bcrypt.compareSync(testPassword, currentHash);
console.log('Password is valid:', isValid);

// Generate a new hash with the same password
const newHash = bcrypt.hashSync(testPassword, 10);
console.log('New hash:', newHash);

// Test the new hash
const newHashValid = bcrypt.compareSync(testPassword, newHash);
console.log('New hash is valid:', newHashValid); 