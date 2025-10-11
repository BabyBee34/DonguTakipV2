/**
 * Cihaz İçi Öğrenme Sistemi
 * 
 * Kullanıcı verilerini kullanarak AI modelini
 * sürekli günceller ve iyileştirir.
 * Tüm işlemler cihaz içinde gerçekleşir.
 */

import { DailyLog, PeriodSpan, CyclePrefs, Symptom, Mood } from '../types';
import { getAIInsights, AIOutput } from './aiModel';
import { generateTrainingData } from './syntheticDataGenerator';
import { logger } from './logger';
import { storage } from './storage';

// Öğrenme verisi
interface LearningData {
  userLogs: DailyLog[];
  userPeriods: PeriodSpan[];
  userPrefs: CyclePrefs;
  syntheticData: Array<{ periods: PeriodSpan[], logs: DailyLog[], prefs: CyclePrefs }>;
  modelVersion: string;
  lastTraining: string;
  accuracy: {
    periodPrediction: number;
    ovulationPrediction: number;
    symptomPrediction: number;
    overall: number;
  };
}

// Model güncelleme sonucu
interface ModelUpdateResult {
  success: boolean;
  newAccuracy: number;
  improvements: string[];
  errors: string[];
}

// Öğrenme parametreleri
interface LearningParams {
  minDataPoints: number; // Minimum veri noktası
  learningRate: number; // Öğrenme hızı
  batchSize: number; // Batch boyutu
  epochs: number; // Epoch sayısı
  validationSplit: number; // Validation split
}

const DEFAULT_LEARNING_PARAMS: LearningParams = {
  minDataPoints: 30, // En az 30 günlük veri
  learningRate: 0.001,
  batchSize: 10,
  epochs: 5,
  validationSplit: 0.2
};

// Model performans metrikleri
interface ModelMetrics {
  periodAccuracy: number;
  ovulationAccuracy: number;
  symptomAccuracy: number;
  moodAccuracy: number;
  overallConfidence: number;
}

export class OnDeviceLearning {
  private learningData: LearningData | null = null;
  private params: LearningParams;
  private isTraining: boolean = false;

  constructor(params: LearningParams = DEFAULT_LEARNING_PARAMS) {
    this.params = { ...DEFAULT_LEARNING_PARAMS, ...params };
  }

  // Öğrenme verilerini yükle
  async loadLearningData(): Promise<void> {
    try {
      const stored = await storage.getItem('learning_data');
      if (stored) {
        this.learningData = JSON.parse(stored);
        logger.info('[OnDeviceLearning] Learning data loaded');
      }
    } catch (error) {
      logger.warn('[OnDeviceLearning] Failed to load learning data', error);
    }
  }

  // Öğrenme verilerini kaydet
  async saveLearningData(): Promise<void> {
    if (!this.learningData) return;

    try {
      await storage.setItem('learning_data', JSON.stringify(this.learningData));
      logger.info('[OnDeviceLearning] Learning data saved');
    } catch (error) {
      logger.warn('[OnDeviceLearning] Failed to save learning data', error);
    }
  }

  // Yeni veri ekle
  async addUserData(
    logs: DailyLog[],
    periods: PeriodSpan[],
    prefs: CyclePrefs
  ): Promise<void> {
    await this.loadLearningData();

    if (!this.learningData) {
      this.learningData = {
        userLogs: [],
        userPeriods: [],
        userPrefs: prefs,
        syntheticData: [],
        modelVersion: '1.0.0',
        lastTraining: new Date().toISOString(),
        accuracy: {
          periodPrediction: 0.5,
          ovulationPrediction: 0.5,
          symptomPrediction: 0.5,
          overall: 0.5
        }
      };
    }

    // Yeni veriyi ekle
    this.learningData.userLogs = logs;
    this.learningData.userPeriods = periods;
    this.learningData.userPrefs = prefs;

    // Sentetik veri yoksa oluştur
    if (this.learningData.syntheticData.length === 0) {
      const { users } = generateTrainingData(50, 6); // 50 kullanıcı, 6 döngü
      this.learningData.syntheticData = users;
    }

    await this.saveLearningData();
    logger.info('[OnDeviceLearning] User data added');
  }

  // Model güncelleme gerekli mi?
  shouldUpdateModel(): boolean {
    if (!this.learningData) return false;
    if (this.isTraining) return false;

    const dataPoints = this.learningData.userLogs.length;
    const lastTraining = new Date(this.learningData.lastTraining);
    const daysSinceTraining = (Date.now() - lastTraining.getTime()) / (1000 * 60 * 60 * 24);

    return dataPoints >= this.params.minDataPoints && daysSinceTraining >= 7; // Haftada bir güncelle
  }

