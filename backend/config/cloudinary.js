// =====================================================
// config/cloudinary.js
// Configures the Cloudinary SDK using credentials from
// environment variables. Used for uploading and deleting
// property images.
// =====================================================

const cloudinary = require('cloudinary').v2;

// -----------------------------------------------------
// Validate Cloudinary Environment Variables
// -----------------------------------------------------
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.warn('⚠️ Cloudinary is not fully configured.');
  console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
  console.warn('Image upload functionality will not work until these values are configured.');
}

// -----------------------------------------------------
// Configure Cloudinary
// -----------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;