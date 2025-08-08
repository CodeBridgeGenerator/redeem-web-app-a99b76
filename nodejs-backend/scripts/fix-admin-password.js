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

async function fixAdminPassword() {
  try {
    const newPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    console.log('Fixing admin password...');
    console.log('New password:', newPassword);
    console.log('New hash:', hashedPassword);
    
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
      console.log('✅ Admin password fixed successfully');
      console.log('You can now login with: admin123');
    } else {
      console.log('❌ No user found to update');
    }
  } catch (error) {
    console.error('Error fixing password:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixAdminPassword(); 