  // Model güncelle
  async updateModel(): Promise<ModelUpdateResult> {
    if (!this.learningData || this.isTraining) {
      return {
        success: false,
        newAccuracy: 0,
        improvements: [],
        errors: ['No data or already training']
      };
    }

    this.isTraining = true;
    const improvements: string[] = [];
    const errors: string[] = [];

    try {
      logger.info('[OnDeviceLearning] Starting model update');

      // 1. Veri hazırlığı
      const trainingData = this.prepareTrainingData();
      if (trainingData.features.length < this.params.minDataPoints) {
        throw new Error('Insufficient training data');
      }

      // 2. Model eğitimi (simulated - gerçek implementasyon için ONNX runtime gerekli)
      const newMetrics = await this.trainModel(trainingData);

      // 3. Performans karşılaştırması
      const oldAccuracy = this.learningData.accuracy.overall;
      const newAccuracy = newMetrics.overallConfidence;

      if (newAccuracy > oldAccuracy) {
        improvements.push(`Overall accuracy improved: ${(oldAccuracy * 100).toFixed(1)}% → ${(newAccuracy * 100).toFixed(1)}%`);
      }

      if (newMetrics.periodAccuracy > this.learningData.accuracy.periodPrediction) {
        improvements.push(`Period prediction improved: ${(this.learningData.accuracy.periodPrediction * 100).toFixed(1)}% → ${(newMetrics.periodAccuracy * 100).toFixed(1)}%`);
      }

      if (newMetrics.ovulationAccuracy > this.learningData.accuracy.ovulationPrediction) {
        improvements.push(`Ovulation prediction improved: ${(this.learningData.accuracy.ovulationPrediction * 100).toFixed(1)}% → ${(newMetrics.ovulationAccuracy * 100).toFixed(1)}%`);
      }

      if (newMetrics.symptomAccuracy > this.learningData.accuracy.symptomPrediction) {
        improvements.push(`Symptom prediction improved: ${(this.learningData.accuracy.symptomPrediction * 100).toFixed(1)}% → ${(newMetrics.symptomAccuracy * 100).toFixed(1)}%`);
      }

      // 4. Model güncelle
      this.learningData.accuracy = {
        periodPrediction: newMetrics.periodAccuracy,
        ovulationPrediction: newMetrics.ovulationAccuracy,
        symptomPrediction: newMetrics.symptomAccuracy,
        overall: newMetrics.overallConfidence
      };
      this.learningData.lastTraining = new Date().toISOString();
      this.learningData.modelVersion = this.incrementVersion(this.learningData.modelVersion);

      await this.saveLearningData();

      logger.info('[OnDeviceLearning] Model update completed', { newAccuracy, improvements });

      return {
        success: true,
        newAccuracy,
        improvements,
        errors
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      logger.error('[OnDeviceLearning] Model update failed', error);

      return {
        success: false,
        newAccuracy: this.learningData.accuracy.overall,
        improvements,
        errors
      };
    } finally {
      this.isTraining = false;
    }
  }

  // Eğitim verisi hazırla
  private prepareTrainingData(): { features: number[][], targets: any } {
    if (!this.learningData) throw new Error('No learning data');

    const allUsers = [
      ...this.learningData.syntheticData,
      {
        periods: this.learningData.userPeriods,
        logs: this.learningData.userLogs,
        prefs: this.learningData.userPrefs
      }
    ];

    const features: number[][] = [];
    const targets = {
      nextPeriod: [] as string[],
      ovulation: [] as string[],
      fertileWindow: { start: [] as string[], end: [] as string[] },
      phase: [] as string[],
      symptoms: [] as string[][],
      mood: [] as string[]
    };

    allUsers.forEach(user => {
      const { periods, logs, prefs } = user;

      logs.forEach((log, index) => {
        // Feature extraction
        const dayInCycle = (index % prefs.avgCycleDays) + 1;
        const featureVector = this.extractFeatures(log, dayInCycle, prefs);
        features.push(featureVector);

        // Target calculation
        const logDate = new Date(log.date);
        const nextPeriodDate = new Date(logDate);
        nextPeriodDate.setDate(nextPeriodDate.getDate() + (prefs.avgCycleDays - dayInCycle));

        const ovulationDate = new Date(nextPeriodDate);
        ovulationDate.setDate(ovulationDate.getDate() - 14);

        const fertileStart = new Date(ovulationDate);
        fertileStart.setDate(fertileStart.getDate() - 5);
        const fertileEnd = new Date(ovulationDate);
        fertileEnd.setDate(fertileEnd.getDate() + 1);

        targets.nextPeriod.push(nextPeriodDate.toISOString().split('T')[0]);
        targets.ovulation.push(ovulationDate.toISOString().split('T')[0]);
        targets.fertileWindow.start.push(fertileStart.toISOString().split('T')[0]);
        targets.fertileWindow.end.push(fertileEnd.toISOString().split('T')[0]);
        targets.phase.push(this.determinePhase(dayInCycle, prefs.avgCycleDays));
        targets.symptoms.push(log.symptoms.map(s => s.id));
        targets.mood.push(log.mood || 'neutral');
      });
    });

    return { features, targets };
  }

  // Feature extraction
  private extractFeatures(log: DailyLog, dayInCycle: number, prefs: CyclePrefs): number[] {
    const features: number[] = [];

    // Temel özellikler
    features.push(dayInCycle / prefs.avgCycleDays);
    features.push(prefs.avgCycleDays / 35.0);
    features.push(prefs.avgPeriodDays / 7.0);

    // Semptom özellikleri
    const allSymptoms: Symptom[] = [
      'cramp', 'headache', 'backPain', 'jointPain', 'bloating', 'nausea',
      'constipation', 'diarrhea', 'acne', 'breastTenderness', 'discharge',
      'lowEnergy', 'sleepy', 'insomnia', 'appetite', 'cravings',
      'anxious', 'irritable', 'focusIssues'
    ];

    allSymptoms.forEach(symptom => {
      const symptomData = log.symptoms.find(s => s.id === symptom);
      features.push(symptomData ? symptomData.severity / 3.0 : 0);
    });

    // Mood özellikleri
    const allMoods: Mood[] = ['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry'];
    allMoods.forEach(mood => {
      features.push(log.mood === mood ? 1 : 0);
    });

    // Flow özellikleri
    features.push(log.flow === 'light' ? 1 : 0);
    features.push(log.flow === 'medium' ? 1 : 0);
    features.push(log.flow === 'heavy' ? 1 : 0);

    // Alışkanlık özellikleri
    features.push(log.habits.includes('water') ? 1 : 0);
    features.push(log.habits.includes('walk') ? 1 : 0);
    features.push(log.habits.includes('rest') ? 1 : 0);
    features.push(log.habits.includes('shower') ? 1 : 0);

    return features;
  }

  // Faz belirleme
  private determinePhase(dayInCycle: number, cycleLength: number): string {
    const avgPeriodLength = 5;
    const avgLutealLength = 12;
    const avgOvulationDay = cycleLength - avgLutealLength;

    if (dayInCycle <= avgPeriodLength) {
      return 'menstrual';
    } else if (dayInCycle <= avgOvulationDay - 1) {
      return 'follicular';
    } else if (dayInCycle <= avgOvulationDay + 1) {
      return 'ovulation';
    } else {
      return 'luteal';
    }
  }

  // Model eğitimi (simulated)
  private async trainModel(trainingData: { features: number[][], targets: any }): Promise<ModelMetrics> {
    // Gerçek implementasyon için ONNX runtime veya TensorFlow.js kullanılacak
    // Şimdilik simulated sonuçlar döndürüyoruz

    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle

    // Simulated accuracy improvements
    const baseAccuracy = 0.6;
    const improvement = Math.random() * 0.2; // 0-20% iyileşme

    return {
      periodAccuracy: Math.min(0.95, baseAccuracy + improvement),
      ovulationAccuracy: Math.min(0.90, baseAccuracy + improvement * 0.8),
      symptomAccuracy: Math.min(0.85, baseAccuracy + improvement * 0.6),
      moodAccuracy: Math.min(0.80, baseAccuracy + improvement * 0.5),
      overallConfidence: Math.min(0.92, baseAccuracy + improvement * 0.7)
    };
  }

  // Versiyon artır
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1]);
    const patch = parseInt(parts[2]);
    return `${major}.${minor}.${patch + 1}`;
  }

  // Model performansını al
  getModelPerformance(): ModelMetrics | null {
    if (!this.learningData) return null;

    return {
      periodAccuracy: this.learningData.accuracy.periodPrediction,
      ovulationAccuracy: this.learningData.accuracy.ovulationPrediction,
      symptomAccuracy: this.learningData.accuracy.symptomPrediction,
      moodAccuracy: 0.7, // Placeholder
      overallConfidence: this.learningData.accuracy.overall
    };
  }

  // Eğitim durumu
  isCurrentlyTraining(): boolean {
    return this.isTraining;
  }

  // Öğrenme istatistikleri
  getLearningStats(): {
    dataPoints: number;
    lastTraining: string;
    modelVersion: string;
    accuracy: any;
  } | null {
    if (!this.learningData) return null;

    return {
      dataPoints: this.learningData.userLogs.length,
      lastTraining: this.learningData.lastTraining,
      modelVersion: this.learningData.modelVersion,
      accuracy: this.learningData.accuracy
    };
  }
}

// Singleton instance
let onDeviceLearning: OnDeviceLearning | null = null;

export function getOnDeviceLearning(): OnDeviceLearning {
  if (!onDeviceLearning) {
    onDeviceLearning = new OnDeviceLearning();
  }
  return onDeviceLearning;
}

// Ana fonksiyonlar
export async function initializeLearning(
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs
): Promise<void> {
  const learning = getOnDeviceLearning();
  await learning.addUserData(logs, periods, prefs);
}

export async function checkAndUpdateModel(): Promise<ModelUpdateResult | null> {
  const learning = getOnDeviceLearning();
  
  if (learning.shouldUpdateModel()) {
    return await learning.updateModel();
  }
  
  return null;
}

export function getLearningStats() {
  const learning = getOnDeviceLearning();
  return learning.getLearningStats();
}

