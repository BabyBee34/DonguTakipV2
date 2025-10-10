/**
 * AI Destekli Bildirim Servisi
 * 
 * Kişiselleştirilmiş bildirimler gönderir:
 * - Adet dönemi yaklaşıyor
 * - Ovulasyon dönemi
 * - Semptom tahminleri
 * - Kişisel öneriler
 */

import { DailyLog, PeriodSpan, CyclePrefs, Symptom, Mood } from '../types';
import { getAIInsights, AIOutput } from './aiModel';
import { addDays, daysBetween } from '../utils/date';

export interface AINotification {
  id: string;
  type: 'period_reminder' | 'ovulation_reminder' | 'symptom_prediction' | 'personal_tip' | 'mood_reminder';
  title: string;
  message: string;
  scheduledTime: Date;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

export interface NotificationSettings {
  enabled: boolean;
  periodReminders: boolean;
  ovulationReminders: boolean;
  symptomPredictions: boolean;
  personalTips: boolean;
  moodReminders: boolean;
  quietHours: { start: number; end: number }; // 24 saat formatında
  maxDailyNotifications: number;
}

// Varsayılan ayarlar
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  periodReminders: true,
  ovulationReminders: true,
  symptomPredictions: false,
  personalTips: true,
  moodReminders: true,
  quietHours: { start: 22, end: 8 },
  maxDailyNotifications: 3
};

// Bildirim mesajları (@adet.md'den)
const NOTIFICATION_MESSAGES = {
  period_reminder: {
    title: "🌸 Adet Döneminiz Yaklaşıyor",
    messages: [
      "Adet döneminiz yaklaşıyor. Rahat kıyafetler ve sıcak içecekler hazırlamaya başlayabilirsiniz.",
      "Bir sonraki adet döneminiz yaklaşıyor. Vücudunuzu dinlemeye ve kendinize nazik davranmaya hazır olun.",
      "Adet döneminiz başlamak üzere. Gerekli ürünleri hazırlamayı unutmayın.",
      "Yaklaşan adet döneminiz için kendinizi hazırlayın. Dinlenme ve rahatlama zamanı geliyor."
    ]
  },
  ovulation_reminder: {
    title: "💜 Ovulasyon Dönemi",
    messages: [
      "Ovulasyon döneminizde olduğunuz tahmin ediliyor. Bu dönemde enerjiniz yüksek olabilir.",
      "Doğurganlık döneminizde olduğunuz düşünülüyor. Vücudunuzun sinyallerini dinleyin.",
      "Ovulasyon zamanınız yaklaşıyor. Bu dönemde kendinizi daha enerjik hissedebilirsiniz."
    ]
  },
  symptom_prediction: {
    title: "🔮 Semptom Tahmini",
    messages: [
      "Bugün kramp yaşayabilirsiniz. Sıcak kompres ve hafif egzersiz iyi gelebilir.",
      "Baş ağrısı riskiniz var. Bol su içmeyi ve dinlenmeyi unutmayın.",
      "Düşük enerji seviyesi bekleniyor. Hafif aktiviteler ve iyi beslenme önemli.",
      "Şişkinlik yaşayabilirsiniz. Tuz alımını azaltmayı ve bol su içmeyi deneyin."
    ]
  },
  personal_tip: {
    title: "💡 Kişisel Öneri",
    messages: [
      "Bugünkü döngü fazınıza göre, yaratıcı aktiviteler için ideal bir gün.",
      "Enerji seviyeniz yüksek görünüyor. Yeni projeler başlatmak için mükemmel zaman.",
      "Dinlenme ihtiyacınız var. Sıcak bir banyo ve rahatlatıcı müzik öneriyoruz.",
      "Sosyalleşme için iyi bir gün. Arkadaşlarınızla zaman geçirin."
    ]
  },
  mood_reminder: {
    title: "💭 Ruh Hali Hatırlatması",
    messages: [
      "Bugün ruh halinizi kontrol etmeyi unutmayın. Günlük kayıt tutmak önemli.",
      "Nasıl hissettiğinizi not etmek ister misiniz? Bu bilgi AI'nızın öğrenmesine yardımcı olur.",
      "Ruh halinizi kaydetmek için bir dakika ayırın. Bu, daha iyi öngörüler için önemli."
    ]
  }
};

