const mongoose = require('mongoose');
const config = require('../config/default.json');

// Connect to MongoDB
mongoose.connect(config.mongodb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the emailRoles schema
const emailRolesSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin", "manager", "supervisor"],
    default: "user"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

const EmailRoles = mongoose.model('emailRoles', emailRolesSchema);

async function setupAdminEmail() {
  try {
    // Check if admin email role already exists
    const existingRole = await EmailRoles.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@example.com' 
    });

    if (existingRole) {
      console.log('Admin email role already exists:', existingRole);
      return;
    }

    // Create admin email role
    const adminRole = new EmailRoles({
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      role: 'admin',
      isActive: true
    });

    await adminRole.save();
    console.log('Admin email role created successfully:', adminRole);
  } catch (error) {
    console.error('Error setting up admin email role:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupAdminEmail(); 