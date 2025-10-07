import { DailyLog, Symptom, PeriodSpan, CycleStats, MoodTrend, Mood } from '../types';

// Basit matematiksel fonksiyonlar
export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function standardDeviation(nums: number[]): number {
  if (nums.length === 0) return 0;
  const avg = mean(nums);
  const squareDiffs = nums.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

// Semptom frekansı hesaplama
export function calculateSymptomFrequency(logs: DailyLog[]): Record<Symptom, number> {
  const freq: Record<string, number> = {};
  
  logs.forEach(log => {
    log.symptoms.forEach(symptom => {
      freq[symptom] = (freq[symptom] || 0) + 1;
    });
  });
  
  const total = logs.length || 1;
  Object.keys(freq).forEach(key => {
    freq[key] = Math.round((freq[key] / total) * 100);
  });
  
  return freq as Record<Symptom, number>;
}

// Tahmin doğruluğu hesaplama
function calculateAccuracy(
  recentPeriods: PeriodSpan[],
  avgCycleLength: number
): number {
  if (recentPeriods.length < 2) return 0;
  
  let totalError = 0;
  for (let i = 1; i < recentPeriods.length; i++) {
    const predicted = avgCycleLength;
    const actual = recentPeriods[i].cycleLengthDays!;
    const error = Math.abs(predicted - actual);
    totalError += error;
  }
  
  const avgError = totalError / (recentPeriods.length - 1);
  const accuracy = Math.max(0, 100 - (avgError / avgCycleLength) * 100);
  
  return Math.round(accuracy);
}

// Döngü istatistikleri hesaplama
export function calculateCycleStats(periods: PeriodSpan[]): CycleStats {
  const completedPeriods = periods.filter(p => p.end && p.cycleLengthDays);
  
  if (completedPeriods.length < 2) {
    return {
      avgCycleLength: 28,
      avgPeriodLength: 5,
      totalCycles: completedPeriods.length,
      predictionAccuracy: 0,
      cycleVariability: 0,
    };
  }
  
  // Ortalama döngü süresi
  const cycleLengths = completedPeriods.map(p => p.cycleLengthDays!);
  const avgCycleLength = Math.round(mean(cycleLengths));
  
  // Ortalama adet süresi
  const periodLengths = completedPeriods.map(p => p.periodLengthDays!).filter(Boolean);
  const avgPeriodLength = periodLengths.length > 0 ? Math.round(mean(periodLengths)) : 5;
  
  // Döngü değişkenliği
  const cycleVariability = standardDeviation(cycleLengths);
  
  // Tahmin doğruluğu (son 3 döngü)
  const predictionAccuracy = calculateAccuracy(
    completedPeriods.slice(-3),
    avgCycleLength
  );
  
  return {
    avgCycleLength,
    avgPeriodLength,
    totalCycles: completedPeriods.length,
    predictionAccuracy,
    lastCycleLength: cycleLengths[cycleLengths.length - 1],
    cycleVariability: Math.round(cycleVariability * 10) / 10,
  };
}

// Ruh hali trendi hesaplama
export function calculateMoodTrend(logs: DailyLog[]): MoodTrend[] {
  const moodScores: Record<Mood, number> = {
    ecstatic: 9,
    happy: 7,
    calm: 6,
    neutral: 5,
    tired: 4,
    sad: 3,
    anxious: 3,
    irritable: 2,
    angry: 1,
  };
  
  return logs
    .filter(log => log.mood)
    .map(log => ({
      date: log.date,
      mood: log.mood!,
      moodScore: moodScores[log.mood!],
    }));
}

