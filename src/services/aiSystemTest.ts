/**
 * AI Sistem Test ve Optimizasyon
 * 
 * Tüm AI bileşenlerini test eder ve performansı ölçer.
 */

import { DailyLog, PeriodSpan, CyclePrefs, Symptom, Mood } from '../types';
import { getAIInsights, AIOutput } from './aiModel';
import { generateTrainingData } from './syntheticDataGenerator';
import { planAINotifications } from './aiNotificationService';
import { initializeLearning, checkAndUpdateModel, getLearningStats } from './onDeviceLearning';
import { logger } from './logger';

// Test sonuçları
interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  accuracy?: number;
  error?: string;
  details?: any;
}

interface SystemPerformance {
  overallScore: number;
  componentScores: {
    aiInsights: number;
    notifications: number;
    learning: number;
    syntheticData: number;
  };
  recommendations: string[];
}

export class AISystemTester {
  private testResults: TestResult[] = [];

  // Ana test fonksiyonu
  async runAllTests(): Promise<SystemPerformance> {
    console.log('🧠 AI Sistem Test Başlatılıyor...');
    this.testResults = [];

    try {
      // 1. Sentetik veri üretimi testi
      await this.testSyntheticDataGeneration();

      // 2. AI insights testi
      await this.testAIInsights();

      // 3. Bildirim sistemi testi
      await this.testNotificationSystem();

      // 4. Öğrenme sistemi testi
      await this.testLearningSystem();

      // 5. Entegrasyon testi
      await this.testIntegration();

      // Performans analizi
      return this.analyzePerformance();

    } catch (error) {
      console.error('Test sırasında hata:', error);
      return this.analyzePerformance();
    }
  }

