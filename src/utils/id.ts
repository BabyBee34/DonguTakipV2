// UUID generator utility
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique UUID v4 identifier
 * @returns UUID string
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a short unique ID (for non-critical use cases)
 * @returns 8-character alphanumeric string
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

