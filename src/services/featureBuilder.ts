/**
 * Feature Builder - ML Model için Feature Extraction
 * 
 * DailyLog ve cycle verilerinden 39 boyutlu feature vector üretir.
 * train_model.py ile uyumlu format.
 */

import { DailyLog, CyclePrefs, PeriodSpan, Mood, Symptom } from '../types';
import { getTodayISO, addDays, daysBetween } from '../utils/date';

// Semptom ve mood listeleri (train_model.py ile aynı sırada!)
const ALL_SYMPTOMS: Symptom[] = [
  'cramp', 'headache', 'backPain', 'jointPain',
  'bloating', 'nausea', 'constipation', 'diarrhea',
  'acne', 'breastTenderness', 'discharge',
  'lowEnergy', 'sleepy', 'insomnia',
  'appetite', 'cravings', 'anxious', 'irritable', 'focusIssues'
];

const ALL_MOODS: Mood[] = [
  'ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry'
];

export interface FeatureBuilderInput {
  log?: DailyLog | null;
  prefs: CyclePrefs;
  periods: PeriodSpan[];
  today?: string;
}

/**
 * 39 boyutlu feature vector oluştur (train_model.py formatı)
 * 
 * Features:
 * 1. dayInCycle (normalized): 1
 * 2. phase (one-hot): 4
 * 3. symptoms (multi-hot): 19
 * 4. avg severity: 1
 * 5. mood (one-hot): 9
 * 6. flow (one-hot): 3
 * 7. cycle stats: 2
 * 
 * Total: 1 + 4 + 19 + 1 + 9 + 3 + 2 = 39
 */
export const buildTipFeatures = ({
  log,
  prefs,
  periods,
  today = getTodayISO(),
}: FeatureBuilderInput): number[] => {
  const features: number[] = [];

  // Cycle bilgilerini bul
  const avgCycleLength = prefs?.avgCycleDays || 28;
  const avgPeriodLength = prefs?.avgPeriodDays || 5;
  const lastPeriodStart = prefs?.lastPeriodStart;

  // Bugün cycle'ın kaçıncı günü?
  let dayInCycle = 1;
  let currentPhase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' = 'follicular';
  
  if (lastPeriodStart) {
    const daysSinceLastPeriod = daysBetween(lastPeriodStart, today);
    dayInCycle = (daysSinceLastPeriod % avgCycleLength) + 1;
    
    // Faz hesapla
    if (dayInCycle <= avgPeriodLength) {
      currentPhase = 'menstrual';
    } else if (dayInCycle <= avgCycleLength / 2 - 1) {
      currentPhase = 'follicular';
    } else if (dayInCycle <= avgCycleLength / 2 + 1) {
      currentPhase = 'ovulation';
    } else {
      currentPhase = 'luteal';
    }
  }

  // 1. Day in cycle (normalized 0-1)
  features.push(dayInCycle / avgCycleLength);

  // 2. Phase (one-hot: menstrual, follicular, ovulation, luteal)
  for (const phase of ['menstrual', 'follicular', 'ovulation', 'luteal']) {
    features.push(currentPhase === phase ? 1.0 : 0.0);
  }

  // 3. Symptoms (multi-hot - 19 semptom)
  const logSymptoms = log?.symptoms || [];
  const symptomIds = logSymptoms.map(s => s.id);
  
  for (const symptom of ALL_SYMPTOMS) {
    features.push(symptomIds.includes(symptom) ? 1.0 : 0.0);
  }

  // 4. Average symptom severity (normalized 0-1)
  let avgSeverity = 0.0;
  if (logSymptoms.length > 0) {
    const totalSeverity = logSymptoms.reduce((sum, s) => sum + s.severity, 0);
    avgSeverity = (totalSeverity / logSymptoms.length) / 3.0; // Max severity = 3
  }
  features.push(avgSeverity);

  // 5. Mood (one-hot - 9 mood)
  const logMood = log?.mood;
  for (const mood of ALL_MOODS) {
    features.push(logMood === mood ? 1.0 : 0.0);
  }

  // 6. Flow (one-hot: light, medium, heavy)
  const logFlow = log?.flow;
  for (const flow of ['light', 'medium', 'heavy']) {
    features.push(logFlow === flow ? 1.0 : 0.0);
  }

  // 7. Cycle stats (normalized)
  features.push(avgCycleLength / 35.0);  // Max 35 days
  features.push(avgPeriodLength / 7.0);   // Max 7 days

  // Doğrulama: 39 feature olmalı
  if (features.length !== 39) {
    console.warn(`Feature count mismatch! Expected 39, got ${features.length}`);
  }

  return features;
};

/**
 * Legacy 5-feature format (geriye dönük uyumluluk)
 * Artık kullanılmıyor ama silinmedi
 */
export const buildTipFeaturesLegacy = ({
  log,
  prefs,
  periods,
  today = getTodayISO(),
}: FeatureBuilderInput): number[] => {
  const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const moodFeature = clamp(log?.mood ? getMoodScore(log.mood) / 10 : 0);

  const symptomSeveritySum = log?.symptoms?.reduce((sum, s) => sum + s.severity, 0) || 0;
  const symptomFeature = clamp(symptomSeveritySum / 12);

  const habitCount = Array.isArray(log?.habits) ? log.habits.length : 0;
  const habitFeature = clamp(habitCount / 6);

  const lastPeriodStart = prefs?.lastPeriodStart;
  let daysToNext = 0;
  if (lastPeriodStart && prefs?.avgCycleDays) {
    const nextStart = addDays(lastPeriodStart, prefs.avgCycleDays);
    daysToNext = clamp(daysBetween(today, nextStart) / Math.max(1, prefs.avgCycleDays));
  }

  const avgPeriodLength = Math.max(1, prefs?.avgPeriodDays ?? 5);
  const inPeriod = periods.some((period) => {
    const { start, end } = period;
    if (!start) return false;
    const effectiveEnd = end || addDays(start, Math.max(0, avgPeriodLength - 1));
    return today >= start && today <= effectiveEnd;
  });
  const isMenstrualFeature = inPeriod ? 1 : 0;

  return [
    moodFeature,
    symptomFeature,
    habitFeature,
    daysToNext,
    isMenstrualFeature,
  ];
};

// Helper function
function getMoodScore(mood: Mood): number {
  const scores: Record<Mood, number> = {
    ecstatic: 10,
    happy: 8,
    calm: 7,
    neutral: 5,
    anxious: 4,
    tired: 3,
    irritable: 3,
    sad: 2,
    angry: 1,
  };
  return scores[mood] || 5;
}
