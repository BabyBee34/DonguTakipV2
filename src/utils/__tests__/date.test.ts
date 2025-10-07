import { toISO, formatDate, addDays, isToday, getDaysBetween } from '../date';

describe('Date Utils', () => {
  describe('toISO', () => {
    it('converts Date to ISO string correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = toISO(date);
      expect(result).toBe('2024-01-15');
    });

    it('handles different timezones correctly', () => {
      const date = new Date('2024-01-15T23:30:00Z');
      const result = toISO(date);
      expect(result).toBe('2024-01-15');
    });

    it('handles edge case dates', () => {
      const date = new Date('2024-02-29T00:00:00Z'); // Leap year
      const result = toISO(date);
      expect(result).toBe('2024-02-29');
    });
  });

  describe('formatDate', () => {
    it('formats date with default locale', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toMatch(/\d{1,2}\s\w+\s\d{4}/); // Matches "15 January 2024" or similar
    });

    it('formats date with custom locale', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'tr');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('Invalid Date');
    });
  });

  describe('addDays', () => {
    it('adds positive days correctly', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(result.toISOString().split('T')[0]).toBe('2024-01-20');
    });

    it('adds negative days correctly', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);
      expect(result.toISOString().split('T')[0]).toBe('2024-01-10');
    });

    it('handles zero days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 0);
      expect(result.toISOString().split('T')[0]).toBe('2024-01-15');
    });

    it('handles month boundaries correctly', () => {
      const date = new Date('2024-01-31');
      const result = addDays(date, 1);
      expect(result.toISOString().split('T')[0]).toBe('2024-02-01');
    });

    it('handles year boundaries correctly', () => {
      const date = new Date('2023-12-31');
      const result = addDays(date, 1);
      expect(result.toISOString().split('T')[0]).toBe('2024-01-01');
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      const today = new Date();
      const result = isToday(today);
      expect(result).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = isToday(yesterday);
      expect(result).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = isToday(tomorrow);
      expect(result).toBe(false);
    });

    it('handles different times on the same day', () => {
      const today = new Date();
      const sameDayDifferentTime = new Date(today);
      sameDayDifferentTime.setHours(23, 59, 59, 999);
      
      const result = isToday(sameDayDifferentTime);
      expect(result).toBe(true);
    });
  });

  describe('getDaysBetween', () => {
    it('calculates days between dates correctly', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-05');
      const result = getDaysBetween(start, end);
      expect(result).toBe(4);
    });

    it('handles same day', () => {
      const date = new Date('2024-01-01');
      const result = getDaysBetween(date, date);
      expect(result).toBe(0);
    });

    it('handles reverse order (end before start)', () => {
      const start = new Date('2024-01-05');
      const end = new Date('2024-01-01');
      const result = getDaysBetween(start, end);
      expect(result).toBe(-4);
    });

    it('handles dates in different months', () => {
      const start = new Date('2024-01-31');
      const end = new Date('2024-02-03');
      const result = getDaysBetween(start, end);
      expect(result).toBe(3);
    });

    it('handles dates in different years', () => {
      const start = new Date('2023-12-31');
      const end = new Date('2024-01-03');
      const result = getDaysBetween(start, end);
      expect(result).toBe(3);
    });

    it('handles leap year correctly', () => {
      const start = new Date('2024-02-28');
      const end = new Date('2024-03-01');
      const result = getDaysBetween(start, end);
      expect(result).toBe(2); // Feb 29 is a leap day
    });
  });
});
