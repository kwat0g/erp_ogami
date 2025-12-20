export function sanitizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

export function sanitizeOptionalText(value: unknown): string | null {
  const s = sanitizeText(value);
  return s.length ? s : null;
}

export function normalizeEmail(value: unknown): string {
  return sanitizeText(value).toLowerCase();
}

export function isValidEmail(email: string): boolean {
  // Simple, practical email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizePhone(value: unknown): string | null {
  const raw = sanitizeText(value);
  if (!raw) return null;

  // Philippine mobile normalization:
  // Accept: 09XXXXXXXXX, 9XXXXXXXXX, 639XXXXXXXXX, +639XXXXXXXXX
  // Normalize to: 09XXXXXXXXX
  let digits = raw.replace(/\D+/g, '');

  if (!digits) return null;

  // If it starts with country code 63, convert to leading 0
  if (digits.startsWith('63')) {
    digits = '0' + digits.slice(2);
  }

  // If user typed 9XXXXXXXXX, add leading 0
  if (digits.length === 10 && digits.startsWith('9')) {
    digits = '0' + digits;
  }

  return digits;
}

export function isValidPhone(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

export function sanitizeName(value: unknown): string {
  return sanitizeText(value);
}

export function isValidName(name: string): boolean {
  // Allow letters, spaces, hyphen, apostrophe, dot. Reject numbers/symbols.
  return /^[A-Za-z][A-Za-z\s.'-]{0,98}[A-Za-z.]$/.test(name);
}

export function isValidISODate(value: string): boolean {
  // yyyy-mm-dd
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00.000Z');
  return !Number.isNaN(d.getTime());
}

export function assertEnum<T extends readonly string[]>(value: unknown, allowed: T): T[number] | null {
  const s = sanitizeText(value);
  if (!s) return null;
  return (allowed as readonly string[]).includes(s) ? (s as T[number]) : null;
}

export function assertNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}
