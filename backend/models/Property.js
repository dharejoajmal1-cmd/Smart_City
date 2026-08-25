// =====================================================
// models/Property.js
// Mongoose schema for real estate property listings.
// =====================================================

const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const coordinatesSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      default: null,
    },
    lng: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      default: 'Jamshoro',
    },
    location: {
      type: String,
      required: [true, 'Location / address is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    purpose: {
      type: String,
      enum: ['sale', 'rent'],
      required: [true, 'Purpose is required (sale or rent)'],
    },
    type: {
      type: String,
      enum: ['house', 'apartment', 'plot', 'commercial', 'farmhouse', 'office'],
      required: [true, 'Property type is required'],
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      default: 0,
      min: [0, 'Bathrooms cannot be negative'],
    },
    area: {
      type: String, // e.g. "5 Marla", "1 Kanal", "1200 sqft"
      required: [true, 'Area is required'],
      trim: true,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    seedImage: { type: String, default: '' },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'pending'],
      default: 'available',
    },
    // Lets an admin hand-pick which listings show in the Home page
    // "Featured Properties" section, independent of recency/sort order.
    featured: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      type: coordinatesSchema,
      default: () => ({}),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a URL-friendly, unique slug from the title before validation
propertySchema.pre('validate', function generateSlug(next) {
  if (this.title && (this.isModified('title') || !this.slug)) {
    const base = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Append a short random suffix to reduce collision probability
    const suffix = Math.random().toString(36).substring(2, 8);
    this.slug = `${base}-${suffix}`;
  }
  next();
});

// Text index to support keyword search across key fields
propertySchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  city: 'text',
});

module.exports = mongoose.model('Property', propertySchema);
