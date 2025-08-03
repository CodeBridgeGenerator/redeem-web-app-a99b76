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

async function resetAdminPassword() {
  try {
    const newPassword = 'admin123'; // Simple password for testing
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
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
      console.log('Admin password reset successfully');
      console.log('New password:', newPassword);
    } else {
      console.log('No user found to update');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    mongoose.connection.close();
  }
}

resetAdminPassword(); 