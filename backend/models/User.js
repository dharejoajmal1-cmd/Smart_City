// =====================================================
// models/User.js
// Mongoose schema for application users (buyers, sellers,
// and admins). Passwords are hashed before saving.
// =====================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Never return password by default
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (value) => value === '' || validator.isMobilePhone(value, 'any'),
        message: 'Please provide a valid phone number',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'agent'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetTokenHash: { type: String, default: '', select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Hash the password before saving, only if it has been modified
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compares a plain text candidate password with the hashed
 * password stored in the database.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields when converting document to JSON
userSchema.methods.toJSON = function toJSONOverride() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
