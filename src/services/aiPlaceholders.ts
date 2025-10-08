// AI Placeholders - Henüz bağlı değil
export const AI_ENABLED = false;

// Bugün için akıllı öneri (placeholder)
export function getDailySmartTipPlaceholder() {
  return {
    title: 'Akıllı öneri (yakında)',
    body: 'Bugünkü fazına ve semptomlarına göre kişisel öneriler burada görünecek. Şimdilik genel bir hatırlatma: Su içmeyi unutma 💧',
  };
}

// Özet analitik (placeholder)
export function getInsightsPlaceholder() {
  return [
    { label: 'Sonraki Adet', value: '12 gün', sub: 'tahmini' },
    { label: 'Fertil Pencere', value: '14–19 Ekim', sub: 'yakında' },
    { label: 'Bugün', value: 'Gün 7', sub: 'Foliküler' },
  ];
}

// Bugünkü motivasyon mesajı (placeholder)
export function getMotivationPlaceholder() {
  const messages = [
    'Enerjin yükseliyor! Yeni şeyler denemek için harika bir zaman 🌱',
    'Bugün kendine ekstra iyi bak. Küçük mutluluklara odaklan 💖',
    'Vücudun sana mesajlar gönderiyor. Dinlemeyi unutma 🌸',
    'Her gün yeni bir başlangıç. Bugün nasıl hissediyorsun? 💫',
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

// Faz bazlı genel öneri (placeholder)
export function getPhaseBasedTipPlaceholder(phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal') {
  const tips = {
    menstrual: 'Dinlenmeye öncelik ver. Sıcak uygulama ve hafif yürüyüş rahatlık sağlayabilir.',
    follicular: 'Enerji seviyesi yüksek! Yeni projeler başlatmak için ideal zaman.',
    ovulation: 'Sosyal etkileşimler için en iyi dönem. Enerjini paylaş!',
    luteal: 'Yavaşlamaya izin ver. Kendine nazik ol, dinlenme zamanı yaklaşıyor.',
  };
  
  return tips[phase] || 'Vücudunu dinle ve ihtiyaçlarına göre hareket et.';
}

