import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import { rateLimit } from 'express-rate-limit';
import { logger, httpLogger } from './lib/logger.js';
import { errorHandler } from './middlewares/error.js';
import { auth } from './middlewares/auth.js';
import { requireRole } from './middlewares/rbac.js';
import { healthRouter } from './routes/health.js';
import { publicRoutes } from './routes/public.routes.js';
import { userRoutes } from './routes/user.routes.js';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(limiter);

// Request logging
app.use(httpLogger);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Public API routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1', publicRoutes);

// Protected user routes (require authentication)
app.use('/api/v1', userRoutes);

// Example protected route (for demonstration)
app.get('/api/v1/protected', auth, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Example admin route (for demonstration)
app.get(
  '/api/v1/admin',
  auth,
  requireRole('ADMIN'),
  (req, res) => {
    res.json({ message: 'Admin access granted', user: req.user });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: 'Not Found',
  });
});

// Global error handler
app.use(errorHandler);

export { app };
