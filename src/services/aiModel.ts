import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { logger } from './logger';
import { DailyLog, PeriodSpan, CyclePrefs, Symptom, Mood } from '../types';

let ortSessionPromise: Promise<any> | null = null;

// Model paths - yeni multi-task model için
const TIP_MODEL_PATH = '../../assets/models/model.onnx';
const CYCLE_MODEL_PATH = '../../assets/models/cycle_model.onnx';
const CACHE_TIP_DEST = `${FileSystem.cacheDirectory || ''}model.onnx`;
const CACHE_CYCLE_DEST = `${FileSystem.cacheDirectory || ''}cycle_model.onnx`;
const MODEL_WEIGHT = 0.4;

// AI Output interfaces
export interface CyclePrediction {
  nextPeriod: { date: string; confidence: number };
  ovulation: { date: string; confidence: number };
  fertileWindow: { start: string; end: string; confidence: number };
  phase: { name: string; confidence: number; dayInCycle: number };
}

export interface SymptomPrediction {
  predictedSymptoms: Array<{id: Symptom; probability: number}>;
  moodPrediction: { mood: Mood; probability: number };
  energyLevel: number; // 0-1
}

export interface AIRecommendation {
  tips: Array<{id: string; score: number; reason: string}>;
  notifications: Array<{type: string; message: string; timing: string; priority: 'low'|'medium'|'high'}>;
}

export interface AIOutput {
  predictions: CyclePrediction;
  symptoms: SymptomPrediction;
  recommendations: AIRecommendation;
  confidence: number; // Genel güven skoru
  lastUpdated: string;
}

async function loadOrt(): Promise<typeof import('onnxruntime-react-native') | null> {
  try {
    const module = await import('onnxruntime-react-native');
    return module;
  } catch (error) {
    logger.warn('[AI Model] onnxruntime-react-native not available', error);
    return null;
  }
}

async function loadSession(): Promise<any | null> {
  if (ortSessionPromise) return ortSessionPromise;

  ortSessionPromise = (async () => {
    try {
      const ort = await loadOrt();
      if (!ort) return null;

      const asset = Asset.fromModule(require('../../assets/models/model.onnx'));
      await asset.downloadAsync();
      if (!asset.localUri) {
        logger.warn('[AI Model] Asset local uri unavailable');
        return null;
      }

      await FileSystem.copyAsync({ from: asset.localUri, to: CACHE_TIP_DEST });
      const session = await ort.InferenceSession.create(CACHE_TIP_DEST, { executionProviders: ['cpu'] });
      logger.info('[AI Model] Model loaded successfully');
      return { ort, session };
    } catch (error) {
      logger.warn('[AI Model] Session init failed', error);
      return null;
    }
  })();

  return ortSessionPromise;
}

// Legacy tip model function (geriye dönük uyumluluk)
export async function getTipModelScores(features: number[]): Promise<number[] | null> {
  try {
    const result = await loadSession();
    if (!result) return null;

    const { ort, session } = result;
    if (!Array.isArray(features) || features.length === 0) return null;

    const inputName = session.inputNames?.[0] || 'input';
    const outputName = session.outputNames?.[0] || 'output';
    const tensor = new ort.Tensor('float32', Float32Array.from(features), [1, features.length]);
    const feeds: Record<string, typeof tensor> = {};
    feeds[inputName] = tensor;

    const outputs = await session.run(feeds);
    const output = outputs[outputName];
    if (!output || !output.data) return null;

    const dataArray = Array.from(output.data as Float32Array);
    logger.debug('[AI Model] Tip inference successful', { outputSize: dataArray.length });
    return dataArray;
  } catch (error) {
    logger.warn('[AI Model] Tip inference failed', error);
    return null;
  }
}

