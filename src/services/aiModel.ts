import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { logger } from './logger';
import { DailyLog, PeriodSpan, CyclePrefs, Symptom, Mood } from '../types';

let ortSessionPromise: Promise<any> | null = null;

// Model paths - yeni multi-task model için
const PERIOD_MODEL_PATH = '../../assets/models/period_prediction.onnx';
const OVULATION_MODEL_PATH = '../../assets/models/ovulation_prediction.onnx';
const PHASE_MODEL_PATH = '../../assets/models/phase_classification.onnx';
const MOOD_MODEL_PATH = '../../assets/models/mood_classification.onnx';
const SCALER_MODEL_PATH = '../../assets/models/scaler.onnx';

const CACHE_PERIOD_DEST = `${FileSystem.cacheDirectory || ''}period_prediction.onnx`;
const CACHE_OVULATION_DEST = `${FileSystem.cacheDirectory || ''}ovulation_prediction.onnx`;
const CACHE_PHASE_DEST = `${FileSystem.cacheDirectory || ''}phase_classification.onnx`;
const CACHE_MOOD_DEST = `${FileSystem.cacheDirectory || ''}mood_classification.onnx`;
const CACHE_SCALER_DEST = `${FileSystem.cacheDirectory || ''}scaler.onnx`;
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

// Yeni AI modellerini yükle
async function loadAISessions(): Promise<any | null> {
  if (ortSessionPromise) return ortSessionPromise;

  ortSessionPromise = (async () => {
    try {
      const ort = await loadOrt();
      if (!ort) return null;

      // Tüm modelleri yükle
      const sessions: any = {};
      
      // Period prediction model
      try {
        const periodAsset = Asset.fromModule(require(PERIOD_MODEL_PATH));
        await periodAsset.downloadAsync();
        if (periodAsset.localUri) {
          await FileSystem.copyAsync({ from: periodAsset.localUri, to: CACHE_PERIOD_DEST });
          sessions.period = await ort.InferenceSession.create(CACHE_PERIOD_DEST, { executionProviders: ['cpu'] });
        }
      } catch (error) {
        logger.warn('[AI Model] Period model load failed', error);
      }

      // Ovulation prediction model
      try {
        const ovulationAsset = Asset.fromModule(require(OVULATION_MODEL_PATH));
        await ovulationAsset.downloadAsync();
        if (ovulationAsset.localUri) {
          await FileSystem.copyAsync({ from: ovulationAsset.localUri, to: CACHE_OVULATION_DEST });
          sessions.ovulation = await ort.InferenceSession.create(CACHE_OVULATION_DEST, { executionProviders: ['cpu'] });
        }
      } catch (error) {
        logger.warn('[AI Model] Ovulation model load failed', error);
      }

      // Phase classification model
      try {
        const phaseAsset = Asset.fromModule(require(PHASE_MODEL_PATH));
        await phaseAsset.downloadAsync();
        if (phaseAsset.localUri) {
          await FileSystem.copyAsync({ from: phaseAsset.localUri, to: CACHE_PHASE_DEST });
          sessions.phase = await ort.InferenceSession.create(CACHE_PHASE_DEST, { executionProviders: ['cpu'] });
        }
      } catch (error) {
        logger.warn('[AI Model] Phase model load failed', error);
      }

      // Mood classification model
      try {
        const moodAsset = Asset.fromModule(require(MOOD_MODEL_PATH));
        await moodAsset.downloadAsync();
        if (moodAsset.localUri) {
          await FileSystem.copyAsync({ from: moodAsset.localUri, to: CACHE_MOOD_DEST });
          sessions.mood = await ort.InferenceSession.create(CACHE_MOOD_DEST, { executionProviders: ['cpu'] });
        }
      } catch (error) {
        logger.warn('[AI Model] Mood model load failed', error);
      }

      // Scaler model
      try {
        const scalerAsset = Asset.fromModule(require(SCALER_MODEL_PATH));
        await scalerAsset.downloadAsync();
        if (scalerAsset.localUri) {
          await FileSystem.copyAsync({ from: scalerAsset.localUri, to: CACHE_SCALER_DEST });
          sessions.scaler = await ort.InferenceSession.create(CACHE_SCALER_DEST, { executionProviders: ['cpu'] });
        }
      } catch (error) {
        logger.warn('[AI Model] Scaler model load failed', error);
      }

      logger.info('[AI Model] AI models loaded successfully', { loadedModels: Object.keys(sessions) });
      return { ort, sessions };
    } catch (error) {
      logger.warn('[AI Model] AI sessions init failed', error);
      return null;
    }
  })();

  return ortSessionPromise;
}

