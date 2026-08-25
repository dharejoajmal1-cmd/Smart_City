// =====================================================
// models/ChatHistory.js
// Stores every AI chat interaction (prompt + response)
// so conversation history can be reviewed or audited.
// =====================================================

const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Allow anonymous chat usage
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      trim: true,
    },
    response: {
      type: String,
      required: [true, 'Response is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
