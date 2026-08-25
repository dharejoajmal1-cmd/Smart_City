// =====================================================
// middleware/upload.js
// Configures Multer for handling multipart/form-data image
// uploads. Files are temporarily stored on disk in /uploads
// before being pushed to Cloudinary, then removed locally.
// =====================================================

const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// -----------------------------------------------------
// Ensure upload directory exists
// -----------------------------------------------------
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// -----------------------------------------------------
// Allowed image extensions & MIME types
// -----------------------------------------------------
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];

// -----------------------------------------------------
// Multer Storage
// -----------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new ApiError(400, 'Invalid file extension.'));
    }

    cb(null, `${uuidv4()}${ext}`);
  },
});

// -----------------------------------------------------
// File Validation
// -----------------------------------------------------
const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(new ApiError(400, 'No file uploaded.'));
  }

  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new ApiError(
        400,
        'Only JPEG, JPG, PNG and WEBP image formats are allowed.'
      ),
      false
    );
  }

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new ApiError(
        400,
        'Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp'
      ),
      false
    );
  }

  cb(null, true);
};

// -----------------------------------------------------
// Multer Instance
// -----------------------------------------------------
const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 10,
  },
});

module.exports = upload;