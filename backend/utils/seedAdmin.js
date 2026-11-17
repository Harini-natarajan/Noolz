import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    const email = (process.env.ADMIN_EMAIL || 'admin@noolz.in').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error(
        'ADMIN_PASSWORD is not specified in backend/.env. Please set a secure password.'
      );
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      console.log(`[Seed] Admin already exists (Username: ${existingAdmin.username}, Email: ${existingAdmin.email}).`);
      console.log('[Seed] Updating email and password from environment configuration...');
      existingAdmin.email = email;
      existingAdmin.password = password;
      await existingAdmin.save();
      console.log('✓ Admin account updated successfully!');
    } else {
      console.log(`[Seed] Creating new Admin account (${username} / ${email})...`);
      await Admin.create({
        username,
        email,
        password,
        role: 'admin',
      });
      console.log('✓ Admin account created successfully!');
    }

    await mongoose.connection.close();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

seedAdmin();
