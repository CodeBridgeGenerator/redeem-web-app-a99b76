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

async function checkUser() {
  try {
    const user = await Users.findOne({ 
      email: 'khalidah.t4@gmail.com' 
    });

    if (user) {
      console.log('User found:', {
        _id: user._id,
        email: user.email,
        username: user.username,
        isActive: user.isActive,
        createdAt: user.createdAt,
        hasPassword: !!user.password
      });
    } else {
      console.log('No user found with email: khalidah.t4@gmail.com');
    }
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUser(); 