import { CyclePhase, PhaseInfo, Symptom } from '../types';
import { apiClient, API_ENDPOINTS, USE_API, generateMockResponse } from './api';

export interface TipSuggestion {
  title: string;
  content: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
}

// Semptom bazlı öneriler
export async function getSuggestions(symptoms: Symptom[]): Promise<TipSuggestion[]> {
  // API mode'da gerçek API'yi kullan
  if (USE_API) {
    try {
      const response = await apiClient.post<TipSuggestion[]>(API_ENDPOINTS.TIPS_SUGGEST, {
        symptoms,
        userContext: {
          // Kullanıcı bağlamı eklenebilir
          phase: 'unknown', // Bu bilgi mevcut döngü fazından alınabilir
        },
      });
      return response.data;
    } catch (error) {
      console.warn('API\'den öneri alınamadı, mock veri kullanılıyor:', error);
      return getMockSuggestions(symptoms);
    }
  }
  
  // Mock mode'da yerel veriyi kullan
  return getMockSuggestions(symptoms);
}

// Mock öneriler (yerel veri)
function getMockSuggestions(symptoms: Symptom[]): Promise<TipSuggestion[]> {
  // Simulated API delay
  return generateMockResponse(getLocalSuggestions(symptoms));
}

// Yerel öneri verileri (mevcut kod)
function getLocalSuggestions(symptoms: Symptom[]): TipSuggestion[] {
  const suggestions: TipSuggestion[] = [];
  
  // Ağrılar
  if (symptoms.includes('cramp')) {
    suggestions.push({
      title: 'Kramplar için doğal çözümler',
      content: 'Sıcak kompres uygulayın (15-20 dk). Hafif egzersiz (yoga, yürüyüş) kasları gevşetir. Magnezyum açısından zengin besinler tüketin (badem, ıspanak).',
      source: 'Tıbbi Literatür',
      priority: 'high',
    });
  }
  
  if (symptoms.includes('headache')) {
    suggestions.push({
      title: 'Baş ağrısını hafifleten yöntemler',
      content: 'Günde 2-3 litre su için (dehidrasyon baş ağrısı tetikler). Karanlık ve sessiz bir ortamda dinlenin. Kafein tüketimini azaltın.',
      source: 'Tıbbi Literatür',
      priority: 'high',
    });
  }
  
  if (symptoms.includes('backPain')) {
    suggestions.push({
      title: 'Sırt ağrısı için rahatlama',
      content: 'Sıcak duş alın veya ısı pedi kullanın. Hafif germe egzersizleri yapın. Doğru postürde oturmaya dikkat edin.',
      source: 'Fizik Tedavi',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('jointPain')) {
    suggestions.push({
      title: 'Eklem ağrısını azaltma',
      content: 'Antiinflamatuar besinler tüketin (zencefil, zerdeçal). Hafif hareketler yapın, hareketsiz kalmayın. Bol su için.',
      source: 'Tıbbi Literatür',
      priority: 'medium',
    });
  }
  
  // Sindirim
  if (symptoms.includes('bloating')) {
    suggestions.push({
      title: 'Şişkinliği azaltma ipuçları',
      content: 'Tuz tüketimini sınırlayın (su tutmaya neden olur). Bol su için (paradoksal ama su tutmayı azaltır). Hafif yürüyüş yapın (sindirimi destekler).',
      source: 'Beslenme Rehberi',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('nausea')) {
    suggestions.push({
      title: 'Bulantıyı hafifletme',
      content: 'Zencefil çayı içebilirsiniz. Küçük porsiyonlar halinde yemek yiyin. Narenciye kokları rahatlık sağlayabilir.',
      source: 'Tıbbi Literatür',
      priority: 'high',
    });
  }
  
  if (symptoms.includes('constipation')) {
    suggestions.push({
      title: 'Kabızlık için çözümler',
      content: 'Lifli besinler tüketin (sebze, meyve, tam tahıl). Bol su için (günde 2-3 litre). Düzenli egzersiz yapın.',
      source: 'Beslenme Rehberi',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('diarrhea')) {
    suggestions.push({
      title: 'İshal yönetimi',
      content: 'Bol sıvı tüketin (dehidrasyon önlemek için). Baharatli ve yağlı yiyeceklerden kaçının. Probiyotik içeren yoğurt tüketin.',
      source: 'Tıbbi Literatür',
      priority: 'high',
    });
  }
  
  // Cilt & Fiziksel
  if (symptoms.includes('acne')) {
    suggestions.push({
      title: 'Hormonal akne yönetimi',
      content: 'Yüzünüzü günde 2 kez hafif temizleyici ile yıkayın. Yastık kılıfınızı sık değiştirin. Yüzünüze dokunmamaya özen gösterin. Bu döngüsel bir durum ve normaldir.',
      source: 'Dermatoloji Kılavuzu',
      priority: 'low',
    });
  }
  
  if (symptoms.includes('breastTenderness')) {
    suggestions.push({
      title: 'Göğüs hassasiyetini azaltma',
      content: 'Destekleyici sütyen kullanın. Kafein tüketimini azaltın. Soğuk kompres uygulayabilirsiniz.',
      source: 'Tıbbi Literatür',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('discharge')) {
    suggestions.push({
      title: 'Vajinal akıntı hakkında',
      content: 'Ovulasyon döneminde berrak, kaygan akıntı normaldir. Pamuklu iç çamaşırı tercih edin. Koku veya renk değişimi varsa doktora danışın.',
      source: 'Jinekoloji',
      priority: 'low',
    });
  }
  
  // Enerji & Uyku
  if (symptoms.includes('lowEnergy') || symptoms.includes('tired')) {
    suggestions.push({
      title: 'Enerji seviyenizi artırın',
      content: 'Demir içeren besinler tüketin (kırmızı et, baklagiller, koyu yapraklı sebzeler). 7-9 saat uyuyun. Kısa power nap\'ler (20 dk) yardımcı olabilir.',
      source: 'Beslenme Rehberi',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('sleepy')) {
    suggestions.push({
      title: 'Uykuya dikkat',
      content: 'Düzenli uyku saatlerine dikkat edin. Öğle uykusu çok uzun olmasın (20-30 dk ideal). Yatmadan önce ekranlardan uzak durun.',
      source: 'Uyku Tıbbı',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('insomnia')) {
    suggestions.push({
      title: 'Uyku kalitenizi iyileştirin',
      content: 'Yatmadan 1 saat önce ekranlardan uzak durun. Oda sıcaklığını 18-20°C\'de tutun. Akşam kafein ve ağır yemeklerden kaçının.',
      source: 'Uyku Tıbbı',
      priority: 'high',
    });
  }
  
  // İştah
  if (symptoms.includes('appetite') || symptoms.includes('cravings')) {
    suggestions.push({
      title: 'İştah değişikliklerini yönetin',
      content: 'Karmaşık karbonhidratlar tüketin (tam tahıllar, sebzeler). Küçük ve sık öğünler tercih edin. Tatlı isteği için meyve seçin.',
      source: 'Beslenme Rehberi',
      priority: 'low',
    });
  }
  
  // Duygusal
  if (symptoms.includes('anxious')) {
    suggestions.push({
      title: 'Anksiyeteyi azaltma',
      content: 'Derin nefes egzersizleri yapın (4-7-8 tekniği). Meditasyon veya yoga deneyin. Hormonal değişiklikler duygularınızı etkileyebilir.',
      source: 'Psikoloji Kaynakları',
      priority: 'high',
    });
  }
  
  if (symptoms.includes('irritable')) {
    suggestions.push({
      title: 'Sinirlilik yönetimi',
      content: 'Kendinize zaman ayırın. Hafif egzersiz yapın (endorfin salgılanır). Hormonal değişiklikler geçicidir, kendinize nazik olun.',
      source: 'Psikoloji Kaynakları',
      priority: 'high',
    });
  }
  
  if (symptoms.includes('focusIssues')) {
    suggestions.push({
      title: 'Konsantrasyon artırma',
      content: 'Kısa molalar verin (Pomodoro tekniği). Bol su için. Omega-3 içeren besinler tüketin (balık, ceviz).',
      source: 'Bilişsel Psikoloji',
      priority: 'medium',
    });
  }
  
  // Genel öneriler (her zaman en az 3 öneri göster)
  if (suggestions.length < 3) {
    suggestions.push({
      title: 'Genel sağlık ipuçları',
      content: 'Bol su için (günde 2-3 litre). Düzenli hafif egzersiz yapın. Dengeli beslenin. Stres yönetimi tekniklerini deneyin.',
      source: 'Genel Sağlık',
      priority: 'low',
    });
  }
  
  // Priority'ye göre sırala
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]).slice(0, 3);
}

// Faz bazlı motivasyon mesajları
export function getPhaseMotivation(phase: CyclePhase, cycleDay?: number): string {
  const motivations: Record<CyclePhase, string[]> = {
    menstrual: [
      'Kendine nazik ol, dinlenmeye ihtiyacın var 🌸',
      'Yavaşlamak cesaret gerektirir, bugün izin ver kendine 💕',
      'Vücudun yenileniyor, bu güçlü bir süreç 🌺',
      'Bugün rahat kıyafetler giy ve kendini şımartmayı unutma 🛀',
    ],
    follicular: [
      'Enerjin yükseliyor! Yeni şeyler denemek için harika zaman 🌱',
      'Bugün harika fırsatlar var, kapıları aç! 🌟',
      'Yaratıcılığın zirvede, fikirlerini gerçekleştir! ✨',
      'Hedeflerine odaklanman için mükemmel bir dönem 🎯',
    ],
    ovulation: [
      'Enerjin zirvede! Sosyalleşmek için mükemmel gün 💜',
      'Kendini harika hissediyorsun ve öylesin! 🌟',
      'İletişim yeteneğin bugün çok güçlü 💬',
      'Bugün özgüvenin zirvede 💪',
    ],
    luteal: [
      'Self-care zamanı! Kendine özel vakit ayır 🛀',
      'Yavaş ve sakin, bugün acele etmene gerek yok 🌙',
      'Sezgilerin güçlü, içsel sesini dinle 🔮',
      'Dinlenme ve iyileşme zamanı, buna izin ver 🌿',
    ],
  };
  
  const messages = motivations[phase];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Detaylı faz bilgileri
export function getPhaseInfo(phase: CyclePhase): PhaseInfo {
  const phaseData: Record<CyclePhase, PhaseInfo> = {
    menstrual: {
      phase: 'menstrual',
      title: 'Menstrual Faz (Adet Dönemi)',
      description: 'Uterus duvarı (endometrium) dökülüyor. Vücudun yeni bir döngüye hazırlanıyor.',
      hormonInfo: 'Estrogen ve progesterone en düşük seviyede.',
      commonSymptoms: ['cramp', 'headache', 'backPain', 'lowEnergy', 'tired'],
      tips: [
        'Demir içeren besinler tüketin',
        'Sıcak kompres kullanın',
        'Hafif egzersiz yapın',
        'Bol su için',
        'Yeterli dinlenin',
      ],
      dayRange: 'Gün 1-5',
    },
    follicular: {
      phase: 'follicular',
      title: 'Foliküler Faz (Enerji Yükseliyor)',
      description: 'Yumurtalıklarda folikül gelişiyor, endometrium kalınlaşıyor. Enerji ve motivasyon artıyor.',
      hormonInfo: 'Estrogen yükselişe geçiyor, FSH aktif.',
      commonSymptoms: [],
      tips: [
        'Yüksek yoğunluklu egzersizler yapın',
        'Yeni projeler başlatın',
        'Sosyal aktivitelere katılın',
        'Yaratıcı işlerle uğraşın',
      ],
      dayRange: 'Gün 6-13',
    },
    ovulation: {
      phase: 'ovulation',
      title: 'Ovulasyon Fazı (Döl Verimlilik Zirvesi)',
      description: 'Yumurta serbest bırakılıyor. Enerji, libido ve sosyal beceriler zirvede.',
      hormonInfo: 'LH surge (ani artış), yumurta foliküleden çıkıyor.',
      commonSymptoms: ['discharge', 'breastTenderness'],
      tips: [
        'Hamilelik planlıyorsanız: en verimli dönem',
        'Planlamıyorsanız: ekstra koruma',
        'Bol su için (akıntı artışı normal)',
        'Sosyal aktivitelerin tadını çıkarın',
      ],
      dayRange: 'Gün 14 (±2)',
    },
    luteal: {
      phase: 'luteal',
      title: 'Luteal Faz (Sakinleşme Dönemi)',
      description: 'Corpus luteum progesterone salgılıyor. Geç dönemde PMS semptomları başlayabilir.',
      hormonInfo: 'Progesterone yüksek, ardından estrogen ve progesterone düşüşe geçer.',
      commonSymptoms: [
        'bloating',
        'breastTenderness',
        'acne',
        'appetite',
        'irritable',
        'anxious',
        'lowEnergy',
      ],
      tips: [
        'Düşük yoğunluklu egzersiz (yoga, pilates)',
        'Magnezyum/B6 takviyeleri',
        'Karmaşık karbonhidratlar tüketin',
        'Kafein/tuz azaltın',
        'Self-care ritüelleri yapın',
        'Yeterli uyuyun',
      ],
      dayRange: 'Gün 15-28',
    },
  };
  
  return phaseData[phase];
}
