// Semptom kategorileri ve bilgileri
export interface SymptomInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  whenToNote: string;
}

export const SYMPTOM_CATEGORIES = [
  {
    title: 'Ağrılar',
    data: [
      {
        id: 'kramp',
        name: 'Kramp',
        category: 'Ağrılar',
        description: 'Alt karında kasılma ve ağrı hissi. Genellikle adet döneminde görülür.',
        whenToNote: 'Şiddet, süre ve günlük aktivitene etkisini not et.',
      },
      {
        id: 'bas_agrisi',
        name: 'Baş Ağrısı',
        category: 'Ağrılar',
        description: 'Hormon değişimlerine bağlı baş ağrısı.',
        whenToNote: 'Ağrının şiddeti ve ne zaman başladığını kaydet.',
      },
      {
        id: 'sirt_agrisi',
        name: 'Sırt Ağrısı',
        category: 'Ağrılar',
        description: 'Alt veya üst sırtta ağrı ve gerginlik.',
        whenToNote: 'Hangi bölgede olduğunu ve şiddetini not et.',
      },
      {
        id: 'eklem_agrisi',
        name: 'Eklem Ağrısı',
        category: 'Ağrılar',
        description: 'Dizler, bilekler veya diğer eklemlerde ağrı.',
        whenToNote: 'Hangi eklemi etkilediğini belirt.',
      },
      {
        id: 'alt_karin',
        name: 'Alt Karın Ağrısı',
        category: 'Ağrılar',
        description: 'Pelvik bölgede ağrı ve rahatsızlık.',
        whenToNote: 'Şiddet ve süresini not et.',
      },
    ],
  },
  {
    title: 'Sindirim',
    data: [
      {
        id: 'siskinlik',
        name: 'Şişkinlik',
        category: 'Sindirim',
        description: 'Karında şişme ve dolgunluk hissi.',
        whenToNote: 'Hangi yiyeceklerden sonra arttığını gözlemle.',
      },
      {
        id: 'bulanti',
        name: 'Bulantı',
        category: 'Sindirim',
        description: 'Mide bulantısı ve kusma hissi.',
        whenToNote: 'Günün hangi saatinde olduğunu kaydet.',
      },
      {
        id: 'kabizlik',
        name: 'Kabızlık',
        category: 'Sindirim',
        description: 'Bağırsak hareketlerinde yavaşlama.',
        whenToNote: 'Süresini ve rahatsızlık seviyesini not et.',
      },
      {
        id: 'ishal',
        name: 'İshal',
        category: 'Sindirim',
        description: 'Sık ve sulu dışkılama.',
        whenToNote: 'Sıklığını ve ciddiyet durumunu kaydet.',
      },
      {
        id: 'gaz',
        name: 'Gaz',
        category: 'Sindirim',
        description: 'Gaz birikimi ve rahatsızlık.',
        whenToNote: 'Hangi durumlarda arttığını gözlemle.',
      },
    ],
  },
  {
    title: 'Cilt',
    data: [
      {
        id: 'akne',
        name: 'Akne',
        category: 'Cilt',
        description: 'Hormon değişimlerine bağlı sivilce oluşumu.',
        whenToNote: 'Yoğunluğunu ve yerini not et.',
      },
      {
        id: 'yaglanma',
        name: 'Yağlanma',
        category: 'Cilt',
        description: 'Ciltte aşırı yağlanma.',
        whenToNote: 'Hangi bölgelerde olduğunu kaydet.',
      },
      {
        id: 'kuruluk',
        name: 'Kuruluk',
        category: 'Cilt',
        description: 'Cilt kuruluğu ve sıkılık hissi.',
        whenToNote: 'Seviyesini ve kullandığın ürünleri not et.',
      },
      {
        id: 'dokuntu',
        name: 'Döküntü',
        category: 'Cilt',
        description: 'Ciltte kızarıklık veya döküntü.',
        whenToNote: 'Yerini ve şeklini kaydet.',
      },
    ],
  },
  {
    title: 'Fiziksel',
    data: [
      {
        id: 'gogus_hassasiyeti',
        name: 'Göğüs Hassasiyeti',
        category: 'Fiziksel',
        description: 'Göğüste ağrı ve hassasiyet.',
        whenToNote: 'Şiddeti ve günlük aktiviteye etkisini not et.',
      },
      {
        id: 'akinti',
        name: 'Akıntı',
        category: 'Fiziksel',
        description: 'Vajinal akıntıdaki değişiklikler.',
        whenToNote: 'Renk ve kıvamı gözlemle.',
      },
      {
        id: 'sirt_gerginligi',
        name: 'Sırt Gerginliği',
        category: 'Fiziksel',
        description: 'Sırtta gerginlik ve sertlik.',
        whenToNote: 'Hangi bölgede olduğunu belirt.',
      },
    ],
  },
  {
    title: 'Enerji',
    data: [
      {
        id: 'dusuk_enerji',
        name: 'Düşük Enerji',
        category: 'Enerji',
        description: 'Genel yorgunluk ve enerji eksikliği.',
        whenToNote: 'Günlük aktivitelere etkisini kaydet.',
      },
      {
        id: 'uykulu',
        name: 'Uykulu',
        category: 'Enerji',
        description: 'Aşırı uyku hali ve yorgunluk.',
        whenToNote: 'Uyku sürenle ilişkisini not et.',
      },
      {
        id: 'uykusuzluk',
        name: 'Uykusuzluk',
        category: 'Enerji',
        description: 'Uyku başlatma veya sürdürme zorluğu.',
        whenToNote: 'Ne kadar uyuduğunu ve kalitesini kaydet.',
      },
      {
        id: 'huzursuz',
        name: 'Huzursuz',
        category: 'Enerji',
        description: 'İç huzursuzluk ve rahatsızlık hissi.',
        whenToNote: 'Ne zaman başladığını ve şiddetini not et.',
      },
    ],
  },
  {
    title: 'İştah',
    data: [
      {
        id: 'artan_istah',
        name: 'Artan İştah',
        category: 'İştah',
        description: 'Normalden daha fazla yeme isteği.',
        whenToNote: 'Hangi besinlere yöneldiğini gözlemle.',
      },
      {
        id: 'azalan_istah',
        name: 'Azalan İştah',
        category: 'İştah',
        description: 'Yeme isteğinde azalma.',
        whenToNote: 'Süresini ve etkisini kaydet.',
      },
      {
        id: 'besin_istegi',
        name: 'Özel Besin İsteği',
        category: 'İştah',
        description: 'Tatlı, tuzlu veya belirli besinlere istek.',
        whenToNote: 'Hangi besinleri istediğini not et.',
      },
    ],
  },
  {
    title: 'Duygusal',
    data: [
      {
        id: 'anksiyete',
        name: 'Anksiyete',
        category: 'Duygusal',
        description: 'Kaygı ve endişe hissi.',
        whenToNote: 'Yoğunluğunu ve tetikleyicileri kaydet.',
      },
      {
        id: 'sinirlilik',
        name: 'Sinirlilik',
        category: 'Duygusal',
        description: 'Tahammülsüzlük ve sinirlilik.',
        whenToNote: 'Ne zaman başladığını ve şiddetini not et.',
      },
      {
        id: 'odaklanma',
        name: 'Odaklanma Zorluğu',
        category: 'Duygusal',
        description: 'Konsantrasyon kaybı.',
        whenToNote: 'Hangi aktivitelerde zorlandığını belirt.',
      },
      {
        id: 'duygusallik',
        name: 'Duygusallık',
        category: 'Duygusal',
        description: 'Duygu değişimleri ve hassasiyet.',
        whenToNote: 'Tetikleyicileri ve şiddetini kaydet.',
      },
    ],
  },
  {
    title: 'Diğer',
    data: [
      {
        id: 'bas_donmesi',
        name: 'Baş dönmesi',
        category: 'Diğer',
        description: 'Denge kaybı ve sersemlik hissi.',
        whenToNote: 'Sıklığını ve şiddetini not et.',
      },
      {
        id: 'sicak_bası',
        name: 'Sıcak basması',
        category: 'Diğer',
        description: 'Ani sıcaklık hissi ve terleme.',
        whenToNote: 'Ne zaman olduğunu ve süresini kaydet.',
      },
      {
        id: 'titreme',
        name: 'Titreme',
        category: 'Diğer',
        description: 'Vücutta titreme ve üşüme.',
        whenToNote: 'Yoğunluğunu ve süresini not et.',
      },
    ],
  },
];

// Semptom ID'den bilgi al
export function getSymptomInfo(id: string): SymptomInfo | undefined {
  for (const category of SYMPTOM_CATEGORIES) {
    const symptom = category.data.find((s) => s.id === id);
    if (symptom) return symptom;
  }
  return undefined;
}




