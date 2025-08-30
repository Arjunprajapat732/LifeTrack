// Seeder to create a single admin user if not exists
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const MONGODB_URI = process.env.MONGODB_URI;

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    }
    let admin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (!admin) {
      admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created');
    } else {
      admin.password = adminPassword;
      await admin.save();
      console.log('Admin user password updated');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeder error:', err);
    process.exit(1);
  }
}

seedAdmin();
