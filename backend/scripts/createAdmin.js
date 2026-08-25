const dnsModule = require('node:dns');

dnsModule.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();

const mongoose = require('mongoose');
const validator = require('validator');
const User = require('../models/User');

const isStrongPassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSymbol;
};

const main = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL and/or ADMIN_PASSWORD. Set both before running this script.');
    process.exit(1);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (!validator.isEmail(normalizedEmail)) {
    console.error('ADMIN_EMAIL must be a valid email address.');
    process.exit(1);
  }

  if (!isStrongPassword(password)) {
    console.error(
      'ADMIN_PASSWORD must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
    );
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in the environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    const existingUser = await User.findOne({ email: normalizedEmail }).select('+password');

    if (existingUser) {
      const passwordMatches = await existingUser.comparePassword(password);
      const isAlreadyAdmin = existingUser.role === 'admin';

      if (isAlreadyAdmin && passwordMatches) {
        console.log('Existing admin already synchronized');
        return;
      }

      existingUser.role = 'admin';

      if (!passwordMatches) {
        existingUser.password = password;
        await existingUser.save();
        console.log('Existing admin role synchronized and password updated');
        return;
      }

      await existingUser.save();
      console.log('Existing admin role synchronized');
      return;
    }

    await User.create({
      name: 'Smart City Admin',
      email: normalizedEmail,
      password,
      role: 'admin',
      phone: '',
    });

    console.log('Admin created');
    return;
  } catch (error) {
    console.error('Failed to create admin user.');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

main();