import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/auth.service';
import { HTTP_STATUS } from '../constants';
import { env } from '../config/env';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // MongoDB duplicate key error
  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field = Object.keys(mongoErr.keyValue)[0];
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: `A record with this ${field} already exists`,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(HTTP_STATUS.UNPROCESSABLE).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired session',
    });
    return;
  }

  // Unknown errors — don't leak stack traces in production
  console.error('Unhandled Error:', err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'An unexpected error occurred',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
