const mongoose = require('mongoose');
const validator = require('validator');

const inquirySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, validate: { validator: validator.isEmail, message: 'Please provide a valid email address' } },
  phone: { type: String, required: true, trim: true },
  cnic: { type: String, trim: true, select: false },
  income: { type: Number, min: 0, default: null },
  budget: { type: Number, required: true, min: 0 },
  plotSizeSqYds: { type: Number, min: 150, max: 250, default: null },
  plotType: { type: String, enum: ['residential', 'commercial', 'other'], default: 'residential' },
  preferredLocation: { type: String, trim: true, maxlength: 200, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  optionType: { type: String, enum: ['predefined', 'custom'], default: 'custom' },
  status: { type: String, enum: ['pending', 'under_review', 'negotiating', 'approved', 'rejected', 'agreement', 'completed'], default: 'pending', index: true },
  adminResponse: { type: String, trim: true, maxlength: 3000, default: '' },
  agreedPrice: { type: Number, min: 0, default: null },
  agreementAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
