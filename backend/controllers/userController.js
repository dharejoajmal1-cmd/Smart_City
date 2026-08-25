// =====================================================
// controllers/userController.js
// Handles user profile management and admin user
// administration (list, view, update role, delete).
// =====================================================

const validator = require('validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// -----------------------------------------------------
// @desc    Update the logged-in user's own profile
// @route   PUT /api/users/profile
// @access  Private
// -----------------------------------------------------
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, email } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name) {
    if (!validator.isLength(name, { min: 2, max: 50 })) {
      throw new ApiError(400, 'Name must be between 2 and 50 characters');
    }
    user.name = validator.trim(name);
  }

  if (phone !== undefined) {
    if (phone !== '' && !validator.isMobilePhone(phone, 'any')) {
      throw new ApiError(400, 'Please provide a valid phone number');
    }
    user.phone = phone;
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!validator.isEmail(normalizedEmail)) {
      throw new ApiError(400, 'Please provide a valid email address');
    }
    if (normalizedEmail !== user.email) {
      const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      if (adminEmail && normalizedEmail === adminEmail) {
        throw new ApiError(403, 'This email address is reserved for the administrator');
      }
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== user._id.toString()) {
        throw new ApiError(409, 'An account with this email already exists');
      }
      user.email = normalizedEmail;
    }
  }

  if (avatar !== undefined) user.avatar = String(avatar).trim();

  await user.save();

  res.status(200).json(new ApiResponse(200, 'Profile updated successfully', { user }));
});

// -----------------------------------------------------
// @desc    Change the logged-in user's password
// @route   PUT /api/users/change-password
// @access  Private
// -----------------------------------------------------

// POST /api/users/avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Profile picture is required');
  const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  const avatar = `${base}/uploads/${encodeURIComponent(require('path').basename(req.file.path))}`;
  const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, 'Profile picture updated successfully', { user }));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (!validator.isLength(newPassword, { min: 6 })) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, 'Password changed successfully', {}));
});

// -----------------------------------------------------
// @desc    Get all users (with pagination)
// @route   GET /api/users
// @access  Private/Admin
// -----------------------------------------------------
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Users fetched successfully', {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  );
});

// -----------------------------------------------------
// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
// -----------------------------------------------------
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validator.isMongoId(id)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, 'User fetched successfully', { user }));
});

// -----------------------------------------------------
// @desc    Update a user's role (promote/demote)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
// -----------------------------------------------------
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!validator.isMongoId(id)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  const allowedRoles = ['user', 'agent'];
  if (!role || !allowedRoles.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${allowedRoles.join(', ')}`);
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, 'User role updated successfully', { user }));
});

// -----------------------------------------------------
// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
// -----------------------------------------------------
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validator.isMongoId(id)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  // Safety guard: prevent an admin from deleting their own account, which
  // would otherwise be an easy way to accidentally lock the team out of
  // the admin dashboard.
  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'You cannot delete your own account while logged in.');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, 'User deleted successfully', {}));
});

module.exports = {
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  uploadAvatar,
};
