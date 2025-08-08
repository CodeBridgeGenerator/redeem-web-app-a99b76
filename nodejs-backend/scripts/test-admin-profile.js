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
  phoneNumber: String,
  profileImage: String,
  address: String,
  aboutMe: String,
  points: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, {
  timestamps: true,
});

const Users = mongoose.model('users', usersSchema);

async function testAdminProfile() {
  try {
    const user = await Users.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@example.com' 
    });

    if (user) {
      console.log('Admin user profile data:');
      console.log({
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        address: user.address,
        aboutMe: user.aboutMe,
        points: user.points,
        isActive: user.isActive
      });
      
      if (user.profileImage) {
        console.log('✅ Profile image URL:', user.profileImage);
      } else {
        console.log('❌ No profile image found');
      }
    } else {
      console.log('No admin user found');
    }
  } catch (error) {
    console.error('Error testing admin profile:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAdminProfile(); 