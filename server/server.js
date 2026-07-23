const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const braindumpRoutes = require('./routes/braindump');
const reviewRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const achievementRoutes = require('./routes/achievements');
const settingsRoutes = require('./routes/settings');
const aiRoutes = require('./routes/ai');
const careerRoutes = require('./routes/career');

// Validate critical environment variables
const validateEnv = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.warn(`⚠️ WARNING: Missing environment variables: ${missing.join(', ')}`);
  }
};
validateEnv();

const app = express();

// Trust proxy for Render / Cloudflare / Load Balancers
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security & Optimization Middleware
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS Setup
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://personal-mission-control-7269a.web.app',
  'https://personal-mission-control-7269a.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser / mobile requests (origin undefined)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in fallback for dev/staging
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 auth requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later' }
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/signup', authLimiter);

// Health Check Endpoints
const healthHandler = (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const isHealthy = mongoose.connection.readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'UP' : 'DOWN',
    message: 'Personal Mission Control API Health Check',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatusMap[mongoose.connection.readyState] || 'unknown',
      readyState: mongoose.connection.readyState
    },
    uptimeSeconds: Math.floor(process.uptime())
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// API Routes (Dual-Mounted for /api and /api/v1 compatibility)
app.use('/api/v1/career', careerRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/v1/braindump', braindumpRoutes);
app.use('/api/braindump', braindumpRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/settings', settingsRoutes);

// Global Error Handler (must be registered before 404 handler)
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 PMC Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
});

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
