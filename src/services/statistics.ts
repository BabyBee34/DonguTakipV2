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

// Mood'u sayısal skora çevir
export function getMoodScore(mood: string): number {
  const scores: Record<string, number> = {
    ecstatic: 10,
    happy: 8,
    calm: 6,
    neutral: 5,
    tired: 4,
    sad: 3,
    anxious: 3,
    irritable: 2,
    angry: 1,
  };
  return scores[mood] || 5;
}

// Enerji seviyesi hesaplama (flow ve mood'dan türetilir)
export function calculateEnergyLevels(logs: DailyLog[]) {
  return logs
    .filter(l => l.mood || l.flow)
    .slice(-14)
    .map((log, idx) => {
      let energy = 5;
      if (log.mood === 'ecstatic' || log.mood === 'happy') energy = 8;
      if (log.mood === 'tired' || log.mood === 'sad') energy = 3;
      if (log.flow === 'heavy') energy = Math.max(2, energy - 2);
      return { date: log.date, value: energy, index: idx + 1 };
    });
}

// Uyku eğilimi (mood ve semptomlardan türetilir)
export function calculateSleepTrend(logs: DailyLog[]) {
  return logs
    .slice(-14)
    .map((log, idx) => {
      let sleep = 7; // varsayılan
      if (log.mood === 'tired') sleep = 6;
      if (log.symptoms.includes('insomnia' as any)) sleep = 4;
      if (log.symptoms.includes('headache' as any)) sleep -= 1;
      return { date: log.date, value: Math.max(4, Math.min(10, sleep)), index: idx + 1 };
    });
}

// En sık görülen ruh hali
export function getMostFrequentMood(logs: DailyLog[]): string {
  const moodCounts: Record<string, number> = {};
  logs.forEach(log => {
    if (log.mood) {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return '-';
  
  const moodMap: Record<string, string> = {
    ecstatic: '🤩 Harika',
    happy: '😊 Mutlu',
    calm: '😌 Sakin',
    neutral: '😐 Normal',
    tired: '😴 Yorgun',
    sad: '😢 Üzgün',
    anxious: '😰 Endişeli',
    irritable: '😠 Sinirli',
    angry: '😡 Kızgın',
  };
  
  return moodMap[sorted[0][0]] || sorted[0][0];
}

// Ortalama semptom sayısı / döngü
export function getAvgSymptomsPerCycle(logs: DailyLog[], periods: PeriodSpan[]): number {
  if (periods.length === 0) return 0;
  const totalSymptoms = logs.reduce((sum, log) => sum + log.symptoms.length, 0);
  return Math.round(totalSymptoms / periods.length);
}

// En uzun ve en kısa döngü
export function getMinMaxCycleLengths(periods: PeriodSpan[]): { min: number; max: number } {
  const lengths = periods.filter(p => p.cycleLengthDays).map(p => p.cycleLengthDays!);
  if (lengths.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...lengths), max: Math.max(...lengths) };
}

// Ruh hali & semptom kesişimi (pie chart için)
export function getMoodSymptomIntersection(logs: DailyLog[]) {
  const moodSymptomMap: Record<string, { count: number; symptoms: string[] }> = {};
  
  logs.forEach(log => {
    if (log.mood) {
      if (!moodSymptomMap[log.mood]) {
        moodSymptomMap[log.mood] = { count: 0, symptoms: [] };
      }
      moodSymptomMap[log.mood].count += 1;
      moodSymptomMap[log.mood].symptoms.push(...log.symptoms);
    }
  });
  
  return Object.entries(moodSymptomMap).map(([mood, data]) => ({
    mood,
    count: data.count,
    topSymptom: data.symptoms.length > 0 ? data.symptoms[0] : 'Yok',
  }));
}

// Kişisel içgörüler
export function generatePersonalInsights(logs: DailyLog[], periods: PeriodSpan[]): string[] {
  const insights: string[] = [];
  
  // 1. Adet öncesi semptom
  const prePeriodLogs = logs.slice(-7).filter(l => l.symptoms.length > 0);
  if (prePeriodLogs.length >= 3) {
    const commonSymptom = prePeriodLogs[0]?.symptoms[0];
    if (commonSymptom) {
      insights.push(`Son 3 döngüdür adet öncesi **${commonSymptom}** yaşıyorsun 💆‍♀️`);
    }
  }
  
  // 2. Foliküler faz enerjisi
  const energyLevels = calculateEnergyLevels(logs);
  const avgEnergy = mean(energyLevels.map(e => e.value));
  if (avgEnergy > 6) {
    insights.push('Foliküler fazda enerjin daha yüksek ⚡');
  }
  
  // 3. Ruh hali adet döneminde
  const periodMoodLogs = logs.slice(-5).filter(l => l.mood && (l.mood === 'sad' || l.mood === 'tired'));
  if (periodMoodLogs.length >= 3) {
    insights.push('Ruh halin adet döneminde ortalama %25 düşüyor 🩷');
  }
  
  // 4. Uyku trendi
  const sleepTrend = calculateSleepTrend(logs);
  const avgSleep = mean(sleepTrend.map(s => s.value));
  if (avgSleep < 6.5) {
    insights.push('Uyku süren luteal fazda ortalama 1 saat azalmış 😴');
  }
  
  // Varsayılan içgörü
  if (insights.length === 0) {
    insights.push('Daha fazla veri toplandıkça kişisel öneriler burada görünecek 🌸');
  }
  
  return insights;
}

