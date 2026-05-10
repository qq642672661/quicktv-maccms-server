import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error('Application error:', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method
    });

    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode
      }
    });
  }

  logger.error('Unexpected error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  return res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500
    }
  });
};

export default errorHandler;
