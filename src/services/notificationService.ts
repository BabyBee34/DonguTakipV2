import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { format } from 'date-fns';
import { RootState } from '../store';
import { NotificationSettings } from '../types';

// Bildirim tipleri
export enum NotificationType {
  DAILY_LOG = 'daily_log',
  PERIOD_REMINDER = 'period_reminder',
  WATER_REMINDER = 'water_reminder',
  MOTIVATION = 'motivation',
}

// Bildirim içerikleri
const NOTIFICATION_CONTENT = {
  [NotificationType.DAILY_LOG]: {
    title: 'Günlük Hatırlatması',
    body: 'Günlüğünü kaydet! 📖 Bugün nasıl hissediyorsun?',
  },
  [NotificationType.PERIOD_REMINDER]: {
    title: 'Adet Hatırlatması',
    body: 'Adet dönemin yaklaşıyor 🌸 Hazırlık yapabilirsin.',
  },
  [NotificationType.WATER_REMINDER]: {
    title: 'Su Hatırlatması',
    body: 'Su içme zamanı! 💧 Kendine iyi bak.',
  },
  [NotificationType.MOTIVATION]: {
    title: 'Günaydın!',
    body: 'Bugün harika bir gün olacak! 🌞 Pozitif kal!',
  },
};

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Bildirim izni kontrol et
 */
export async function checkNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Bildirim izni iste
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E66FD2',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Tüm planlanmış bildirimleri iptal et
 */
export async function cancelAllScheduledNotificationsAsync(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Belirli bir bildirim tipini iptal et
 */
export async function cancelNotificationByType(type: NotificationType): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const notificationsToCancel = scheduledNotifications.filter(
    notification => notification.content.data?.type === type
  );

  for (const notification of notificationsToCancel) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

/**
 * Bildirimleri planla
 */
export async function scheduleNotifications(
  settings: NotificationSettings,
  nextPeriodDate?: string
): Promise<void> {
  // Önce tüm mevcut bildirimleri iptal et
  await cancelAllScheduledNotificationsAsync();

  if (!settings.enabled) {
    return;
  }

  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    // İzin verilmediyse sessizce çıkmak yerine üst katmanların kullanıcıyı bilgilendirmesi için erken dön
    console.warn('Bildirim izni verilmedi');
    return;
  }

  // Günlük hatırlatmaları planla
  await scheduleDailyLogReminders(settings);

  // Yaklaşan adet bildirimi planla
  if (settings.periodReminder && nextPeriodDate) {
    await schedulePeriodReminder(nextPeriodDate);
  }

  // Su içme hatırlatmaları (balanced/high modda)
  if (settings.frequency === 'balanced' || settings.frequency === 'high') {
    await scheduleWaterReminders(settings);
  }

  // Motivasyon bildirimleri (high modda)
  if (settings.frequency === 'high') {
    await scheduleMotivationNotifications(settings);
  }
}

/**
 * Günlük log hatırlatmalarını planla
 */
async function scheduleDailyLogReminders(settings: NotificationSettings): Promise<void> {
  const { frequency, reminderTime } = settings;
  const [hours, minutes] = reminderTime.split(':').map(Number);

  let intervals: number[] = [];
  switch (frequency) {
    case 'low':
      intervals = [12 * 60]; // 12 saatte bir (1/gün)
      break;
    case 'balanced':
      intervals = [8 * 60, 16 * 60]; // 8 saatte bir (2/gün)
      break;
    case 'high':
      intervals = [6 * 60, 12 * 60, 18 * 60]; // 6 saatte bir (3/gün)
      break;
  }

  for (const intervalMinutes of intervals) {
    // Başlangıç saatine interval ekleyip 24 saati mod al
    const totalMinutes = (hours * 60 + minutes + intervalMinutes) % (24 * 60);
    const triggerHour = Math.floor(totalMinutes / 60);
    const triggerMinute = totalMinutes % 60;

    const trigger: Notifications.NotificationTriggerInput = {
      hour: triggerHour,
      minute: triggerMinute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_CONTENT[NotificationType.DAILY_LOG].title,
        body: NOTIFICATION_CONTENT[NotificationType.DAILY_LOG].body,
        data: { type: NotificationType.DAILY_LOG },
      },
      trigger,
    });
  }
}

/**
 * Yaklaşan adet bildirimini planla
 */
