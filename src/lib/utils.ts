import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '0';
  return value.toFixed(decimals);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateCode(prefix: string, number: number, length: number = 6): string {
  return `${prefix}${number.toString().padStart(length, '0')}`;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    PAID: 'bg-green-100 text-green-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    NORMAL: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string = 'This field'): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) return { isValid: true }; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
}

/**
 * Validate phone number (basic format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) return { isValid: true }; // Optional field
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
    return { isValid: false, error: 'Invalid phone number' };
  }
  return { isValid: true };
}

/**
 * Validate positive integer (no decimals, greater than 0)
 */
export function validatePositiveInteger(value: any, fieldName: string = 'Value'): ValidationResult {
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  if (num <= 0) {
    return { isValid: false, error: `${fieldName} must be greater than 0` };
  }
  if (!Number.isInteger(num)) {
    return { isValid: false, error: `${fieldName} must be a whole number (no decimals)` };
  }
  return { isValid: true };
}

/**
 * Validate positive number (can have decimals, greater than 0)
 */
export function validatePositiveNumber(value: any, fieldName: string = 'Value'): ValidationResult {
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  if (num <= 0) {
    return { isValid: false, error: `${fieldName} must be greater than 0` };
  }
  return { isValid: true };
}

/**
 * Validate non-negative number (>= 0)
 */
export function validateNonNegative(value: any, fieldName: string = 'Value'): ValidationResult {
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  if (num < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }
  return { isValid: true };
}

/**
 * Validate date is not in the past
 */
export function validateFutureDate(date: string, fieldName: string = 'Date'): ValidationResult {
  if (!date) return { isValid: true }; // Optional field
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return { isValid: false, error: `${fieldName} cannot be in the past` };
  }
  return { isValid: true };
}

/**
 * Validate date range (start date before end date)
 */
export function validateDateRange(startDate: string, endDate: string): ValidationResult {
  if (!startDate || !endDate) return { isValid: true };
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return { isValid: false, error: 'Start date must be before end date' };
  }
  return { isValid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = 'Field'
): ValidationResult {
  if (!value) return { isValid: true }; // Optional field
  
  if (value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  if (value.length > max) {
    return { isValid: false, error: `${fieldName} must not exceed ${max} characters` };
  }
  return { isValid: true };
}

/**
 * Validate code format (alphanumeric with hyphens)
 */
export function validateCode(code: string, fieldName: string = 'Code'): ValidationResult {
  if (!code) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  const codeRegex = /^[A-Z0-9\-]+$/;
  if (!codeRegex.test(code)) {
    return { isValid: false, error: `${fieldName} must contain only uppercase letters, numbers, and hyphens` };
  }
  return { isValid: true };
}

/**
 * Validate array has items
 */
export function validateArrayNotEmpty(arr: any[], fieldName: string = 'Items'): ValidationResult {
  if (!arr || arr.length === 0) {
    return { isValid: false, error: `At least one ${fieldName.toLowerCase()} is required` };
  }
  return { isValid: true };
}

/**
 * Sanitize integer input (remove decimals)
 */
export function sanitizeInteger(value: any): number {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.floor(Math.abs(num));
}

/**
 * Sanitize decimal input (limit decimal places)
 */
export function sanitizeDecimal(value: any, decimals: number = 2): number {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return parseFloat(num.toFixed(decimals));
}

/**
 * Format input as integer (for onChange handlers)
 */
export function formatIntegerInput(value: string): string {
  return value.replace(/[^\d]/g, '');
}

/**
 * Format input as decimal (for onChange handlers)
 */
export function formatDecimalInput(value: string, decimals: number = 2): string {
  // Allow digits and one decimal point
  let formatted = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = formatted.split('.');
  if (parts.length > 2) {
    formatted = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places
  if (parts.length === 2 && parts[1] && parts[1].length > decimals) {
    formatted = parts[0] + '.' + parts[1].substring(0, decimals);
  }
  
  return formatted;
}
