// =====================================================
// controllers/chatController.js
// Handles the AI chat endpoint, delegating the actual
// generation to the Gemini service and persisting every
// conversation turn to MongoDB.
// =====================================================

const validator = require('validator');
const ChatHistory = require('../models/ChatHistory');
const { generateChatResponse } = require('../services/geminiService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// -----------------------------------------------------
// @desc    Send a prompt to the AI assistant and store the exchange
// @route   POST /api/chat
// @access  Public (works for both guests and logged-in users)
// -----------------------------------------------------
const sendMessage = asyncHandler(async (req, res) => {
  const prompt = String(req.body.prompt || '').trim();

  // Validate prompt
  if (!validator.isLength(prompt, { min: 1, max: 2000 })) {
    throw new ApiError(400, 'A prompt between 1 and 2000 characters is required');
  }

  let responseText;

  try {
    responseText = await generateChatResponse(prompt);

    if (!responseText || !String(responseText).trim()) {
      throw new ApiError(502, 'AI returned an empty response');
    }
  } catch (error) {
    throw new ApiError(
      error.statusCode || 502,
      error.message || 'The AI assistant is currently unavailable. Please try again shortly.'
    );
  }

  // Save chat history (does NOT fail the API if Mongo save fails)
  let chatId = null;

  try {
    const chatEntry = await ChatHistory.create({
      user: req.user ? req.user._id : null,
      prompt,
      response: responseText,
    });

    chatId = chatEntry._id;
  } catch (err) {
    console.error('Failed to save chat history:', err.message);
  }

  res.status(200).json(
    new ApiResponse(200, 'AI response generated successfully', {
      prompt,
      response: responseText,
      chatId,
    })
  );
});

// -----------------------------------------------------
// @desc    Get chat history for the logged-in user
// @route   GET /api/chat/history
// @access  Private
// -----------------------------------------------------
const getChatHistory = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    ChatHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    ChatHistory.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Chat history fetched successfully', {
      history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  );
});

module.exports = {
  sendMessage,
  getChatHistory,
};