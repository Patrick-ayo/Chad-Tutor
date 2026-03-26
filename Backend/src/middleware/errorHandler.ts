import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ServiceNotFoundError } from '../services/serviceErrors';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('Error:', err);

  if (err instanceof ServiceNotFoundError) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.issues.map((issue) => issue.message).join(', '),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Duplicate Entry',
        message: 'A record with this identifier already exists',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Requested record was not found',
      });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Constraint Error',
        message: 'Operation violates a foreign key constraint',
      });
    }
  }

  if (
    err instanceof SyntaxError &&
    'body' in err
  ) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON payload',
    });
  }

  const errorWithStatus = err as Error & { statusCode?: number };
  if (typeof errorWithStatus.statusCode === 'number') {
    const statusCode = errorWithStatus.statusCode;
    return res.status(statusCode).json({
      error: statusCode >= 500 ? 'Internal Server Error' : 'Request Failed',
      message: err.message,
    });
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }
  
  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'A record with this identifier already exists',
    });
  }
  
  // Default error
  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
