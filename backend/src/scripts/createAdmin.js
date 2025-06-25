/**
 * Create Admin User Script
 * Creates an admin user in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Define admin user details
    const adminEmail = 'admin@exrevolution.com';
    const adminPassword = 'ExRev@Admin2023'; // Secure password for admin
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists:', existingAdmin.email);
      console.log('ℹ️ If you need to reset the password, delete the user and run this script again.');
    } else {
      // Create admin user
      const adminUser = new User({
        name: 'Ex Revolution Admin',
        email: adminEmail,
        password: adminPassword, // Will be hashed by the User model pre-save hook
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword); // Only show during initial setup
      console.log('⚠️ Please save these credentials securely and change the password after first login.');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
