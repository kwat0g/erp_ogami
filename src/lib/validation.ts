// Centralized validation utilities for ERP system

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Philippine format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+63|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// Number validation
export const isValidNumber = (value: any, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Date validation
export const isValidDate = (date: string): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const isFutureDate = (date: string): boolean => {
  return new Date(date) > new Date();
};

export const isPastDate = (date: string): boolean => {
  return new Date(date) < new Date();
};

// String length validation
export const isValidLength = (str: string, min: number, max: number): boolean => {
  return str.length >= min && str.length <= max;
};

// Required field validation
export const validateRequired = (fields: Record<string, any>, requiredFields: string[]): string[] => {
  const errors: string[] = [];
  requiredFields.forEach(field => {
    if (!fields[field] || (typeof fields[field] === 'string' && fields[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });
  return errors;
};

// Quantity validation
export const validateQuantity = (quantity: number, availableStock?: number): void => {
  if (!isValidNumber(quantity, 0.001)) {
    throw new ValidationError('Quantity must be greater than 0');
  }
  if (availableStock !== undefined && quantity > availableStock) {
    throw new ValidationError(`Insufficient stock. Available: ${availableStock}`);
  }
};

// Price validation
export const validatePrice = (price: number): void => {
  if (!isValidNumber(price, 0)) {
    throw new ValidationError('Price must be a positive number');
  }
};

// Date range validation
export const validateDateRange = (startDate: string, endDate: string): void => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new ValidationError('Invalid date format');
  }
  if (new Date(startDate) > new Date(endDate)) {
    throw new ValidationError('Start date must be before end date');
  }
};

// Account code validation (for GL)
export const validateAccountCode = (code: string): void => {
  if (!/^[0-9]{4,10}$/.test(code)) {
    throw new ValidationError('Account code must be 4-10 digits');
  }
};

// Journal entry validation
export const validateJournalEntry = (lines: any[]): void => {
  if (lines.length < 2) {
    throw new ValidationError('Journal entry must have at least 2 lines');
  }

  const totalDebit = lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new ValidationError(`Journal entry is not balanced. Debits: ${totalDebit}, Credits: ${totalCredit}`);
  }

  lines.forEach((line, index) => {
    if (!line.accountId) {
      throw new ValidationError(`Line ${index + 1}: Account is required`);
    }
    if (line.debitAmount > 0 && line.creditAmount > 0) {
      throw new ValidationError(`Line ${index + 1}: Cannot have both debit and credit amounts`);
    }
    if (line.debitAmount === 0 && line.creditAmount === 0) {
      throw new ValidationError(`Line ${index + 1}: Must have either debit or credit amount`);
    }
  });
};

// SQL injection prevention
export const sanitizeSQLInput = (input: string): string => {
  return input.replace(/['";\\]/g, '');
};

// XSS prevention
export const sanitizeHTML = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate UUID format
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Batch validation for arrays
export const validateArray = (arr: any[], minLength: number = 1, maxLength?: number): void => {
  if (!Array.isArray(arr)) {
    throw new ValidationError('Expected an array');
  }
  if (arr.length < minLength) {
    throw new ValidationError(`Array must have at least ${minLength} items`);
  }
  if (maxLength && arr.length > maxLength) {
    throw new ValidationError(`Array cannot have more than ${maxLength} items`);
  }
};

// Credit limit validation
export const validateCreditLimit = (amount: number, creditLimit: number, currentBalance: number): void => {
  if (amount + currentBalance > creditLimit) {
    throw new ValidationError(`Credit limit exceeded. Available credit: ${creditLimit - currentBalance}`);
  }
};

// Percentage validation
export const validatePercentage = (value: number): void => {
  if (!isValidNumber(value, 0, 100)) {
    throw new ValidationError('Percentage must be between 0 and 100');
  }
};

// BOM validation
export const validateBOM = (lines: any[]): void => {
  if (lines.length === 0) {
    throw new ValidationError('BOM must have at least one component');
  }

  lines.forEach((line, index) => {
    if (!line.componentItemId) {
      throw new ValidationError(`Line ${index + 1}: Component item is required`);
    }
    if (!isValidNumber(line.quantity, 0.001)) {
      throw new ValidationError(`Line ${index + 1}: Invalid quantity`);
    }
    if (line.scrapPercentage && !isValidNumber(line.scrapPercentage, 0, 100)) {
      throw new ValidationError(`Line ${index + 1}: Scrap percentage must be between 0 and 100`);
    }
  });
};

// Invoice validation
export const validateInvoice = (items: any[], customerId: string): void => {
  if (!customerId) {
    throw new ValidationError('Customer is required');
  }

  if (items.length === 0) {
    throw new ValidationError('Invoice must have at least one item');
  }

  items.forEach((item, index) => {
    if (!item.description) {
      throw new ValidationError(`Line ${index + 1}: Description is required`);
    }
    if (!isValidNumber(item.quantity, 0.001)) {
      throw new ValidationError(`Line ${index + 1}: Invalid quantity`);
    }
    if (!isValidNumber(item.unitPrice, 0)) {
      throw new ValidationError(`Line ${index + 1}: Invalid unit price`);
    }
  });
};

// Export validation utilities
export default {
  sanitizeInput,
  sanitizeSQLInput,
  sanitizeHTML,
  isValidEmail,
  isValidPhone,
  isValidNumber,
  isValidDate,
  isFutureDate,
  isPastDate,
  isValidLength,
  isValidUUID,
  validateRequired,
  validateQuantity,
  validatePrice,
  validateDateRange,
  validateAccountCode,
  validateJournalEntry,
  validateArray,
  validateCreditLimit,
  validatePercentage,
  validateBOM,
  validateInvoice,
  ValidationError,
};
