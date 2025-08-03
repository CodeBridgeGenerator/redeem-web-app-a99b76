const mongoose = require('mongoose');
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

async function checkCurrentPassword() {
  try {
    const user = await Users.findOne({ email: 'khalidah.t4@gmail.com' });
    
    if (user) {
      console.log('User found:');
      console.log('Email:', user.email);
      console.log('Username:', user.username);
      console.log('Password hash:', user.password);
      console.log('Is Active:', user.isActive);
      console.log('Created At:', user.createdAt);
      console.log('Updated At:', user.updatedAt);
      
      // Check if password hash starts with $2b$ (bcrypt)
      if (user.password && user.password.startsWith('$2b$')) {
        console.log('✅ Password is properly hashed with bcrypt');
      } else {
        console.log('❌ Password is not properly hashed');
      }
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('Error checking password:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkCurrentPassword(); 