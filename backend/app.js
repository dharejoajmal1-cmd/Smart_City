// =====================================================
// app.js
// Express application configuration
// =====================================================

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const negotiationRoutes = require('./routes/negotiationRoutes');
const agreementRoutes = require('./routes/agreementRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const contactRoutes = require('./routes/contactRoutes');
const performanceRoutes = require('./routes/performanceRoutes');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// -----------------------------------------------------
// Input Sanitization
// -----------------------------------------------------
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // NOTE: this previously used a broken regex (/<[^>]\*>/g) where the
      // escaped "\*" matched a literal asterisk character instead of the
      // "zero or more" quantifier. That meant it almost never matched real
      // HTML tags (e.g. "<script>...</script>" passed straight through
      // untouched). Fixed to the correct unescaped quantifier below.
      return value.replace(/<[^>]*>/g, '').trim();
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value).reduce((acc, [key, currentValue]) => {
        acc[key] = sanitizeValue(currentValue);
        return acc;
      }, {});
    }

    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);

  next();
};

// -----------------------------------------------------
// Security Middleware
// -----------------------------------------------------
// crossOriginResourcePolicy is set to "cross-origin" because the frontend
// (localhost:5173) and backend (localhost:5000) run on different origins.
// With Helmet's default "same-origin" policy, the browser blocks images
// like avatars served from /uploads with ERR_BLOCKED_BY_RESPONSE.NotSameOrigin.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// -----------------------------------------------------
// CORS
// -----------------------------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin header
      // such as Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

// -----------------------------------------------------
// Body Parsing
// -----------------------------------------------------
app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// -----------------------------------------------------
// Cookies
// -----------------------------------------------------
app.use(cookieParser());

// -----------------------------------------------------
// Session
// -----------------------------------------------------
// SESSION_SECRET must be set in production — falling back to a fixed,
// publicly-known string would let anyone forge session cookies. Only
// allow the convenience fallback in non-production so local/dev setup
// isn't blocked by a missing .env value.
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error(
    'SESSION_SECRET is not set. Refusing to start in production with an insecure default session secret.'
  );
}

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      'dev-only-insecure-session-secret',

    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// -----------------------------------------------------
// MongoDB Security
// -----------------------------------------------------
app.use(mongoSanitize());

// Custom input sanitization
app.use(sanitizeInput);

// -----------------------------------------------------
// Compression
// -----------------------------------------------------
app.use(compression());

// -----------------------------------------------------
// Logging
// -----------------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// -----------------------------------------------------
// Global Rate Limiting
// -----------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    data: null,
  },
});

app.use(globalLimiter);

// -----------------------------------------------------
// Health Check
// -----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart City Jamshoro API is running',
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

// -----------------------------------------------------
// API Routes
// -----------------------------------------------------
app.use('/api/auth', authRoutes);

app.use('/api/properties', propertyRoutes);

app.use('/api/users', userRoutes);

app.use('/api/inquiries', inquiryRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/performance', performanceRoutes);

// Publicly serve uploaded fallback assets. Sensitive files are never stored here.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/seed-images', express.static(path.join(__dirname, 'seed-images')));

// -----------------------------------------------------
// 404 Handler
// -----------------------------------------------------
app.use(notFound);

// -----------------------------------------------------
// Global Error Handler
// -----------------------------------------------------
app.use(errorHandler);

module.exports = app;