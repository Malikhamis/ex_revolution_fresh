const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@exrevolution.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const admin = new User({
      name: 'Admin',
      email: 'admin@exrevolution.com',
      password: hashedPassword,
      isAdmin: true
    });

    await admin.save();
    console.log('Admin user created successfully');

    // Close connection
    await mongoose.connection.close();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

createAdmin();
