// Security utilities and middleware for API protection

import { NextApiRequest, NextApiResponse } from 'next';
import { findSessionByToken } from './auth';
import { UnauthorizedError, ForbiddenError, BadRequestError } from './error-handler';

// Rate limiting store (in-memory - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const identifier = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const key = `${identifier}:${req.url}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (record && now < record.resetTime) {
      if (record.count >= maxRequests) {
        res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        });
        return;
      }
      record.count++;
    } else {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    }

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      const entries = Array.from(rateLimitStore.entries());
      for (const [k, v] of entries) {
        if (now > v.resetTime) {
          rateLimitStore.delete(k);
        }
      }
    }

    next();
  };
}

/**
 * Authentication middleware
 */
export async function requireAuth(req: NextApiRequest): Promise<any> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('Authentication token is required');
  }

  const session = await findSessionByToken(token);

  if (!session) {
    throw new UnauthorizedError('Invalid or expired session');
  }

  return session;
}

/**
 * Role-based authorization middleware
 */
export function requireRole(session: any, allowedRoles: string[]): void {
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError('You do not have permission to perform this action');
  }
}

/**
 * Input sanitization for SQL injection prevention
 */
export function sanitizeForSQL(input: any): any {
  if (typeof input === 'string') {
    return input.replace(/['";\\]/g, '');
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeForSQL);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      sanitized[key] = sanitizeForSQL(input[key]);
    }
    return sanitized;
  }
  return input;
}

/**
 * XSS prevention - sanitize HTML content
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * CSRF token validation
 */
export function validateCSRFToken(req: NextApiRequest): void {
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.cookies['csrf-token'];

  if (!token || !sessionToken || token !== sessionToken) {
    throw new ForbiddenError('Invalid CSRF token');
  }
}

/**
 * IP whitelist check (for sensitive operations)
 */
export function checkIPWhitelist(req: NextApiRequest, whitelist: string[]): void {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
  
  if (!ip || !whitelist.includes(ip as string)) {
    throw new ForbiddenError('Access denied from this IP address');
  }
}

/**
 * Content Security Policy headers
 */
export function setSecurityHeaders(res: NextApiResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: any, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): void {
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'application/pdf'];
  const allowedExtensions = options.allowedExtensions || ['.jpg', '.jpeg', '.png', '.pdf'];

  if (file.size > maxSize) {
    throw new BadRequestError(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new BadRequestError(`File type ${file.type} is not allowed`);
  }

  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new BadRequestError(`File extension ${ext} is not allowed`);
  }
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true };
}

/**
 * Detect suspicious patterns in input
 */
export function detectSuspiciousInput(input: string): boolean {
  const suspiciousPatterns = [
    /(\bOR\b.*=.*)/i,           // SQL injection
    /(\bUNION\b.*\bSELECT\b)/i, // SQL injection
    /<script[^>]*>.*<\/script>/i, // XSS
    /javascript:/i,              // XSS
    /on\w+\s*=/i,               // Event handlers
    /\.\.\/\.\.\//,             // Path traversal
    /%00/,                      // Null byte injection
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  userId: string | undefined,
  activity: string,
  details: any,
  req: NextApiRequest
): Promise<void> {
  const { logAudit } = require('./audit-log');
  
  await logAudit({
    userId: userId || 'ANONYMOUS',
    action: 'SUSPICIOUS_ACTIVITY',
    module: 'SECURITY',
    status: 'FAILED',
    errorMessage: activity,
    ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
    newValue: details,
  });

  console.warn('Suspicious activity detected:', {
    userId,
    activity,
    details,
    ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
  });
}

/**
 * Session timeout check
 */
export function checkSessionTimeout(session: any, maxIdleTime: number = 30 * 60 * 1000): void {
  const lastActivity = new Date(session.lastActivity || session.createdAt).getTime();
  const now = Date.now();

  if (now - lastActivity > maxIdleTime) {
    throw new UnauthorizedError('Session expired due to inactivity');
  }
}

/**
 * Prevent concurrent modifications
 */
export function checkConcurrentModification(
  currentVersion: number,
  requestedVersion: number
): void {
  if (currentVersion !== requestedVersion) {
    throw new BadRequestError(
      'Record has been modified by another user. Please refresh and try again.'
    );
  }
}

/**
 * Validate business hours (optional feature)
 */
export function checkBusinessHours(allowedHours: { start: number; end: number }): void {
  const now = new Date();
  const hour = now.getHours();

  if (hour < allowedHours.start || hour >= allowedHours.end) {
    throw new ForbiddenError(
      `This operation is only allowed during business hours (${allowedHours.start}:00 - ${allowedHours.end}:00)`
    );
  }
}

export default {
  rateLimit,
  requireAuth,
  requireRole,
  sanitizeForSQL,
  sanitizeHTML,
  validateCSRFToken,
  checkIPWhitelist,
  setSecurityHeaders,
  validateFileUpload,
  validatePasswordStrength,
  detectSuspiciousInput,
  logSuspiciousActivity,
  checkSessionTimeout,
  checkConcurrentModification,
  checkBusinessHours,
};