// Legacy tip model function (geriye dönük uyumluluk)
export async function getTipModelScores(features: number[]): Promise<number[] | null> {
  try {
    // Fallback olarak mood model kullan
    const result = await loadAISessions();
    if (!result || !result.sessions.mood) return null;

    const { ort, sessions } = result;
    if (!Array.isArray(features) || features.length === 0) return null;

    const session = sessions.mood;
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
    
    // 2. AI model inference
    const result = await loadAISessions();
    if (!result || !result.sessions) {
      logger.warn('[AI Model] AI sessions not available, using fallback');
      return generateFallbackAIOutput(logs, periods, prefs, today);
    }

    const { ort, sessions } = result;
    
    // 3. Model inference
    const predictions = await runCyclePredictions(features, sessions, ort, logs, periods, prefs, today);
    const symptoms = await runSymptomPredictions(features, sessions, ort, logs, periods, prefs, today);
    const recommendations = await generateAIRecommendations(features, sessions, ort, logs, periods, prefs, today);
    
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
    return generateFallbackAIOutput(logs, periods, prefs, today);
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

// Yeni AI inference fonksiyonları
async function runCyclePredictions(
  features: number[],
  sessions: any,
  ort: any,
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string
): Promise<CyclePrediction> {
  try {
    // Period prediction
    let nextPeriod = generateFallbackPredictions(logs, periods, prefs, today).nextPeriod;
    if (sessions.period) {
      const periodResult = await runModelInference(features, sessions.period, ort);
      if (periodResult) {
        const daysToPeriod = Math.round(periodResult[0]);
        const periodDate = new Date(today);
        periodDate.setDate(periodDate.getDate() + daysToPeriod);
        nextPeriod = {
          date: periodDate.toISOString().split('T')[0],
          confidence: Math.min(0.9, Math.max(0.3, 1 - Math.abs(daysToPeriod) / 30))
        };
      }
    }

    // Ovulation prediction
    let ovulation = generateFallbackPredictions(logs, periods, prefs, today).ovulation;
    if (sessions.ovulation) {
      const ovulationResult = await runModelInference(features, sessions.ovulation, ort);
      if (ovulationResult) {
        const daysToOvulation = Math.round(ovulationResult[0]);
        const ovulationDate = new Date(today);
        ovulationDate.setDate(ovulationDate.getDate() + daysToOvulation);
        ovulation = {
          date: ovulationDate.toISOString().split('T')[0],
          confidence: Math.min(0.9, Math.max(0.3, 1 - Math.abs(daysToOvulation) / 15))
        };
      }
    }

    // Phase classification
    let phase = generateFallbackPredictions(logs, periods, prefs, today).phase;
    if (sessions.phase) {
      const phaseResult = await runModelInference(features, sessions.phase, ort);
      if (phaseResult) {
        const phaseIndex = Math.round(phaseResult[0]);
        const phases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
        const phaseName = phases[phaseIndex] || 'follicular';
        phase = {
          name: phaseName,
          confidence: 0.8,
          dayInCycle: phaseIndex * 7 + 1
        };
      }
    }

    // Fertile window (ovulation ± 5 gün)
    const ovulationDate = new Date(ovulation.date);
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 5);

    return {
      nextPeriod,
      ovulation,
      fertileWindow: {
        start: fertileStart.toISOString().split('T')[0],
        end: fertileEnd.toISOString().split('T')[0],
        confidence: ovulation.confidence * 0.8
      },
      phase
    };
  } catch (error) {
    logger.warn('[AI Model] Cycle prediction failed', error);
    return generateFallbackPredictions(logs, periods, prefs, today);
  }
}

async function runSymptomPredictions(
  features: number[],
  sessions: any,
  ort: any,
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string
): Promise<SymptomPrediction> {
  try {
    // Mood prediction
    let moodPrediction = generateFallbackSymptomPredictions(logs, periods, prefs, today).moodPrediction;
    if (sessions.mood) {
      const moodResult = await runModelInference(features, sessions.mood, ort);
      if (moodResult) {
        const moodIndex = Math.round(moodResult[0]);
        const moods: Mood[] = ['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry'];
        const predictedMood = moods[moodIndex] || 'neutral';
        moodPrediction = {
          mood: predictedMood,
          probability: 0.7
        };
      }
    }

    // Symptom prediction (basit fallback)
    const predictedSymptoms = generateFallbackSymptomPredictions(logs, periods, prefs, today).predictedSymptoms;
    
    // Energy level (basit hesaplama)
    const energyLevel = generateFallbackSymptomPredictions(logs, periods, prefs, today).energyLevel;

    return {
      predictedSymptoms,
      moodPrediction,
      energyLevel
    };
  } catch (error) {
    logger.warn('[AI Model] Symptom prediction failed', error);
    return generateFallbackSymptomPredictions(logs, periods, prefs, today);
  }
}

async function generateAIRecommendations(
  features: number[],
  sessions: any,
  ort: any,
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string
): Promise<AIRecommendation> {
  try {
    // AI-based tip scoring
    const tipScores = await getTipModelScores(features.slice(0, 39));
    
    return generateFallbackRecommendations(logs, periods, prefs, today, tipScores);
  } catch (error) {
    logger.warn('[AI Model] Recommendation generation failed', error);
    return generateFallbackRecommendations(logs, periods, prefs, today, null);
  }
}

async function runModelInference(features: number[], session: any, ort: any): Promise<number[] | null> {
  try {
    if (!session || !ort) return null;

    const inputName = session.inputNames?.[0] || 'input';
    const outputName = session.outputNames?.[0] || 'output';
    const tensor = new ort.Tensor('float32', Float32Array.from(features), [1, features.length]);
    const feeds: Record<string, typeof tensor> = {};
    feeds[inputName] = tensor;

    const outputs = await session.run(feeds);
    const output = outputs[outputName];
    if (!output || !output.data) return null;

    return Array.from(output.data as Float32Array);
  } catch (error) {
    logger.warn('[AI Model] Model inference failed', error);
    return null;
  }
}

function generateFallbackAIOutput(
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  today: string
): AIOutput {
  const predictions = generateFallbackPredictions(logs, periods, prefs, today);
  const symptoms = generateFallbackSymptomPredictions(logs, periods, prefs, today);
  const recommendations = generateFallbackRecommendations(logs, periods, prefs, today, null);
  const confidence = calculateOverallConfidence(logs, periods);

  return {
    predictions,
    symptoms,
    recommendations,
    confidence,
    lastUpdated: today
  };
}

export { MODEL_WEIGHT };
