import { calculateCycleStats, calculateSymptomFrequency } from '../statistics';
import { PeriodSpan, DailyLog, Symptom } from '../../types';

describe('Statistics Service', () => {
  const mockPeriods: PeriodSpan[] = [
    {
      id: '1',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      cycleLengthDays: 28,
    },
    {
      id: '2',
      startDate: '2024-01-29',
      endDate: '2024-02-02',
      cycleLengthDays: 29,
    },
    {
      id: '3',
      startDate: '2024-02-27',
      endDate: '2024-03-02',
      cycleLengthDays: 27,
    },
  ];

  const mockLogs: DailyLog[] = [
    {
      id: '1',
      date: '2024-01-01',
      mood: 'sad',
      symptoms: ['cramp', 'headache'],
      note: 'Feeling unwell',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      date: '2024-01-02',
      mood: 'neutral',
      symptoms: ['cramp'],
      note: '',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      date: '2024-01-29',
      mood: 'sad',
      symptoms: ['cramp', 'bloating'],
      note: 'Period started',
      createdAt: '2024-01-29T00:00:00Z',
      updatedAt: '2024-01-29T00:00:00Z',
    },
    {
      id: '4',
      date: '2024-01-30',
      mood: 'neutral',
      symptoms: ['cramp'],
      note: '',
      createdAt: '2024-01-30T00:00:00Z',
      updatedAt: '2024-01-30T00:00:00Z',
    },
  ];

  describe('calculateCycleStats', () => {
    it('calculates average cycle length correctly', () => {
      const stats = calculateCycleStats(mockPeriods);
      
      expect(stats.avgCycleLength).toBe(28); // (28 + 29 + 27) / 3
      expect(stats.totalCycles).toBe(3);
    });

    it('calculates average period length correctly', () => {
      const stats = calculateCycleStats(mockPeriods);
      
      expect(stats.avgPeriodLength).toBe(5); // All periods are 5 days
    });

    it('calculates last cycle length correctly', () => {
      const stats = calculateCycleStats(mockPeriods);
      
      expect(stats.lastCycleLength).toBe(27); // Last period's cycle length
    });

    it('calculates cycle variability correctly', () => {
      const stats = calculateCycleStats(mockPeriods);
      
      // Variability should be calculated based on standard deviation
      expect(stats.cycleVariability).toBeGreaterThanOrEqual(0);
      expect(stats.cycleVariability).toBeLessThanOrEqual(100);
    });

    it('handles empty periods array', () => {
      const stats = calculateCycleStats([]);
      
      expect(stats.avgCycleLength).toBe(28); // Default value
      expect(stats.avgPeriodLength).toBe(5); // Default value
      expect(stats.totalCycles).toBe(0);
      expect(stats.lastCycleLength).toBeUndefined();
    });

    it('handles single period', () => {
      const singlePeriod = [mockPeriods[0]];
      const stats = calculateCycleStats(singlePeriod);
      
      expect(stats.avgCycleLength).toBe(28);
      expect(stats.totalCycles).toBe(1);
      expect(stats.lastCycleLength).toBe(28);
    });

    it('calculates prediction accuracy', () => {
      const stats = calculateCycleStats(mockPeriods);
      
      expect(stats.predictionAccuracy).toBeGreaterThanOrEqual(0);
      expect(stats.predictionAccuracy).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateSymptomFrequency', () => {
    it('calculates symptom frequencies correctly', () => {
      const frequencies = calculateSymptomFrequency(mockLogs);
      
      expect(frequencies.cramp).toBe(100); // Present in all 4 logs
      expect(frequencies.headache).toBe(25); // Present in 1 out of 4 logs
      expect(frequencies.bloating).toBe(25); // Present in 1 out of 4 logs
    });

    it('handles empty logs array', () => {
      const frequencies = calculateSymptomFrequency([]);
      
      expect(Object.keys(frequencies)).toHaveLength(0);
    });

    it('handles logs without symptoms', () => {
      const logsWithoutSymptoms: DailyLog[] = [
        {
          id: '1',
          date: '2024-01-01',
          mood: 'happy',
          symptoms: [],
          note: 'Great day',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      
      const frequencies = calculateSymptomFrequency(logsWithoutSymptoms);
      
      expect(Object.keys(frequencies)).toHaveLength(0);
    });

    it('handles logs with undefined symptoms', () => {
      const logsWithUndefinedSymptoms: DailyLog[] = [
        {
          id: '1',
          date: '2024-01-01',
          mood: 'happy',
          symptoms: undefined as any,
          note: 'Great day',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      
      const frequencies = calculateSymptomFrequency(logsWithUndefinedSymptoms);
      
      expect(Object.keys(frequencies)).toHaveLength(0);
    });

    it('calculates percentages correctly for different symptom counts', () => {
      const testLogs: DailyLog[] = [
        {
          id: '1',
          date: '2024-01-01',
          mood: 'neutral',
          symptoms: ['cramp', 'headache'],
          note: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          date: '2024-01-02',
          mood: 'neutral',
          symptoms: ['cramp'],
          note: '',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          date: '2024-01-03',
          mood: 'neutral',
          symptoms: ['headache'],
          note: '',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
        {
          id: '4',
          date: '2024-01-04',
          mood: 'neutral',
          symptoms: ['bloating'],
          note: '',
          createdAt: '2024-01-04T00:00:00Z',
          updatedAt: '2024-01-04T00:00:00Z',
        },
      ];
      
      const frequencies = calculateSymptomFrequency(testLogs);
      
      expect(frequencies.cramp).toBe(50); // 2 out of 4 logs
      expect(frequencies.headache).toBe(50); // 2 out of 4 logs
      expect(frequencies.bloating).toBe(25); // 1 out of 4 logs
    });
  });
});
