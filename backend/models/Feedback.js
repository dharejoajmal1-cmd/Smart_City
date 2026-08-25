const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', schema);
