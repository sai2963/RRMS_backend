import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler } from './middleware/error.handler';

// Routes
import authRoutes from './routes/auth.routes';
import reservationRoutes from './routes/reservation.routes';
import adminRoutes from './routes/admin.routes';
import tableRoutes from './routes/table.routes';

const app = express();

// ─── Security ──────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// ─── Request Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ───────────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'RRC Restaurant API is running', env: env.NODE_ENV });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/admin/reservations', adminRoutes);
app.use('/api/v1/tables', tableRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Centralized Error Handler ─────────────────────────────────
app.use(errorHandler);

export default app;
