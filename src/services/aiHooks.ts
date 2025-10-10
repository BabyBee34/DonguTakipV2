/**
 * AI Integration Hooks
 * 
 * Bu dosya gelecekte AI motoruna veri göndermek için kullanılacak.
 * Şimdilik tüm fonksiyonlar offline (cihaz içi) çalışıyor.
 */

/**
 * Kullanıcının günlük ruh halini AI'ya loglar
 * 
 * @param mood - Kullanıcının seçtiği ruh hali
 * 
 * TODO: Yakında — cihaz içi model/KB öneri sistemine mood sinyali gönderilecek.
 * Şimdilik hiçbir yere göndermiyoruz (offline).
 */
export function trackMoodForAI(mood: string): void {
  // Gelecekte burada:
  // - Local KB'ye mood + timestamp kaydedilecek
  // - Haftalık pattern analizi yapılacak
  // - Döngü fazı ile mood korelasyonu çıkarılacak
  // - Kişiselleştirilmiş öneriler üretilecek
  
  if (__DEV__) {
    console.log('[AI Hook] Mood tracked:', mood);
  }
}

/**
 * Kullanıcının semptom bilgilerini AI'ya gönderir
 * 
 * @param symptoms - Seçilen semptomlar
 * @param date - Tarih
 */
export function trackSymptomsForAI(symptoms: string[], date: string): void {
  if (__DEV__) {
    console.log('[AI Hook] Symptoms tracked:', { symptoms, date });
  }
}

/**
 * AI'dan kişiselleştirilmiş öneri alır (placeholder)
 * 
 * @returns Öneri metni
 */
export async function getPersonalizedTipFromAI(): Promise<string> {
  // TODO: Gelecekte gerçek AI motoru bağlanacak
  return 'Bu bir placeholder öneri. AI henüz aktif değil.';
}





