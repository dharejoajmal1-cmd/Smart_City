// =====================================================
// routes/chatRoutes.js
// Routes for the AI-powered chat assistant.
// =====================================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Extra rate limit specifically for the AI endpoint since each call
// costs money against the Gemini API quota.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 chat requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many chat requests. Please wait a moment before trying again.',
    data: null,
  },
});

router.post('/', chatLimiter, sendMessage);
router.get('/history', protect, getChatHistory);

module.exports = router;