  // Sentetik veri üretimi testi
  private async testSyntheticDataGeneration(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('📊 Sentetik veri üretimi test ediliyor...');
      
      const { users, trainingData } = generateTrainingData(10, 3); // Küçük test
      
      // Veri kalitesi kontrolü
      const isValidData = this.validateSyntheticData(users, trainingData);
      
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        testName: 'Synthetic Data Generation',
        success: isValidData,
        duration,
        details: {
          userCount: users.length,
          totalLogs: users.reduce((sum, user) => sum + user.logs.length, 0),
          featureCount: trainingData.features.length,
          featureDimension: trainingData.features[0]?.length || 0
        }
      });

      if (isValidData) {
        console.log('✅ Sentetik veri üretimi başarılı');
      } else {
        console.log('❌ Sentetik veri üretimi başarısız');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName: 'Synthetic Data Generation',
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ Sentetik veri üretimi hatası:', error);
    }
  }

  // AI insights testi
  private async testAIInsights(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 AI insights test ediliyor...');
      
      // Test verisi oluştur
      const testData = this.createTestData();
      
      const insights = await getAIInsights(
        testData.logs,
        testData.periods,
        testData.prefs,
        testData.today
      );
      
      const isValidInsights = this.validateAIInsights(insights);
      
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        testName: 'AI Insights',
        success: isValidInsights,
        duration,
        accuracy: insights?.confidence || 0,
        details: {
          hasPredictions: !!insights?.predictions,
          hasSymptoms: !!insights?.symptoms,
          hasRecommendations: !!insights?.recommendations,
          confidence: insights?.confidence
        }
      });

      if (isValidInsights) {
        console.log('✅ AI insights başarılı');
      } else {
        console.log('❌ AI insights başarısız');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName: 'AI Insights',
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ AI insights hatası:', error);
    }
  }

  // Bildirim sistemi testi
  private async testNotificationSystem(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🔔 Bildirim sistemi test ediliyor...');
      
      const testData = this.createTestData();
      
      const notifications = await planAINotifications(
        testData.logs,
        testData.periods,
        testData.prefs
      );
      
      const isValidNotifications = this.validateNotifications(notifications);
      
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        testName: 'Notification System',
        success: isValidNotifications,
        duration,
        details: {
          notificationCount: notifications.length,
          types: notifications.map(n => n.type),
          priorities: notifications.map(n => n.priority)
        }
      });

      if (isValidNotifications) {
        console.log('✅ Bildirim sistemi başarılı');
      } else {
        console.log('❌ Bildirim sistemi başarısız');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName: 'Notification System',
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ Bildirim sistemi hatası:', error);
    }
  }

  // Öğrenme sistemi testi
  private async testLearningSystem(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('📚 Öğrenme sistemi test ediliyor...');
      
      const testData = this.createTestData();
      
      // Öğrenme sistemini başlat
      await initializeLearning(testData.logs, testData.periods, testData.prefs);
      
      // Model güncelleme kontrolü
      const updateResult = await checkAndUpdateModel();
      
      // İstatistikleri al
      const stats = getLearningStats();
      
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        testName: 'Learning System',
        success: true,
        duration,
        details: {
          hasUpdateResult: !!updateResult,
          updateSuccess: updateResult?.success || false,
          dataPoints: stats?.dataPoints || 0,
          modelVersion: stats?.modelVersion || '1.0.0',
          accuracy: stats?.accuracy || {}
        }
      });

      console.log('✅ Öğrenme sistemi başarılı');

    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName: 'Learning System',
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ Öğrenme sistemi hatası:', error);
    }
  }

  // Entegrasyon testi
  private async testIntegration(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🔗 Entegrasyon test ediliyor...');
      
      const testData = this.createTestData();
      
      // Tüm sistemlerin birlikte çalışması
      const [insights, notifications] = await Promise.all([
        getAIInsights(testData.logs, testData.periods, testData.prefs, testData.today),
        planAINotifications(testData.logs, testData.periods, testData.prefs)
      ]);
      
      await initializeLearning(testData.logs, testData.periods, testData.prefs);
      
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        testName: 'Integration',
        success: !!(insights && notifications),
        duration,
        details: {
          insightsGenerated: !!insights,
          notificationsGenerated: notifications.length > 0,
          learningInitialized: true
        }
      });

      if (insights && notifications.length > 0) {
        console.log('✅ Entegrasyon başarılı');
      } else {
        console.log('❌ Entegrasyon başarısız');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName: 'Integration',
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ Entegrasyon hatası:', error);
    }
  }

  // Test verisi oluştur
  private createTestData(): {
    logs: DailyLog[];
    periods: PeriodSpan[];
    prefs: CyclePrefs;
    today: string;
  } {
    const today = new Date().toISOString().split('T')[0];
    
    // Basit test verisi
    const periods: PeriodSpan[] = [
      {
        id: 'test-period-1',
        start: '2024-09-01',
        end: '2024-09-05',
        periodLengthDays: 5
      },
      {
        id: 'test-period-2',
        start: '2024-10-01',
        end: '2024-10-05',
        periodLengthDays: 5
      }
    ];

    const logs: DailyLog[] = [];
    
    // Son 30 gün için log oluştur
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const symptoms: Array<{ id: Symptom; severity: number }> = [];
      if (Math.random() < 0.3) {
        symptoms.push({ id: 'cramp', severity: Math.floor(Math.random() * 3) + 1 });
      }
      
      const moods: Mood[] = ['happy', 'calm', 'neutral', 'tired', 'sad'];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      
      logs.push({
        id: `test-log-${i}`,
        date: dateStr,
        symptoms,
        mood,
        habits: ['water'],
        flow: null,
        note: ''
      });
    }

    const prefs: CyclePrefs = {
      avgCycleDays: 28,
      avgPeriodDays: 5,
      lastPeriodStart: '2024-10-01',
      notificationSettings: {
        upcomingPeriodDays: 2,
        dailyLogReminderHour: 20,
        waterReminderFrequency: 'balanced'
      }
    };

    return { logs, periods, prefs, today };
  }

  // Sentetik veri doğrulama
  private validateSyntheticData(users: any[], trainingData: any): boolean {
    if (!users || users.length === 0) return false;
    if (!trainingData.features || trainingData.features.length === 0) return false;
    
    // Her kullanıcının gerekli verileri var mı?
    const hasValidUsers = users.every(user => 
      user.logs && user.periods && user.prefs &&
      user.logs.length > 0 && user.periods.length > 0
    );
    
    // Feature boyutları tutarlı mı?
    const featureDimensions = trainingData.features.map((f: any) => f.length);
    const consistentDimensions = featureDimensions.every((dim: number) => dim === featureDimensions[0]);
    
    return hasValidUsers && consistentDimensions;
  }

  // AI insights doğrulama
  private validateAIInsights(insights: AIOutput | null): boolean {
    if (!insights) return false;
    
    // Temel alanlar var mı?
    const hasRequiredFields = !!(
      insights.predictions &&
      insights.symptoms &&
      insights.recommendations &&
      typeof insights.confidence === 'number' &&
      insights.confidence >= 0 && insights.confidence <= 1
    );
    
    // Predictions geçerli mi?
    const validPredictions = !!(
      insights.predictions.nextPeriod.date &&
      insights.predictions.ovulation.date &&
      insights.predictions.phase.name
    );
    
    return hasRequiredFields && validPredictions;
  }

  // Bildirimler doğrulama
  private validateNotifications(notifications: any[]): boolean {
    if (!Array.isArray(notifications)) return false;
    
    // Her bildirim geçerli mi?
    return notifications.every(notification => 
      notification.id &&
      notification.type &&
      notification.title &&
      notification.message &&
      notification.scheduledTime &&
      notification.priority
    );
  }

  // Performans analizi
  private analyzePerformance(): SystemPerformance {
    const successfulTests = this.testResults.filter(r => r.success);
    const totalTests = this.testResults.length;
    const overallScore = (successfulTests.length / totalTests) * 100;

    // Bileşen skorları
    const componentScores = {
      aiInsights: this.getComponentScore('AI Insights'),
      notifications: this.getComponentScore('Notification System'),
      learning: this.getComponentScore('Learning System'),
      syntheticData: this.getComponentScore('Synthetic Data Generation')
    };

    // Öneriler
    const recommendations = this.generateRecommendations();

    return {
      overallScore,
      componentScores,
      recommendations
    };
  }

  // Bileşen skoru
  private getComponentScore(componentName: string): number {
    const test = this.testResults.find(r => r.testName === componentName);
    return test ? (test.success ? 100 : 0) : 0;
  }

  // Öneriler oluştur
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const failedTests = this.testResults.filter(r => !r.success);
    
    if (failedTests.length > 0) {
      recommendations.push(`❌ ${failedTests.length} test başarısız. Hataları düzeltin.`);
    }
    
    const slowTests = this.testResults.filter(r => r.duration > 5000); // 5 saniyeden yavaş
    if (slowTests.length > 0) {
      recommendations.push(`⏱️ ${slowTests.length} test yavaş çalışıyor. Optimizasyon gerekli.`);
    }
    
    const aiInsightsTest = this.testResults.find(r => r.testName === 'AI Insights');
    if (aiInsightsTest && aiInsightsTest.accuracy && aiInsightsTest.accuracy < 0.7) {
      recommendations.push('📈 AI güven skoru düşük. Daha fazla eğitim verisi gerekli.');
    }
    
    if (this.testResults.every(r => r.success)) {
      recommendations.push('🎉 Tüm testler başarılı! Sistem hazır.');
    }

    return recommendations;
  }

  // Test sonuçlarını al
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  // Test raporu oluştur
  generateReport(): string {
    const performance = this.analyzePerformance();
    
    let report = '🧠 AI Sistem Test Raporu\n';
    report += '=' .repeat(50) + '\n\n';
    
    report += `📊 Genel Skor: ${performance.overallScore.toFixed(1)}%\n\n`;
    
    report += '🔧 Bileşen Skorları:\n';
    Object.entries(performance.componentScores).forEach(([component, score]) => {
      const status = score === 100 ? '✅' : '❌';
      report += `  ${status} ${component}: ${score}%\n`;
    });
    
    report += '\n📋 Test Detayları:\n';
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = (result.duration / 1000).toFixed(2);
      report += `  ${status} ${result.testName}: ${duration}s`;
      if (result.accuracy !== undefined) {
        report += ` (Güven: ${(result.accuracy * 100).toFixed(1)}%)`;
      }
      if (result.error) {
        report += ` - ${result.error}`;
      }
      report += '\n';
    });
    
    report += '\n💡 Öneriler:\n';
    performance.recommendations.forEach(rec => {
      report += `  ${rec}\n`;
    });
    
    return report;
  }
}

// Ana test fonksiyonu
export async function runAISystemTest(): Promise<SystemPerformance> {
  const tester = new AISystemTester();
  const performance = await tester.runAllTests();
  
  console.log('\n' + tester.generateReport());
  
  return performance;
}

// Hızlı test
export async function quickAITest(): Promise<boolean> {
  const tester = new AISystemTester();
  
  try {
    // Sadece temel testleri çalıştır
    await tester.testSyntheticDataGeneration();
    await tester.testAIInsights();
    
    const results = tester.getTestResults();
    return results.every(r => r.success);
  } catch (error) {
    console.error('Hızlı test hatası:', error);
    return false;
  }
}
