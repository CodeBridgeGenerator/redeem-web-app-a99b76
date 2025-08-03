const mongoose = require('mongoose');
const config = require('../config/default.json');

// Connect to MongoDB
mongoose.connect(config.mongodb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the UserInvites schema
const userInvitesSchema = new mongoose.Schema({
  emailToInvite: String,
  status: Boolean,
  code: Number,
  position: mongoose.Schema.Types.ObjectId,
  role: mongoose.Schema.Types.ObjectId,
  sendMailCounter: {
    type: Number,
    default: 0,
    min: 0,
    max: 10000000
  }
}, {
  timestamps: true
});

const UserInvites = mongoose.model('user_invites', userInvitesSchema);

async function resetMailCounter(email) {
  try {
    console.log(`🔍 Looking for email: ${email}`);
    
    // Find the user invite record
    const userInvite = await UserInvites.findOne({ emailToInvite: email });
    
    if (!userInvite) {
      console.log('❌ No user invite record found for this email');
      return;
    }
    
    console.log('📧 Found user invite record:');
    console.log('Email:', userInvite.emailToInvite);
    console.log('Current sendMailCounter:', userInvite.sendMailCounter);
    console.log('Status:', userInvite.status);
    console.log('Created at:', userInvite.createdAt);
    
    // Reset the counter
    const result = await UserInvites.updateOne(
      { emailToInvite: email },
      { 
        $set: { 
          sendMailCounter: 0,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Mail counter reset successfully!');
      console.log('📧 You can now use this email for signup again');
    } else {
      console.log('❌ Failed to reset mail counter');
    }
    
  } catch (error) {
    console.error('❌ Error resetting mail counter:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node scripts/reset-mail-counter.js your-email@example.com');
  process.exit(1);
}

console.log('🔄 Resetting mail counter for:', email);
resetMailCounter(email); 