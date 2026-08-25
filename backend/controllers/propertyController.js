// =====================================================
// controllers/propertyController.js
// Handles CRUD operations for property listings, including
// image upload/deletion via Cloudinary, search, filtering,
// pagination, and sorting.
// =====================================================

const fs = require('fs');
const validator = require('validator');
const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const CLOUDINARY_FOLDER = 'smart-city-jamshoro/properties';
const cloudinaryReady = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

/**
 * Uploads an array of local file paths (from multer) to Cloudinary
 * and returns an array of { url, publicId } objects. Cleans up the
 * local temp files afterwards regardless of success or failure.
 */
const uploadImagesToCloudinary = async (files) => {
  const uploaded = [];

  try {
    if (!cloudinaryReady) {
      const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
      return files.map((file) => ({ url: `${base}/uploads/${encodeURIComponent(require('path').basename(file.path))}`, publicId: `local:${require('path').basename(file.path)}` }));
    }
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const result = await cloudinary.uploader.upload(file.path, {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
      });
      uploaded.push({ url: result.secure_url, publicId: result.public_id });
    }
    return uploaded;
  } catch (error) {
    // Roll back any images that were uploaded before the failure
    await Promise.all(
      uploaded.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => null))
    );
    throw new ApiError(502, `Image upload failed: ${error.message}`);
  } finally {
    // Always clean up local temp files
    if (cloudinaryReady) {
      files.forEach((file) => fs.unlink(file.path, () => {}));
    }
  }
};

// -----------------------------------------------------
// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private
// -----------------------------------------------------
const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    city,
    location,
    price,
    purpose,
    type,
    bedrooms,
    bathrooms,
    area,
    features,
    coordinates,
    featured,
  } = req.body;

  // ---- Validation ----
  if (!title || !description || !location || !price || !purpose || !type || !area) {
    throw new ApiError(
      400,
      'title, description, location, price, purpose, type, and area are required'
    );
  }

  const normalizedTitle = validator.trim(String(title));
  const normalizedDescription = validator.trim(String(description));
  const normalizedLocation = validator.trim(String(location));
  const normalizedCity = city ? validator.trim(String(city)) : 'Jamshoro';
  const normalizedArea = validator.trim(String(area));
  const normalizedPrice = Number(price);

  if (!validator.isFloat(String(price), { min: 0 })) {
    throw new ApiError(400, 'Price must be a positive number');
  }

  if (!['sale', 'rent'].includes(purpose)) {
    throw new ApiError(400, "Purpose must be either 'sale' or 'rent'");
  }

  const allowedTypes = ['house', 'apartment', 'plot', 'commercial', 'farmhouse', 'office'];
  if (!allowedTypes.includes(type)) {
    throw new ApiError(400, `Type must be one of: ${allowedTypes.join(', ')}`);
  }

  // Upload images if provided
  let images = [];
  if (req.files && req.files.length > 0) {
    images = await uploadImagesToCloudinary(req.files);
  }

  // Parse optional JSON-encoded fields (they may arrive as strings via multipart/form-data)
  let parsedFeatures = [];
  if (features) {
    parsedFeatures = Array.isArray(features) ? features : safeJsonParse(features, []);
  }

  let parsedCoordinates = {};
  if (coordinates) {
    parsedCoordinates =
      typeof coordinates === 'object' ? coordinates : safeJsonParse(coordinates, {});
  }

  // `featured` arrives as a string ("true"/"false") when the request is
  // multipart/form-data, since FormData has no boolean type.
  const isFeatured = featured === true || featured === 'true';

  const property = await Property.create({
    title: normalizedTitle,
    description: normalizedDescription,
    city: normalizedCity,
    location: normalizedLocation,
    price: normalizedPrice,
    purpose,
    type,
    bedrooms: Number(bedrooms) || 0,
    bathrooms: Number(bathrooms) || 0,
    area: normalizedArea,
    images,
    features: parsedFeatures,
    coordinates: parsedCoordinates,
    featured: isFeatured,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, 'Property created successfully', { property }));
});

/**
 * Safely parses a JSON string, returning a fallback value on failure.
 */
function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

// -----------------------------------------------------
// @desc    Update an existing property
// @route   PUT /api/properties/:id
// @access  Private/Admin
// -----------------------------------------------------
const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validator.isMongoId(id)) {
    throw new ApiError(400, 'Invalid property ID format');
  }

  const property = await Property.findById(id);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Only an admin can update properties
 if (req.user.role !== 'admin') {
   throw new ApiError(
     403,
     'Access denied, admin privileges required'
   );
 }

  const updatableFields = [
    'title',
    'description',
    'city',
    'location',
    'price',
    'purpose',
    'type',
    'bedrooms',
    'bathrooms',
    'area',
    'status',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (['title', 'description', 'city', 'location', 'area'].includes(field)) {
        property[field] = validator.trim(String(req.body[field]));
      } else if (['price', 'bedrooms', 'bathrooms'].includes(field)) {
        property[field] = Number(req.body[field]);
      } else {
        property[field] = req.body[field];
      }
    }
  });

  // `featured` is handled separately from the generic loop above because
  // it's a boolean that (like everything else in a multipart/form-data
  // request) arrives as the string "true"/"false" rather than an actual
  // boolean, and a naive `req.body.featured` assignment would make ANY
  // truthy string (including the string "false") evaluate as featured.
  if (req.body.featured !== undefined) {
    property.featured = req.body.featured === true || req.body.featured === 'true';
  }

  if (req.body.features !== undefined) {
    property.features = Array.isArray(req.body.features)
      ? req.body.features
      : safeJsonParse(req.body.features, property.features);
  }

  if (req.body.coordinates !== undefined) {
    property.coordinates =
      typeof req.body.coordinates === 'object'
        ? req.body.coordinates
        : safeJsonParse(req.body.coordinates, property.coordinates);
  }

  // Append any newly uploaded images to the existing set
  if (req.files && req.files.length > 0) {
    const newImages = await uploadImagesToCloudinary(req.files);
    property.images = [...property.images, ...newImages];
  }

  await property.save();

  res.status(200).json(new ApiResponse(200, 'Property updated successfully', { property }));
});

