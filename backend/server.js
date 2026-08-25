// =====================================================
// server.js
// Application entry point. Loads environment variables,
// connects to MongoDB, and starts the HTTP server.
// =====================================================

require('dotenv').config();

require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = require('./app');
const connectDB = require('./config/db');



const PORT = Number(process.env.PORT || 5000);

// -----------------------------------------------------
// Handle unexpected errors
// -----------------------------------------------------
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception');
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection');
  console.error(err);
  process.exit(1);
});

let server;

// -----------------------------------------------------
// Start Server
// -----------------------------------------------------
const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(
        `🚀 Smart City Jamshoro API running in ${
          process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
      );
    });

    server.on('error', (error) => {
      console.error('❌ Server Error');
      console.error(error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server');
    console.error(error.message);
    process.exit(1);
  }
};

// -----------------------------------------------------
// Graceful Shutdown
// -----------------------------------------------------
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Closing server...`);

  if (server) {
    server.close(() => {
      console.log('✅ HTTP Server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();