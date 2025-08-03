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

async function checkMailCounter(email) {
  try {
    console.log(`🔍 Checking mail counter for: ${email}`);
    
    // Find the user invite record
    const userInvite = await UserInvites.findOne({ emailToInvite: email });
    
    if (!userInvite) {
      console.log('❌ No user invite record found for this email');
      console.log('💡 This means the email has never been used for signup');
      return;
    }
    
    console.log('📧 User invite record found:');
    console.log('Email:', userInvite.emailToInvite);
    console.log('Current sendMailCounter:', userInvite.sendMailCounter);
    console.log('Status:', userInvite.status);
    console.log('Created at:', userInvite.createdAt);
    console.log('Updated at:', userInvite.updatedAt);
    
    // Check if email is blocked
    if (userInvite.sendMailCounter >= 3) {
      console.log('🚫 Email is currently BLOCKED (too many attempts)');
      console.log('💡 Use reset-mail-counter.js to unblock this email');
    } else {
      console.log('✅ Email is available for signup');
      console.log(`📊 ${3 - userInvite.sendMailCounter} attempts remaining`);
    }
    
  } catch (error) {
    console.error('❌ Error checking mail counter:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node scripts/check-mail-counter.js your-email@example.com');
  process.exit(1);
}

checkMailCounter(email); 