// Yeni çoklu görev AI fonksiyonu
export async function getAIInsights(
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string = new Date().toISOString().split('T')[0]
): Promise<AIOutput | null> {
  try {
    // 1. Feature extraction
    const features = extractComprehensiveFeatures(logs, periods, prefs, today);
    
    // 2. Model inference (henüz cycle model yok, fallback kullan)
    const tipScores = await getTipModelScores(features.slice(0, 39)); // İlk 39 feature
    
    // 3. Fallback predictions (gerçek model gelene kadar)
    const predictions = generateFallbackPredictions(logs, periods, prefs, today);
    const symptoms = generateFallbackSymptomPredictions(logs, periods, prefs, today);
    const recommendations = generateFallbackRecommendations(logs, periods, prefs, today, tipScores);
    
    const confidence = calculateOverallConfidence(logs, periods);
    
    return {
      predictions,
      symptoms,
      recommendations,
      confidence,
      lastUpdated: today
    };
  } catch (error) {
    logger.warn('[AI Model] Comprehensive inference failed', error);
    return null;
  }
}

// Feature extraction - tüm verilerden kapsamlı feature vector
function extractComprehensiveFeatures(
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string
): number[] {
  const features: number[] = [];
  
  // 1. Temel cycle bilgileri (5 features)
  const avgCycle = prefs?.avgCycleDays || 28;
  const avgPeriod = prefs?.avgPeriodDays || 5;
  const lastPeriodStart = prefs?.lastPeriodStart;
  
  features.push(avgCycle / 35.0); // Normalize
  features.push(avgPeriod / 7.0);
  features.push(lastPeriodStart ? 1.0 : 0.0);
  
  // Cycle day hesapla
  let dayInCycle = 1;
  if (lastPeriodStart) {
    const daysSince = Math.floor((new Date(today).getTime() - new Date(lastPeriodStart).getTime()) / (1000 * 60 * 60 * 24));
    dayInCycle = (daysSince % avgCycle) + 1;
  }
  features.push(dayInCycle / avgCycle);
  features.push((dayInCycle <= avgPeriod) ? 1.0 : 0.0); // Menstrual phase
  
  // 2. Son 30 günlük semptom patterns (19 symptoms * 4 = 76 features)
  const recentLogs = logs.filter(log => {
    const logDate = new Date(log.date).getTime();
    const thirtyDaysAgo = new Date(today).getTime() - (30 * 24 * 60 * 60 * 1000);
    return logDate >= thirtyDaysAgo;
  });
  
  const symptoms: Symptom[] = [
    'cramp', 'headache', 'backPain', 'jointPain', 'bloating', 'nausea', 
    'constipation', 'diarrhea', 'acne', 'breastTenderness', 'discharge',
    'lowEnergy', 'sleepy', 'insomnia', 'appetite', 'cravings', 
    'anxious', 'irritable', 'focusIssues'
  ];
  
  // Her semptom için: frequency, avg severity, recent trend, phase correlation
  symptoms.forEach(symptom => {
    const symptomLogs = recentLogs.filter(log => 
      log.symptoms?.some(s => s.id === symptom)
    );
    
    features.push(symptomLogs.length / Math.max(recentLogs.length, 1)); // Frequency
    features.push(symptomLogs.length > 0 ? 
      symptomLogs.reduce((sum, log) => {
        const s = log.symptoms?.find(s => s.id === symptom);
        return sum + (s?.severity || 0);
      }, 0) / symptomLogs.length / 3.0 : 0.0); // Avg severity
    
    // Trend (son 7 gün vs önceki 7 gün)
    const last7Days = recentLogs.filter(log => {
      const logDate = new Date(log.date).getTime();
      const sevenDaysAgo = new Date(today).getTime() - (7 * 24 * 60 * 60 * 1000);
      return logDate >= sevenDaysAgo;
    });
    
    const prev7Days = recentLogs.filter(log => {
      const logDate = new Date(log.date).getTime();
      const sevenDaysAgo = new Date(today).getTime() - (7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(today).getTime() - (14 * 24 * 60 * 60 * 1000);
      return logDate >= fourteenDaysAgo && logDate < sevenDaysAgo;
    });
    
    const recentFreq = last7Days.filter(log => 
      log.symptoms?.some(s => s.id === symptom)
    ).length / Math.max(last7Days.length, 1);
    
    const prevFreq = prev7Days.filter(log => 
      log.symptoms?.some(s => s.id === symptom)
    ).length / Math.max(prev7Days.length, 1);
    
    features.push(recentFreq - prevFreq); // Trend
    
    // Phase correlation (luteal phase'de daha sık mı?)
    const lutealLogs = recentLogs.filter(log => {
      // Basit phase hesaplama
      if (!lastPeriodStart) return false;
      const logDay = Math.floor((new Date(log.date).getTime() - new Date(lastPeriodStart).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return logDay > avgPeriod && logDay <= avgCycle - 5; // Luteal approximation
    });
    
    const lutealFreq = lutealLogs.filter(log => 
      log.symptoms?.some(s => s.id === symptom)
    ).length / Math.max(lutealLogs.length, 1);
    
    features.push(lutealFreq);
  });
  
  // 3. Mood patterns (9 moods * 3 = 27 features)
  const moods: Mood[] = ['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry'];
  
  moods.forEach(mood => {
    const moodLogs = recentLogs.filter(log => log.mood === mood);
    features.push(moodLogs.length / Math.max(recentLogs.length, 1)); // Frequency
    
    // Mood stability
    const moodChanges = recentLogs.slice(1).filter((log, i) => 
      log.mood !== recentLogs[i].mood
    ).length;
    features.push(moodChanges / Math.max(recentLogs.length - 1, 1));
    
    // Phase correlation
    const follicularLogs = recentLogs.filter(log => {
      if (!lastPeriodStart) return false;
      const logDay = Math.floor((new Date(log.date).getTime() - new Date(lastPeriodStart).getTime()) / (1000 * 60 * 60 * 1000)) + 1;
      return logDay > avgPeriod && logDay <= avgCycle / 2;
    });
    
    const follicularMoodFreq = follicularLogs.filter(log => log.mood === mood).length / Math.max(follicularLogs.length, 1);
    features.push(follicularMoodFreq);
  });
  
  // 4. Cycle regularity metrics (5 features)
  if (periods.length >= 3) {
    const cycleLengths = periods.slice(-6).map((period, i, arr) => {
      if (i === 0) return avgCycle; // İlk döngü için ortalama kullan
      const prevPeriod = arr[i - 1];
      if (!prevPeriod.start || !period.start) return avgCycle;
      return Math.floor((new Date(period.start).getTime() - new Date(prevPeriod.start).getTime()) / (1000 * 60 * 60 * 24));
    });
    
    const avgActualCycle = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
    const cycleVariance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgActualCycle, 2), 0) / cycleLengths.length;
    
    features.push(avgActualCycle / 35.0);
    features.push(Math.sqrt(cycleVariance) / 7.0); // Standard deviation
    features.push(Math.abs(avgActualCycle - avgCycle) / avgCycle); // Deviation from expected
    features.push(cycleLengths.filter(len => Math.abs(len - avgActualCycle) <= 3).length / cycleLengths.length); // Consistency
    features.push(periods.length >= 6 ? 1.0 : periods.length / 6.0); // Data sufficiency
  } else {
    features.push(0, 0, 0, 0, 0); // Yetersiz veri
  }
  
  return features;
}

// Fallback predictions (gerçek model gelene kadar)
function generateFallbackPredictions(
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string
): CyclePrediction {
  const avgCycle = prefs?.avgCycleDays || 28;
  const avgPeriod = prefs?.avgPeriodDays || 5;
  const lastPeriodStart = prefs?.lastPeriodStart;
  
  if (!lastPeriodStart) {
    return {
      nextPeriod: { date: '', confidence: 0 },
      ovulation: { date: '', confidence: 0 },
      fertileWindow: { start: '', end: '', confidence: 0 },
      phase: { name: 'unknown', confidence: 0, dayInCycle: 0 }
    };
  }
  
  // Basit hesaplamalar
  const nextPeriodDate = new Date(lastPeriodStart);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycle);
  
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() - 14);
  
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 5);
  
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  
  // Phase calculation
  const daysSinceStart = Math.floor((new Date(today).getTime() - new Date(lastPeriodStart).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dayInCycle = (daysSinceStart % avgCycle) + 1;
  
  let phaseName = 'follicular';
  if (dayInCycle <= avgPeriod) phaseName = 'menstrual';
  else if (dayInCycle >= avgCycle - 14 && dayInCycle <= avgCycle - 12) phaseName = 'ovulation';
  else if (dayInCycle > avgCycle - 12) phaseName = 'luteal';
  
  // Confidence calculation (basit)
  const confidence = Math.min(0.95, 0.5 + (periods.length * 0.1) + (logs.length * 0.01));
  
  return {
    nextPeriod: { 
      date: nextPeriodDate.toISOString().split('T')[0], 
      confidence: Math.min(0.9, confidence + 0.1) 
    },
    ovulation: { 
      date: ovulationDate.toISOString().split('T')[0], 
      confidence: Math.min(0.8, confidence) 
    },
    fertileWindow: { 
      start: fertileStart.toISOString().split('T')[0], 
      end: fertileEnd.toISOString().split('T')[0], 
      confidence: Math.min(0.85, confidence + 0.05) 
    },
    phase: { 
      name: phaseName, 
      confidence: Math.min(0.9, confidence + 0.15), 
      dayInCycle 
    }
  };
}

function generateFallbackSymptomPredictions(
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string
): SymptomPrediction {
  // Son 30 günlük pattern analizi
  const recentLogs = logs.filter(log => {
    const logDate = new Date(log.date).getTime();
    const thirtyDaysAgo = new Date(today).getTime() - (30 * 24 * 60 * 60 * 1000);
    return logDate >= thirtyDaysAgo;
  });
  
  const symptoms: Symptom[] = [
    'cramp', 'headache', 'backPain', 'jointPain', 'bloating', 'nausea', 
    'constipation', 'diarrhea', 'acne', 'breastTenderness', 'discharge',
    'lowEnergy', 'sleepy', 'insomnia', 'appetite', 'cravings', 
    'anxious', 'irritable', 'focusIssues'
  ];
  
  const predictedSymptoms = symptoms.map(symptom => {
    const frequency = recentLogs.filter(log => 
      log.symptoms?.some(s => s.id === symptom)
    ).length / Math.max(recentLogs.length, 1);
    
    return {
      id: symptom,
      probability: Math.min(0.8, frequency * 2) // Amplify but cap
    };
  }).filter(s => s.probability > 0.1); // Sadece yüksek olasılıklıları
  
  // Mood prediction
  const moodCounts: Record<Mood, number> = {
    ecstatic: 0, happy: 0, calm: 0, neutral: 0, tired: 0,
    sad: 0, anxious: 0, irritable: 0, angry: 0
  };
  
  recentLogs.forEach(log => {
    if (log.mood) moodCounts[log.mood]++;
  });
  
  const totalMoods = recentLogs.filter(log => log.mood).length;
  const predictedMood = Object.entries(moodCounts).reduce((a, b) => 
    moodCounts[a[0] as Mood] > moodCounts[b[0] as Mood] ? a : b
  );
  
  // Energy level (basit hesaplama)
  const lowEnergyDays = recentLogs.filter(log => 
    log.symptoms?.some(s => s.id === 'lowEnergy') || 
    log.mood === 'tired'
  ).length;
  
  const energyLevel = Math.max(0, 1 - (lowEnergyDays / Math.max(recentLogs.length, 1)) * 2);
  
  return {
    predictedSymptoms,
    moodPrediction: {
      mood: predictedMood[0] as Mood,
      probability: totalMoods > 0 ? moodCounts[predictedMood[0] as Mood] / totalMoods : 0.5
    },
    energyLevel
  };
}

function generateFallbackRecommendations(
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string,
  tipScores: number[] | null
): AIRecommendation {
  // Basit öneri sistemi
  const tips = [
    { id: 'water', score: 0.8, reason: 'Hidrasyon önemli' },
    { id: 'rest', score: 0.7, reason: 'Dinlenme zamanı' },
    { id: 'exercise', score: 0.6, reason: 'Hafif egzersiz' }
  ];
  
  const notifications = [
    { 
      type: 'period_reminder', 
      message: 'Adet döneminiz yaklaşıyor', 
      timing: '2 days before',
      priority: 'medium' as const
    },
    { 
      type: 'water_reminder', 
      message: 'Su içmeyi unutmayın', 
      timing: 'daily',
      priority: 'low' as const
    }
  ];
  
  return { tips, notifications };
}

function calculateOverallConfidence(logs: DailyLog[], periods: PeriodSpan[]): number {
  const dataPoints = logs.length + periods.length;
  const confidence = Math.min(0.95, 0.3 + (dataPoints * 0.02));
  return Math.max(0.1, confidence);
}

export { MODEL_WEIGHT };
