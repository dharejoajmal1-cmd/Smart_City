const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
  originalPrice: { type: Number, min: 0, default: null },
  negotiatedPrice: { type: Number, min: 0, required: true },
  plotSizeSqYds: { type: Number, required: true, min: 150, max: 250 },
  plotType: { type: String, enum: ['residential', 'commercial', 'other'], required: true },
  status: { type: String, enum: ['agreed', 'completed'], default: 'agreed' },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Agreement', schema);