// Bildirim planlayıcı
export class AINotificationPlanner {
  private settings: NotificationSettings;
  private scheduledNotifications: AINotification[] = [];

  constructor(settings: NotificationSettings = DEFAULT_SETTINGS) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
  }

  // Ana planlama fonksiyonu
  async planNotifications(
    logs: DailyLog[],
    periods: PeriodSpan[],
    prefs: CyclePrefs,
    today: string = new Date().toISOString().split('T')[0]
  ): Promise<AINotification[]> {
    if (!this.settings.enabled) return [];

    const notifications: AINotification[] = [];
    
    try {
      // AI insights al
      const aiInsights = await getAIInsights(logs, periods, prefs, today);
      
      if (!aiInsights) {
        // AI çalışmıyorsa basit bildirimler
        return this.generateSimpleNotifications(logs, periods, prefs, today);
      }

      // AI destekli bildirimler
      notifications.push(...this.generateAIPeriodReminders(aiInsights, today));
      notifications.push(...this.generateAIOvulationReminders(aiInsights, today));
      notifications.push(...this.generateAISymptomPredictions(aiInsights, today));
      notifications.push(...this.generateAIPersonalTips(aiInsights, today));
      notifications.push(...this.generateAIMoodReminders(logs, today));

      // Bildirimleri filtrele ve sınırla
      return this.filterAndLimitNotifications(notifications);
      
    } catch (error) {
      console.warn('AI bildirim planlama hatası:', error);
      return this.generateSimpleNotifications(logs, periods, prefs, today);
    }
  }

  // AI destekli adet hatırlatıcıları
  private generateAIPeriodReminders(aiInsights: AIOutput, today: string): AINotification[] {
    if (!this.settings.periodReminders) return [];

    const notifications: AINotification[] = [];
    const nextPeriodDate = aiInsights.predictions.nextPeriod.date;
    const confidence = aiInsights.predictions.nextPeriod.confidence;

    if (!nextPeriodDate || confidence < 0.6) return notifications;

    const daysUntilPeriod = daysBetween(today, nextPeriodDate);

    // 3 gün önce
    if (daysUntilPeriod === 3) {
      notifications.push({
        id: `period-reminder-3d-${today}`,
        type: 'period_reminder',
        title: NOTIFICATION_MESSAGES.period_reminder.title,
        message: this.selectRandomMessage(NOTIFICATION_MESSAGES.period_reminder.messages),
        scheduledTime: this.getOptimalTime(18), // 18:00
        priority: 'medium',
        data: { daysUntil: 3, confidence }
      });
    }

    // 1 gün önce
    if (daysUntilPeriod === 1) {
      notifications.push({
        id: `period-reminder-1d-${today}`,
        type: 'period_reminder',
        title: NOTIFICATION_MESSAGES.period_reminder.title,
        message: this.selectRandomMessage(NOTIFICATION_MESSAGES.period_reminder.messages),
        scheduledTime: this.getOptimalTime(20), // 20:00
        priority: 'high',
        data: { daysUntil: 1, confidence }
      });
    }

    return notifications;
  }

  // AI destekli ovulasyon hatırlatıcıları
  private generateAIOvulationReminders(aiInsights: AIOutput, today: string): AINotification[] {
    if (!this.settings.ovulationReminders) return [];

    const notifications: AINotification[] = [];
    const ovulationDate = aiInsights.predictions.ovulation.date;
    const confidence = aiInsights.predictions.ovulation.confidence;

    if (!ovulationDate || confidence < 0.5) return notifications;

    const daysUntilOvulation = daysBetween(today, ovulationDate);

    // Ovulasyon günü
    if (daysUntilOvulation === 0) {
      notifications.push({
        id: `ovulation-reminder-${today}`,
        type: 'ovulation_reminder',
        title: NOTIFICATION_MESSAGES.ovulation_reminder.title,
        message: this.selectRandomMessage(NOTIFICATION_MESSAGES.ovulation_reminder.messages),
        scheduledTime: this.getOptimalTime(10), // 10:00
        priority: 'medium',
        data: { confidence }
      });
    }

    return notifications;
  }

  // AI destekli semptom tahminleri
  private generateAISymptomPredictions(aiInsights: AIOutput, today: string): AINotification[] {
    if (!this.settings.symptomPredictions) return [];

    const notifications: AINotification[] = [];
    const predictedSymptoms = aiInsights.symptoms.predictedSymptoms;

    // Yüksek olasılıklı semptomlar için bildirim
    predictedSymptoms
      .filter(s => s.probability > 0.7)
      .slice(0, 2) // Maksimum 2 semptom
      .forEach((symptom, index) => {
        notifications.push({
          id: `symptom-prediction-${symptom.id}-${today}`,
          type: 'symptom_prediction',
          title: NOTIFICATION_MESSAGES.symptom_prediction.title,
          message: this.getSymptomMessage(symptom.id),
          scheduledTime: this.getOptimalTime(9 + index * 2), // 09:00 ve 11:00
          priority: 'low',
          data: { symptom: symptom.id, probability: symptom.probability }
        });
      });

    return notifications;
  }

  // AI destekli kişisel öneriler
  private generateAIPersonalTips(aiInsights: AIOutput, today: string): AINotification[] {
    if (!this.settings.personalTips) return [];

    const notifications: AINotification[] = [];
    const tips = aiInsights.recommendations.tips;

    if (tips.length > 0) {
      const topTip = tips[0];
      notifications.push({
        id: `personal-tip-${today}`,
        type: 'personal_tip',
        title: NOTIFICATION_MESSAGES.personal_tip.title,
        message: topTip.reason,
        scheduledTime: this.getOptimalTime(14), // 14:00
        priority: 'low',
        data: { tipId: topTip.id, score: topTip.score }
      });
    }

    return notifications;
  }

  // AI destekli ruh hali hatırlatmaları
  private generateAIMoodReminders(logs: DailyLog[], today: string): AINotification[] {
    if (!this.settings.moodReminders) return [];

    const notifications: AINotification[] = [];
    
    // Son 3 gün mood kaydı yoksa hatırlat
    const recentLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      const todayDate = new Date(today);
      const diffDays = (todayDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 3;
    });

    const hasRecentMoodLogs = recentLogs.some(log => log.mood);

    if (!hasRecentMoodLogs) {
      notifications.push({
        id: `mood-reminder-${today}`,
        type: 'mood_reminder',
        title: NOTIFICATION_MESSAGES.mood_reminder.title,
        message: this.selectRandomMessage(NOTIFICATION_MESSAGES.mood_reminder.messages),
        scheduledTime: this.getOptimalTime(19), // 19:00
        priority: 'low'
      });
    }

    return notifications;
  }

  // Basit bildirimler (AI çalışmıyorsa)
  private generateSimpleNotifications(
    logs: DailyLog[],
    periods: PeriodSpan[],
    prefs: CyclePrefs,
    today: string
  ): AINotification[] {
    const notifications: AINotification[] = [];

    // Basit adet hatırlatıcısı
    if (this.settings.periodReminders && prefs.lastPeriodStart) {
      const nextPeriodDate = addDays(prefs.lastPeriodStart, prefs.avgCycleDays);
      const daysUntilPeriod = daysBetween(today, nextPeriodDate);

      if (daysUntilPeriod === 2) {
        notifications.push({
          id: `simple-period-reminder-${today}`,
          type: 'period_reminder',
          title: NOTIFICATION_MESSAGES.period_reminder.title,
          message: this.selectRandomMessage(NOTIFICATION_MESSAGES.period_reminder.messages),
          scheduledTime: this.getOptimalTime(18),
          priority: 'medium'
        });
      }
    }

    return notifications;
  }

  // Semptom mesajları
  private getSymptomMessage(symptomId: Symptom): string {
    const symptomMessages: Record<Symptom, string> = {
      cramp: "Bugün kramp yaşayabilirsiniz. Sıcak kompres ve hafif egzersiz iyi gelebilir.",
      headache: "Baş ağrısı riskiniz var. Bol su içmeyi ve dinlenmeyi unutmayın.",
      lowEnergy: "Düşük enerji seviyesi bekleniyor. Hafif aktiviteler ve iyi beslenme önemli.",
      bloating: "Şişkinlik yaşayabilirsiniz. Tuz alımını azaltmayı ve bol su içmeyi deneyin.",
      backPain: "Bel ağrısı olabilir. Doğru duruş ve hafif esneme hareketleri yardımcı olabilir.",
      jointPain: "Eklem ağrısı riski var. Sıcak uygulama ve dinlenme önemli.",
      nausea: "Mide bulantısı yaşayabilirsiniz. Az az ve sık sık beslenmeyi deneyin.",
      constipation: "Kabızlık olabilir. Lifli besinler ve bol su tüketimi önemli.",
      diarrhea: "İshal riski var. Sıvı alımını artırmayı ve hafif beslenmeyi unutmayın.",
      acne: "Akne çıkabilir. Cildinizi temiz tutmayı ve ağır kozmetiklerden kaçınmayı unutmayın.",
      breastTenderness: "Göğüs hassasiyeti yaşayabilirsiniz. Rahat sütyen giymeyi tercih edin.",
      discharge: "Akıntı değişiklikleri olabilir. Bu normal bir durumdur.",
      sleepy: "Uykulu hissedebilirsiniz. Yeterli uyku almayı unutmayın.",
      insomnia: "Uykusuzluk yaşayabilirsiniz. Rahatlatıcı aktiviteler deneyin.",
      appetite: "İştah değişiklikleri olabilir. Dengeli beslenmeye dikkat edin.",
      cravings: "Tatlı krizleri yaşayabilirsiniz. Sağlıklı alternatifler deneyin.",
      anxious: "Kaygı hissedebilirsiniz. Nefes egzersizleri ve rahatlatıcı aktiviteler yardımcı olabilir.",
      irritable: "Sinirlilik yaşayabilirsiniz. Kendinize zaman ayırmayı unutmayın.",
      focusIssues: "Dikkat sorunları yaşayabilirsiniz. Tek seferde bir işe odaklanmayı deneyin."
    };

    return symptomMessages[symptomId] || "Bugün bazı semptomlar yaşayabilirsiniz.";
  }

  // Rastgele mesaj seç
  private selectRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Optimal zaman hesapla
  private getOptimalTime(hour: number): Date {
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hour, 0, 0, 0);

    // Geçmişteyse yarına al
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Sessiz saatlerde ise uygun saate al
    if (this.isInQuietHours(scheduledTime.getHours())) {
      scheduledTime.setHours(this.getNextAvailableHour());
    }

    return scheduledTime;
  }

  // Sessiz saatlerde mi?
  private isInQuietHours(hour: number): boolean {
    const { start, end } = this.settings.quietHours;
    if (start > end) {
      // Gece boyunca (örn: 22:00 - 08:00)
      return hour >= start || hour < end;
    } else {
      // Gündüz boyunca (örn: 12:00 - 14:00)
      return hour >= start && hour < end;
    }
  }

  // Sonraki uygun saati al
  private getNextAvailableHour(): number {
    const { start, end } = this.settings.quietHours;
    return start > end ? end : start;
  }

  // Bildirimleri filtrele ve sınırla
  private filterAndLimitNotifications(notifications: AINotification[]): AINotification[] {
    // Öncelik sırasına göre sırala
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    // Günlük limit uygula
    return notifications.slice(0, this.settings.maxDailyNotifications);
  }

  // Ayarları güncelle
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Bildirimleri al
  getScheduledNotifications(): AINotification[] {
    return [...this.scheduledNotifications];
  }

  // Bildirim temizle
  clearNotification(id: string): void {
    this.scheduledNotifications = this.scheduledNotifications.filter(n => n.id !== id);
  }
}

// Singleton instance
let notificationPlanner: AINotificationPlanner | null = null;

export function getAINotificationPlanner(settings?: NotificationSettings): AINotificationPlanner {
  if (!notificationPlanner) {
    notificationPlanner = new AINotificationPlanner(settings);
  }
  return notificationPlanner;
}

// Ana fonksiyon - bildirimleri planla
export async function planAINotifications(
  logs: DailyLog[],
  periods: PeriodSpan[],
  prefs: CyclePrefs,
  settings?: NotificationSettings
): Promise<AINotification[]> {
  const planner = getAINotificationPlanner(settings);
  return await planner.planNotifications(logs, periods, prefs);
}
