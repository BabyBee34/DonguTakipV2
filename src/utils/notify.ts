/**
 * Bildirim planlama yardımcı fonksiyonları
 */
import * as Notifications from 'expo-notifications';
import { format, addDays, subDays, isBefore, isAfter, parseISO } from 'date-fns';

/**
 * Tüm planlanmış bildirimleri iptal et
 */
export async function cancelAllPlans(): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduledNotifications.map(n => 
      Notifications.cancelScheduledNotificationAsync(n.identifier)
    )
  );
}

/**
 * Günlük hatırlatma planla (her gün aynı saatte)
 */
export async function scheduleDailyReminder(time: string): Promise<string | null> {
  try {
    // "09:00" -> hours/minutes
    const [h, m] = time.split(':').map(Number);
    
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Mini check-in ⏰',
        body: 'Bugünkü günlüğünü doldurmak ister misin?',
        sound: false,
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour: h,
        minute: m,
        repeats: true,
        channelId: 'default',
      } as any,
    });

    return identifier;
  } catch (error) {
    console.error('Daily reminder schedule error:', error);
    return null;
  }
}

/**
 * Adet öncesi bildirim planla (X gün önce)
 */
export async function schedulePrePeriod(
  daysBefore: number, 
  targetDateISO: string
): Promise<string | null> {
  try {
    if (daysBefore <= 0) return null;

    const targetDate = parseISO(targetDateISO);
    const fireDate = subDays(targetDate, daysBefore);
    
    // Sadece gelecekteki tarihler için planla
    const now = new Date();
    if (isBefore(fireDate, now)) {
      return null;
    }

    // Sabah 10:00'da bildirim gönder
    fireDate.setHours(10, 0, 0, 0);

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Yaklaşan adet 🌸',
        body: `${daysBefore} gün sonra başlayabilir. Hazırlık yapabilirsin.`,
        sound: true,
        data: { type: 'pre_period', daysBefore },
      },
      trigger: fireDate,
    });

    return identifier;
  } catch (error) {
    console.error('Pre-period schedule error:', error);
    return null;
  }
}

/**
 * Tüm gelecek adet tarihleri için bildirim planla
 */
export async function scheduleAllUpcomingPeriods(
  upcomingDates: string[],
  daysBefore: number
): Promise<number> {
  let count = 0;
  
  for (const dateISO of upcomingDates) {
    const identifier = await schedulePrePeriod(daysBefore, dateISO);
    if (identifier) count++;
  }
  
  return count;
}

/**
 * Planlanmış bildirim sayısını al
 */
export async function getScheduledNotificationCount(): Promise<number> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  return scheduledNotifications.length;
}

