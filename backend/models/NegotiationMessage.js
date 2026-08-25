const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
}, { timestamps: true });

module.exports = mongoose.model('NegotiationMessage', schema);
