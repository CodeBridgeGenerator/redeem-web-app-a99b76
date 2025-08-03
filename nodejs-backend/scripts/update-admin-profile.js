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

async function updateAdminProfile() {
  try {
    const result = await Users.updateOne(
      { email: 'khalidah.t4@gmail.com' },
      { 
        $set: { 
          profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          phoneNumber: '+1234567890',
          address: 'Admin Address',
          aboutMe: 'Welcome! Tell us about yourself...',
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Admin profile updated successfully');
      
      // Fetch and display the updated user
      const updatedUser = await Users.findOne({ email: 'khalidah.t4@gmail.com' });
      console.log('Updated admin user:', {
        email: updatedUser.email,
        username: updatedUser.username,
        phoneNumber: updatedUser.phoneNumber,
        profileImage: updatedUser.profileImage,
        address: updatedUser.address,
        aboutMe: updatedUser.aboutMe,
        points: updatedUser.points
      });
    } else {
      console.log('No user found to update');
    }
  } catch (error) {
    console.error('Error updating admin profile:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateAdminProfile(); 