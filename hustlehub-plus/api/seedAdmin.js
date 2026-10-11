
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';

async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password || password.length < 12) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await User.findOne({ email });

    if (existing) {
      console.log('An account with this email already exists. No changes made.');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name: 'Local',
      surname: 'Admin',
      displayName: 'Administrator',
      email,
      passwordHash,
      role: 'admin',
      contactMethod: '',
    });

    console.log('Local admin account created successfully.');
  } catch (error) {
    console.error('Admin setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
