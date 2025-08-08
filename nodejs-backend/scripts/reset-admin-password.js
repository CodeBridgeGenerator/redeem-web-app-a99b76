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
    const newPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Use env var or fallback
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await Users.updateOne(
      { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
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