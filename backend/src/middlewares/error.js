import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/logger.js';

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default error status code
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong';
  let details = err.details || null;
  let code = err.code || 'INTERNAL_SERVER_ERROR';

  // Handle common error types
  if (err.name === 'ValidationError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation Error';
    details = err.details || err.errors;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Authentication failed';
    code = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    statusCode = StatusCodes.FORBIDDEN;
    message = 'Insufficient permissions';
    code = 'FORBIDDEN';
  } else if (err.name === 'NotFoundError') {
    statusCode = StatusCodes.NOT_FOUND;
    message = 'Resource not found';
    code = 'NOT_FOUND';
  } else if (err.name === 'ConflictError') {
    statusCode = StatusCodes.CONFLICT;
    message = 'Resource already exists';
    code = 'CONFLICT';
  } else if (err.name === 'RateLimitExceeded') {
    statusCode = StatusCodes.TOO_MANY_REQUESTS;
    message = 'Too many requests, please try again later';
    code = 'RATE_LIMIT_EXCEEDED';
  }

  // Log the error
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      code: err.code,
      details: err.details,
    });
  } else if (statusCode >= 400) {
    logger.warn({
      message: err.message,
      code: err.code,
      details: err.details,
      path: req.path,
      method: req.method,
    });
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    code,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 400, code, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code || 'APP_ERROR';
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Not authenticated') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource || 'Resource'} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

class RateLimitExceededError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitExceeded';
  }
}

export {
  errorHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitExceededError,
};

// This file provides a comprehensive error handling system for the application.
// It includes a middleware for handling errors and custom error classes for different scenarios.
// The error handler formats errors consistently and logs them appropriately based on their severity.
// Custom error classes make it easier to handle specific error cases throughout the application.