async function schedulePeriodReminder(nextPeriodDate: string): Promise<void> {
  const periodDate = new Date(nextPeriodDate);
  const reminderDate = new Date(periodDate);
  reminderDate.setDate(reminderDate.getDate() - 2); // 2 gün önce

  // Geçmiş bir tarihse planlama
  if (reminderDate < new Date()) {
    return;
  }

  const trigger: Notifications.NotificationTriggerInput = {
    date: reminderDate,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: NOTIFICATION_CONTENT[NotificationType.PERIOD_REMINDER].title,
      body: NOTIFICATION_CONTENT[NotificationType.PERIOD_REMINDER].body,
      data: { type: NotificationType.PERIOD_REMINDER },
    },
    trigger,
  });
}

/**
 * Su içme hatırlatmalarını planla
 */
async function scheduleWaterReminders(settings: NotificationSettings): Promise<void> {
  const { frequency } = settings;
  
  // Balanced: günde 2 kez (10:00, 15:00)
  // High: günde 3 kez (10:00, 14:00, 18:00)
  const times = frequency === 'balanced' 
    ? [{ hour: 10, minute: 0 }, { hour: 15, minute: 0 }]
    : [{ hour: 10, minute: 0 }, { hour: 14, minute: 0 }, { hour: 18, minute: 0 }];

  for (const time of times) {
    const trigger: Notifications.NotificationTriggerInput = {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_CONTENT[NotificationType.WATER_REMINDER].title,
        body: NOTIFICATION_CONTENT[NotificationType.WATER_REMINDER].body,
        data: { type: NotificationType.WATER_REMINDER },
      },
      trigger,
    });
  }
}

/**
 * Motivasyon bildirimlerini planla
 */
async function scheduleMotivationNotifications(settings: NotificationSettings): Promise<void> {
  // Sabah 9:00'da motivasyon mesajı
  const trigger: Notifications.NotificationTriggerInput = {
    hour: 9,
    minute: 0,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: NOTIFICATION_CONTENT[NotificationType.MOTIVATION].title,
      body: NOTIFICATION_CONTENT[NotificationType.MOTIVATION].body,
      data: { type: NotificationType.MOTIVATION },
    },
    trigger,
  });
}

/**
 * Bildirim tıklandığında navigation işlemi
 */
export function handleNotificationPress(
  notification: Notifications.Notification,
  navigation: any
): void {
  const notificationType = notification.request.content.data?.type as NotificationType;

  switch (notificationType) {
    case NotificationType.DAILY_LOG:
      navigation.navigate('DailyLog');
      break;
    case NotificationType.PERIOD_REMINDER:
      navigation.navigate('Calendar');
      break;
    case NotificationType.WATER_REMINDER:
      // Su içme hatırlatması için özel bir ekran yok, takvime yönlendir
      navigation.navigate('Calendar');
      break;
    case NotificationType.MOTIVATION:
      navigation.navigate('Calendar');
      break;
    default:
      navigation.navigate('Calendar');
  }
}

/**
 * Bildirim listener'ı kur
 */
export function setupNotificationListeners(navigation?: any): () => void {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Bildirim alındı:', notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    if (navigation) {
      handleNotificationPress(response.notification, navigation);
    }
  });

  // Cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

/**
 * Mevcut bildirim ayarlarını al
 */
export function getCurrentNotificationSettings(state: RootState): NotificationSettings {
  // Redux state'den gerçek bildirim ayarlarını döndür
  // notification slice mevcut değilse güvenli varsayılanlar döner
  const slice: any = (state as any).notification;
  if (slice && slice.settings) {
    return slice.settings as NotificationSettings;
  }
  return {
    enabled: true,
    frequency: 'balanced',
    reminderTime: '09:00',
    periodReminder: true,
  };
}

/**
 * Sonraki adet tarihini hesapla
 */
export function calculateNextPeriodDate(state: RootState): string | undefined {
  const { prefs, periods } = state;
  
  if (!prefs.lastPeriodStart || !prefs.avgCycleDays) {
    return undefined;
  }

  const lastPeriod = new Date(prefs.lastPeriodStart);
  const nextPeriod = new Date(lastPeriod);
  nextPeriod.setDate(nextPeriod.getDate() + prefs.avgCycleDays);
  // Yerel saate göre formatla, UTC kaymalarını engelle
  return format(nextPeriod, 'yyyy-MM-dd');
}