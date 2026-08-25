// =====================================================
// config/db.js
// Handles MongoDB connection using Mongoose.
// =====================================================

const dns = require('dns');

// Force Node.js to use Google DNS instead of localhost (127.0.0.1)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI provided in environment variables.
 * Registers listeners for connection success, error, and disconnection
 * so that issues are visible in the server logs.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Fired whenever mongoose loses connection to MongoDB
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB Connection Error: ${err.message}`);
    });

    // Fired when mongoose is disconnected from MongoDB
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
    });

    // Fired when mongoose successfully reconnects
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully.');
    });

    // Gracefully close the connection when the Node process ends
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination.');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('========== MongoDB Error ==========');
    console.error(error);
    throw error;
  }
};

module.exports = connectDB;