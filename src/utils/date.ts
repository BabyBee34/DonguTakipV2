/**
 * Convert Date to local ISO string (yyyy-mm-dd)
 * Fixes timezone issues by using local date components
 */
export function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in ISO format (local timezone)
 */
export function getTodayISO(): string {
  return toISO(new Date());
}

/**
 * Add days to an ISO date string
 */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T12:00:00'); // Use noon to avoid DST issues
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/**
 * Calculate days between two ISO date strings
 */
export function daysBetween(startIso: string, endIso: string): number {
  const a = new Date(startIso + 'T12:00:00');
  const b = new Date(endIso + 'T12:00:00');
  const diff = b.getTime() - a.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if two ISO date strings are the same day
 */
export function isSameDay(aIso: string, bIso: string): boolean {
  return aIso === bIso;
}

/**
 * Check if an ISO date string is today (local timezone)
 */
export function isToday(iso: string): boolean {
  return isSameDay(iso, getTodayISO());
}

