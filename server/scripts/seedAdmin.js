const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@codeforegx.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@codeforegx.com',
      password: await bcrypt.hash('adminpassword', salt),
      role: 'admin'
    });
    
    await admin.save();
    
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Create developer user
const seedDeveloper = async () => {
  try {
    // Check if developer already exists
    const developerExists = await User.findOne({ email: 'developer@codeforegx.com' });
    
    if (developerExists) {
      console.log('Developer user already exists');
      return;
    }
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Create developer user
    const developer = new User({
      name: 'Developer User',
      email: 'developer@codeforegx.com',
      password: await bcrypt.hash('developerpassword', salt),
      role: 'developer'
    });
    
    await developer.save();
    
    console.log('Developer user created successfully');
  } catch (error) {
    console.error('Error creating developer user:', error);
  }
};

// Create test user
const seedUser = async () => {
  try {
    // Check if test user already exists
    const userExists = await User.findOne({ email: 'user@codeforegx.com' });
    
    if (userExists) {
      console.log('Test user already exists');
      return;
    }
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Create test user
    const user = new User({
      name: 'Regular User',
      email: 'user@codeforegx.com',
      password: await bcrypt.hash('userpassword', salt),
      role: 'user'
    });
    
    await user.save();
    
    console.log('Test user created successfully');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
};

// Run all seed functions
const seedAll = async () => {
  await seedAdmin();
  await seedDeveloper();
  await seedUser();
  
  console.log('All users seeded successfully');
  process.exit(0);
};

seedAll();