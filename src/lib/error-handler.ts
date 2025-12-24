// Centralized error handling for API endpoints

import { NextApiResponse } from 'next';
import { ValidationError } from './validation';
import { logAudit, AUDIT_ACTIONS } from './audit-log';

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

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Invalid request') {
    super(message, 400);
  }
}

// Database error codes
const DB_ERROR_CODES: Record<string, { message: string; statusCode: number }> = {
  ER_DUP_ENTRY: { message: 'Record already exists', statusCode: 409 },
  ER_NO_REFERENCED_ROW: { message: 'Referenced record does not exist', statusCode: 400 },
  ER_ROW_IS_REFERENCED: { message: 'Cannot delete record - it is referenced by other records', statusCode: 400 },
  ER_DATA_TOO_LONG: { message: 'Data exceeds maximum length', statusCode: 400 },
  ER_TRUNCATED_WRONG_VALUE: { message: 'Invalid data format', statusCode: 400 },
  ER_BAD_NULL_ERROR: { message: 'Required field cannot be null', statusCode: 400 },
};

/**
 * Handle database errors and convert to user-friendly messages
 */
export function handleDatabaseError(error: any): AppError {
  const dbError = DB_ERROR_CODES[error.code];
  
  if (dbError) {
    return new AppError(dbError.message, dbError.statusCode);
  }

  // Log unexpected database errors
  console.error('Unexpected database error:', error);
  return new AppError('Database operation failed', 500, false);
}

/**
 * Main error handler for API endpoints
 */
export function handleError(
  error: any,
  res: NextApiResponse,
  context?: {
    userId?: string;
    action?: string;
    module?: string;
    recordId?: string;
  }
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle different error types
  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else if (error.code && DB_ERROR_CODES[error.code]) {
    const dbError = handleDatabaseError(error);
    statusCode = dbError.statusCode;
    message = dbError.message;
    isOperational = dbError.isOperational;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    isOperational = true;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    isOperational = true;
  }

  // Log error for debugging (but not validation errors)
  if (!isOperational || statusCode >= 500) {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  // Log to audit if context provided
  if (context && context.userId && context.action) {
    logAudit({
      userId: context.userId,
      action: context.action,
      module: context.module || 'UNKNOWN',
      recordId: context.recordId,
      status: 'FAILED',
      errorMessage: message,
    }).catch(err => console.error('Failed to log audit:', err));
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: error.stack }),
  });
}

/**
 * Async error wrapper for API handlers
 */
export function asyncHandler(
  handler: (req: any, res: NextApiResponse) => Promise<void>
) {
  return async (req: any, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleError(error, res);
    }
  };
}

/**
 * Validate request body against schema
 */
export function validateRequestBody(
  body: any,
  requiredFields: string[],
  optionalFields: string[] = []
): void {
  // Check for required fields
  const missingFields = requiredFields.filter(field => {
    const value = body[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  if (missingFields.length > 0) {
    throw new BadRequestError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Check for unexpected fields
  const allowedFields = [...requiredFields, ...optionalFields];
  const unexpectedFields = Object.keys(body).filter(field => !allowedFields.includes(field));

  if (unexpectedFields.length > 0) {
    console.warn('Unexpected fields in request:', unexpectedFields);
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(query: any): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Success response helper
 */
export function sendSuccess(
  res: NextApiResponse,
  data: any,
  message?: string,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
}

/**
 * Check if user has permission for operation
 */
export function requirePermission(
  userRole: string,
  allowedRoles: string[],
  operation?: string
): void {
  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError(
      operation
        ? `You do not have permission to ${operation}`
        : 'Access denied'
    );
  }
}

/**
 * Transaction wrapper for database operations
 */
export async function withTransaction<T>(
  operation: (connection: any) => Promise<T>
): Promise<T> {
  const { getConnection } = require('./db');
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  handleError,
  handleDatabaseError,
  asyncHandler,
  validateRequestBody,
  validatePagination,
  sendSuccess,
  requirePermission,
  withTransaction,
};
