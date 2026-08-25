// =====================================================
// routes/propertyRoutes.js
// Public property viewing + admin-only property management.
// =====================================================

const express = require('express');

const {
  createProperty,
  updateProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  getPropertyBySlug,
} = require('../controllers/propertyController');

const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

// =====================================================
// PUBLIC ROUTES
// Anyone can view/search properties.
// =====================================================

router.get('/', getAllProperties);

router.get('/slug/:slug', getPropertyBySlug);

router.get('/id/:id', getPropertyById);

// =====================================================
// ADMIN-ONLY ROUTES
// Only authenticated admin users can manage properties.
// =====================================================

// Create property
router.post(
  '/',
  protect,
  admin,
  upload.array('images', 10),
  createProperty
);

// Update property
router.put(
  '/:id',
  protect,
  admin,
  upload.array('images', 10),
  updateProperty
);

// Delete property
router.delete(
  '/:id',
  protect,
  admin,
  deleteProperty
);

module.exports = router;