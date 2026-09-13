const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const authRoutes       = require('./routes/auth.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const faceRoutes       = require('./routes/face.routes');
const leaveRoutes      = require('./routes/leave.routes');
const adminRoutes      = require('./routes/admin.routes');
const payrollRoutes    = require('./routes/payroll.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { logger }       = require('./utils/logger');

const app = express();

// ─── Security headers ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ─── Body parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));   // larger for face embeddings
app.use(express.urlencoded({ extended: true }));

// ─── HTTP logger ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ─── Global rate limiter ──────────────────────────────────────
app.use(rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMIT', message: 'Too many requests.' },
}));

// ─── Auth rate limiter (stricter) ─────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,   // 15 minutes
  max: 10,
  message: { success: false, error: 'RATE_LIMIT', message: 'Too many login attempts.' },
});

// ─── Attendance limiter (no-login QR endpoint) ────────────────
const attendLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: { success: false, error: 'RATE_LIMIT', message: 'Slow down.' },
});

// ─── Database connection middleware (Serverless & Stateful) ──
const { connectDB } = require('./config/db');
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authLimiter,   authRoutes);
app.use('/api/attendance', attendLimiter, attendanceRoutes);
app.use('/api/face',                      faceRoutes);
app.use('/api/leave',                     leaveRoutes);
app.use('/api/admin',                     adminRoutes);
app.use('/api/payroll',                   payrollRoutes);

// ─── Health ───────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok',
  service: 'Attendzo API',
  timestamp: new Date().toISOString(),
}));

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({
  success: false, error: 'NOT_FOUND', message: 'Route not found.',
}));

// ─── Error handler ────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