// -----------------------------------------------------
// @desc    Delete a property (and its Cloudinary images)
// @route   DELETE /api/properties/:id
// @access  Private/Admin
// -----------------------------------------------------
const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validator.isMongoId(id)) {
    throw new ApiError(400, 'Invalid property ID format');
  }

  const property = await Property.findById(id);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied, admin privileges required');
  }

  // Delete all associated images from Cloudinary
  if (property.images && property.images.length > 0) {
    await Promise.all(
      property.images.filter((img) => img.publicId && !String(img.publicId).startsWith('local:')).map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => null))
    );
  }

  await property.deleteOne();

  res.status(200).json(new ApiResponse(200, 'Property deleted successfully', {}));
});

// -----------------------------------------------------
// @desc    Get all properties with search, filter, sort & pagination
// @route   GET /api/properties
// @access  Public
// Query params supported:
//   search, city, purpose, type, minPrice, maxPrice,
//   bedrooms, bathrooms, status, sort, page, limit
// -----------------------------------------------------
const getAllProperties = asyncHandler(async (req, res) => {
  const {
    search,
    city,
    purpose,
    type,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    status,
    sort,
    featured,
  } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  if (purpose) {
    if (!['sale', 'rent'].includes(purpose)) {
      throw new ApiError(400, "Purpose filter must be either 'sale' or 'rent'");
    }
    query.purpose = purpose;
  }

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  // `featured` is a query string, so only the literal "true"/"false"
  // select a value — anything else (missing, empty, garbage) leaves the
  // filter off entirely rather than accidentally matching nothing.
  if (featured === 'true') {
    query.featured = true;
  } else if (featured === 'false') {
    query.featured = false;
  }

  if (bedrooms !== undefined && bedrooms !== '') {
    query.bedrooms = { $gte: Number(bedrooms) };
  }

  if (bathrooms !== undefined && bathrooms !== '') {
    query.bathrooms = { $gte: Number(bathrooms) };
  }

  // NOTE: req.query values arrive as strings, and the frontend may send
  // minPrice/maxPrice as an EMPTY STRING ("") rather than omitting them
  // entirely. An empty string is not `undefined`, so a naive
  // `!== undefined` check still enters this block and previously produced
  // `query.price = {}` (an empty object with no $gte/$lte). Mongoose then
  // tried to cast that empty object to the Number-typed `price` field and
  // threw a CastError whose value ({}) rendered as the literal string
  // "[object Object]" in the error message. Fixed by only treating a
  // value as present when it is a non-empty string that parses to a
  // finite number, and only attaching query.price if at least one bound
  // was actually set.
  const parsedMin = minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))
    ? Number(minPrice)
    : undefined;
  const parsedMax = maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))
    ? Number(maxPrice)
    : undefined;

  if (
    (minPrice !== undefined && minPrice !== '' && parsedMin === undefined) ||
    (maxPrice !== undefined && maxPrice !== '' && parsedMax === undefined)
  ) {
    throw new ApiError(400, 'minPrice and maxPrice must be valid numbers');
  }

  if (parsedMin !== undefined || parsedMax !== undefined) {
    query.price = {};
    if (parsedMin !== undefined) query.price.$gte = parsedMin;
    if (parsedMax !== undefined) query.price.$lte = parsedMax;
  }

  // ---- Sorting ----
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  // ---- Pagination ----
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    Property.find(query).sort(sortBy).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Property.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Properties fetched successfully', {
      properties,
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
// @desc    Get a single property by its MongoDB ID
// @route   GET /api/properties/id/:id
// @access  Public
// -----------------------------------------------------
const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validator.isMongoId(id)) {
    throw new ApiError(400, 'Invalid property ID format');
  }

  const property = await Property.findById(id).populate('createdBy', 'name email phone');
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  res.status(200).json(new ApiResponse(200, 'Property fetched successfully', { property }));
});

// -----------------------------------------------------
// @desc    Get a single property by its slug
// @route   GET /api/properties/slug/:slug
// @access  Public
// -----------------------------------------------------
const getPropertyBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const property = await Property.findOne({ slug }).populate('createdBy', 'name email phone');
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  res.status(200).json(new ApiResponse(200, 'Property fetched successfully', { property }));
});

module.exports = {
  createProperty,
  updateProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  getPropertyBySlug,
};
