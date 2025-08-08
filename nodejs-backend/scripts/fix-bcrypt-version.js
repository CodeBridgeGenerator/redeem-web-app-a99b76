const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/default.json');

// Connect to MongoDB
mongoose.connect(config.mongodb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the users schema
const usersSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, {
  timestamps: true,
});

const Users = mongoose.model('users', usersSchema);

async function fixBcryptVersion() {
  try {
    console.log('🔧 Fixing bcrypt version conflict...');
    
    // Set a known password that we can use
    const newPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    console.log('New password:', newPassword);
    console.log('New hash:', hashedPassword);
    console.log('Hash format:', hashedPassword.startsWith('$2b$') ? '✅ New format ($2b$)' : '❌ Old format ($2a$)');
    
    const result = await Users.updateOne(
      { email: 'khalidah.t4@gmail.com' },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Password updated successfully');
      console.log('You can now login with: admin123');
      
      // Verify the update
      const user = await Users.findOne({ email: 'khalidah.t4@gmail.com' });
      console.log('Updated hash:', user.password);
      
      // Test the password
      const isValid = bcrypt.compareSync(newPassword, user.password);
      console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
    } else {
      console.log('❌ No user found to update');
    }
  } catch (error) {
    console.error('Error fixing bcrypt version:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixBcryptVersion(); 