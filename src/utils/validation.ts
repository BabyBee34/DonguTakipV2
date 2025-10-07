export function isDateWithinRange(dateISO: string, minISO: string, maxISO: string): boolean {
  const d = new Date(dateISO + 'T12:00:00').getTime();
  const min = new Date(minISO + 'T12:00:00').getTime();
  const max = new Date(maxISO + 'T12:00:00').getTime();
  return d >= min && d <= max;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
/**
 * Validation utility functions
 */

/**
 * Validate if a date string is in ISO format (yyyy-mm-dd)
 */
export function isValidISODate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate cycle length (21-35 days)
 */
export function isValidCycleLength(days: number): boolean {
  return days >= 21 && days <= 35;
}

/**
 * Validate period length (2-10 days)
 */
export function isValidPeriodLength(days: number): boolean {
  return days >= 2 && days <= 10;
}

/**
 * Validate note length (max 500 characters)
 */
export function isValidNoteLength(note: string): boolean {
  return note.length <= 500;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate PIN code (4-6 digits)
 */
export function isValidPIN(pin: string): boolean {
  const regex = /^\d{4,6}$/;
  return regex.test(pin);
}

/**
 * Validate time format (HH:mm)
 */
export function isValidTimeFormat(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

