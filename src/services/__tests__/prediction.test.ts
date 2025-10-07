import { predictCycle } from '../prediction';
import { PeriodSpan, PredictionInput } from '../../types';

describe('Prediction Service', () => {
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
      cycleLengthDays: 28,
    },
    {
      id: '3',
      startDate: '2024-02-26',
      endDate: '2024-03-01',
      cycleLengthDays: 28,
    },
  ];

  const mockInput: PredictionInput = {
    lastPeriodStart: '2024-02-26',
    avgCycleDays: 28,
    avgPeriodDays: 5,
    periods: mockPeriods,
  };

  it('predicts next period correctly', () => {
    const predictions = predictCycle(mockInput);
    
    expect(predictions).toBeDefined();
    expect(predictions.length).toBeGreaterThan(0);
    
    // Should predict the next period starting date
    const nextPeriod = predictions.find(p => p.isMenstrual);
    expect(nextPeriod).toBeDefined();
    expect(nextPeriod?.date).toBe('2024-03-25'); // 28 days after last period
  });

  it('predicts ovulation correctly', () => {
    const predictions = predictCycle(mockInput);
    
    const ovulationDay = predictions.find(p => p.isOvulation);
    expect(ovulationDay).toBeDefined();
    expect(ovulationDay?.date).toBe('2024-03-11'); // 14 days before next period
  });

  it('predicts fertile window correctly', () => {
    const predictions = predictCycle(mockInput);
    
    const fertileDays = predictions.filter(p => p.isFertile);
    expect(fertileDays.length).toBeGreaterThan(0);
    
    // Fertile window should be around ovulation
    const ovulationDate = new Date('2024-03-11');
    fertileDays.forEach(day => {
      const dayDate = new Date(day.date);
      const daysDiff = Math.abs(dayDate.getTime() - ovulationDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeLessThanOrEqual(5); // 5-day fertile window
    });
  });

  it('handles irregular cycles', () => {
    const irregularPeriods: PeriodSpan[] = [
      {
        id: '1',
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        cycleLengthDays: 25,
      },
      {
        id: '2',
        startDate: '2024-01-26',
        endDate: '2024-01-30',
        cycleLengthDays: 30,
      },
    ];

    const irregularInput: PredictionInput = {
      lastPeriodStart: '2024-01-26',
      avgCycleDays: 27, // Average of 25 and 30
      avgPeriodDays: 4,
      periods: irregularPeriods,
    };

    const predictions = predictCycle(irregularInput);
    expect(predictions).toBeDefined();
    expect(predictions.length).toBeGreaterThan(0);
  });

  it('handles empty periods array', () => {
    const emptyInput: PredictionInput = {
      lastPeriodStart: '2024-01-01',
      avgCycleDays: 28,
      avgPeriodDays: 5,
      periods: [],
    };

    const predictions = predictCycle(emptyInput);
    expect(predictions).toBeDefined();
    expect(predictions.length).toBeGreaterThan(0);
  });

  it('identifies today correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    const inputWithToday: PredictionInput = {
      lastPeriodStart: today,
      avgCycleDays: 28,
      avgPeriodDays: 5,
      periods: [{
        id: '1',
        startDate: today,
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cycleLengthDays: 28,
      }],
    };

    const predictions = predictCycle(inputWithToday);
    const todayPrediction = predictions.find(p => p.isToday);
    expect(todayPrediction).toBeDefined();
    expect(todayPrediction?.date).toBe(today);
  });
});
