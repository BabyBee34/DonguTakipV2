# 🌸 CycleMate — Eksiksiz Master Prompt & PRD (Expo React Native • Android)

## 📋 PROMPT ÖZET (Cursor için tek seferde kullan)

**Talimat:** Aşağıdaki PRD'ye birebir uyarak **Expo React Native (Android)** bir adet takip uygulaması üret. Task planındaki sırayla ilerle; her task bittiğinde çalışan, persist eden bir uygulama bırak. Tasarım dili, alt bar, buton ve kart stilleri tüm ekranda **aynı** olacak. Veriler **AsyncStorage**'da tutulacak; tahmin algoritması ve öneri kartı **local** çalışacak, `services` katmanında backend arayüzleri hazırlanacak. Tıbbi doğruluk ve kullanıcı güvenliği en yüksek öncelik. README'ye kurulum/çalıştırma ve build adımlarını yaz.

---

## 0) Ürün Amacı & Değer Önerisi

**Misyon:** Kadınların **regl döngülerini**, **ruh hallerini** ve **semptomlarını** kolayca kaydedip anlamlandırmalarını; **tıbben doğru**, **eğlenceli** ama **bilgilendirici** öneriler ve **istatistiklerle** desteklenmelerini sağlamak.

### Ana Değerler:
- **Hızlı kullanım:** Takvimden "Adet Başlat/Bitti" ve "Günlük Kaydet" aksiyonları
- **Bilimsel doğruluk:** Hormon döngüleri ve faz bilgileri tıbbi kaynaklara dayalı
- **Kişisel destek:** Seçilen semptom/mood'a göre anında **kanıta dayalı öneri kartı**
- **Özel & güvenli:** Veriler **buluta değil, cihazda** (offline-first)
- **Modern deneyim:** Pastel, gradient, playful; Figma seviyesinde tutarlı UI
- **Eğitici:** Her fazın anlamını ve hormon değişikliklerini açıklayan bilgi kartları

---

## 1) Kapsam (Scope)

### Teknik Stack:
- Platform: **Expo React Native (Android)** (iOS'a hazır mimari)
- Navigasyon: **React Navigation** (Stack + Bottom Tabs)
- State Management: **Redux Toolkit** + **redux-persist**
- Depolama: **AsyncStorage** (gelecekte opsiyonel backend)
- Bildirim: **expo-notifications** (yerel bildirimler)
- Charts: **victory-native** veya **react-native-svg-charts**
- Dil: **TR** (i18n altyapısı hazır; EN kolay eklenebilir)
- Tema: **Light** (Dark tema için token'lar hazır)

### Özellikler (MVP):
✅ Onboarding & Setup (ilk kullanım)
✅ Takvim (ay görünümü, faz işaretleme, tahminler)
✅ Günlük (mood, semptom, not, öneri kartları)
✅ Raporlar (döngü istatistikleri, trendler, grafikler)
✅ Ayarlar (tercihler, bildirimler, veri export)
✅ Bilgilendirici içerik (faz bilgileri, ipuçları)
✅ Yerel bildirimler (hatırlatmalar)

### Özellikler (Future):
🔜 Backend sync (opsiyonel bulut yedekleme)
🔜 AI destekli tahminler (geçmiş verilerden öğrenme)
🔜 Partnerlık modu (partner ile paylaşım)
🔜 Sağlık uygulaması entegrasyonu (Google Fit)
🔜 Topluluk & forum özelliği

---

## 2) Bilimsel Temel & Menstrual Cycle Anatomy

### 2.1) Menstrual Cycle Fazları (4 Faz Modeli)

**Döngü Uzunluğu:** 21-35 gün (ortalama 28 gün)
**Adet Süresi:** 2-7 gün (ortalama 3-5 gün)

#### **Faz 1: Menstrual Phase (Adet Fazı)** 🌸
- **Süre:** Gün 1-5 (adet ilk günü = döngünün 1. günü)
- **Hormonlar:** Estrogen ve progesterone en düşük seviyede
- **Fizyoloji:** Uterus duvarının dökülmesi (endometrium)
- **Yaygın Semptomlar:**
  - Kramplar (uterus kasılmaları)
  - Yorgunluk & düşük enerji
  - Sırt/bel ağrısı
  - Baş ağrısı
  - Mood swings (hormon düşüşü)
  - Hassas/şişkin göğüsler
- **Öneriler:**
  - Demir içeren besinler (kan kaybı telafisi)
  - Sıcak kompres (kramp için)
  - Hafif egzersiz (yoga, yürüyüş)
  - Bol su tüketimi
  - Yeterli dinlenme

#### **Faz 2: Follicular Phase (Foliküler Faz)** 🌱
- **Süre:** Gün 1-13 (adet ilk gününden ovulasyona kadar)
- **Hormonlar:** Estrogen yükselişe geçer (FSH tetikler)
- **Fizyoloji:** Yumurtalıklarda folikül gelişimi, endometrium kalınlaşır
- **Yaygın Hisler:**
  - Artan enerji
  - İyi ruh hali (estrogen serotonin artırır)
  - Net düşünme & odaklanma
  - Sosyalleşme isteği
  - Cilt parlaklığı
- **Öneriler:**
  - Yüksek yoğunluklu egzersizler (enerji zirvede)
  - Yeni projeler başlatma (motivasyon yüksek)
  - Sosyal aktiviteler
  - Dengeli beslenme (folikül gelişimini destekle)

#### **Faz 3: Ovulation Phase (Ovulasyon Fazı)** 💜
- **Süre:** Gün 14 (±2 gün) — 24-36 saat
- **Hormonlar:** LH surge → yumurta serbest bırakılır
- **Fizyoloji:** Olgun yumurta foliküldən çıkar, 12-24 saat canlı kalır
- **Fertile Window:** Ovulasyondan **5 gün önce + ovulasyon günü + 1 gün sonra** (toplam ~6-7 gün)
- **Yaygın Belirtiler:**
  - Vajinal akıntı artışı (berrak, kaygan, yumurta beyazı kıvamı)
  - Hafif alt karın ağrısı (mittelschmerz) — tek taraflı
  - Artan libido
  - Vücut ısısı hafif artışı (0.5-1°C)
  - Enerji zirvesi
  - Gelişmiş koku alma
- **Öneriler:**
  - Hamilelik planlıyorsan: bu dönemde ilişki öneriliyor
  - Hamilelik planlamıyorsan: ekstra koruma
  - Bol su içme (akıntı için)
  - Hafif egzersiz

#### **Faz 4: Luteal Phase (Luteal Faz)** 🍂
- **Süre:** Gün 15-28 (ovulasyondan adet başına kadar)
- **Hormonlar:** Progesterone yükselir, estrogen dalgalı
- **Fizyoloji:** Corpus luteum progesterone salgılar (hamileliğe hazırlık)
- **Alt Fazlar:**
  - **Early Luteal (15-21):** Dengeli, enerjik
  - **Late Luteal / PMS (22-28):** Progesterone düşüşü → PMS semptomları

**Yaygın PMS Semptomları (Luteal Geç Dönem):**
- **Fiziksel:**
  - Göğüs hassasiyeti/şişliği
  - Şişkinlik (su tutma)
  - Kramplar (pre-adet)
  - Akne/cilt değişimleri
  - İştah artışı (özellikle tatlı/tuzlu isteği)
  - Baş ağrısı/migren
  - Konstipasyon/ishal
  - Yorgunluk

- **Duygusal (PMDD'de daha şiddetli):**
  - Mood swings (ani ruh hali değişimleri)
  - İrritabilite/öfke
  - Anksiyete/gerginlik
  - Üzüntü/ağlama
  - Sosyal çekilme
  - Konsantrasyon zorluğu
  - Uyku sorunları

**Öneriler (Luteal Faz):**
- Düşük yoğunluklu egzersiz (pilates, yoga)
- Magnezyum/B6 takviyeleri (kramp & PMS için)
- Karmaşık karbonhidratlar (serotonin için)
- Kafein/tuz azaltma (şişkinlik için)
- Self-care ritüelleri (banyo, meditasyon)
- Yeterli uyku (hormonal denge için)

---

### 2.2) Tahmin Algoritması (Bilimsel Temeller)

**Standart Tahmin (Varsayılan):**
```
Ovulasyon günü = Son adet başlangıcı + (Döngü süresi - 14)
Örnek: 28 günlük döngü → Ovulasyon gün 14'te
        32 günlük döngü → Ovulasyon gün 18'de
```

**Fertile Window:**
```
Başlangıç = Ovulasyon günü - 5
Bitiş = Ovulasyon günü + 1
(Sperm 5 gün, yumurta 24 saat yaşar)
```

**Tahmin Güvenilirliği:**
- İlk 3 döngü: %60-70 doğruluk (veri yetersiz)
- 6+ döngü sonra: %85+ doğruluk (kişiselleştirilmiş ortalamalar)
- Stresdeki değişiklikler, hastalık, ilaçlar tahmini etkiler → **disclaimer göster**

**Gelişmiş Algoritma (Future):**
- Son 6 döngünün ortalaması
- Semptom korelasyonu (örn: ovulasyon ağrısı varsa daha kesin tahmin)
- Makine öğrenmesi ile kişiselleştirme

---

### 2.3) Semptom Kategorileri & Tanımları

**Ağrılar:**
- `cramp` — Uterus kasılmaları (menstrual/PMS)
- `headache` — Baş ağrısı/migren (hormon dalgalanması)
- `backPain` — Sırt/bel ağrısı
- `jointPain` — Eklem ağrısı (NEW)

**Sindirim:**
- `bloating` — Şişkinlik (su tutma)
- `nausea` — Bulantı (NEW)
- `constipation` — Kabızlık (NEW)
- `diarrhea` — İshal (prostaglandin etkisi) (NEW)

**Cilt & Fiziksel:**
- `acne` — Akne/sivilce (androgen artışı)
- `breastTenderness` — Göğüs hassasiyeti/şişliği
- `discharge` — Vajinal akıntı (ovulasyon belirtisi)

**Enerji & Uyku:**
- `lowEnergy` — Düşük enerji/yorgunluk
- `sleepy` — Uykulu hissetme
- `insomnia` — Uyku sorunu (NEW)

**İştah:**
- `appetite` — Artan iştah
- `cravings` — Özel besin istekleri (tatlı/tuzlu) (NEW)

**Duygusal (PMS/PMDD):**
- `anxious` — Anksiyete/gerginlik (NEW)
- `irritable` — Sinirlilik (NEW)
- `focusIssues` — Odaklanma zorluğu (NEW)

---

### 2.4) Mood Kategorileri (Genişletilmiş)

```ts
export type Mood = 
  | 'ecstatic'     // 🤩 Muhteşem
  | 'happy'        // 😊 Mutlu
  | 'calm'         // 😌 Sakin (NEW)
  | 'neutral'      // 😐 Normal
  | 'sad'          // 😢 Üzgün
  | 'angry'        // 😠 Öfkeli
  | 'anxious'      // 😰 Endişeli (NEW)
  | 'tired'        // 😴 Yorgun
  | 'irritable';   // 😤 Sinirli (NEW)
```

---

## 3) Ürün Akışı (User Flow)

```
First Launch:
├─ Onboarding (3 ekran)
│  ├─ Ekran 1: "Takibi kolay 🌸" (Takvim görseli)
│  ├─ Ekran 2: "Küçük hatırlatmalar 💕" (Bildirim görseli)
│  └─ Ekran 3: "Verilerin sende 🔒" (Güvenlik görseli)
│
├─ Setup Wizard (4 ekran)
│  ├─ Ekran 1: Son adet başlangıcı (date picker, ZORUNLU)
│  ├─ Ekran 2: Ortalama adet süresi (slider 2-10, default 5)
│  ├─ Ekran 3: Ortalama döngü süresi (slider 21-35, default 28)
│  └─ Ekran 4: Bildirim tercihleri (opsiyon, atlanabilir)
│
└─ Main App (Bottom Tabs)
   ├─ 📅 Takvim (Home)
   ├─ 📖 Günlük
   ├─ 📊 Raporlar
   └─ ⚙️ Ayarlar

Repeated Usage:
└─ Direkt Tabs → Takvim
```

---

## 4) Ekran Detayları

### 4.1) Takvim Ekranı (Home)

**Layout:**
```
┌─────────────────────────────┐
│  Header: Eylül 2025  [<][>] │
├─────────────────────────────┤
│  Legend Bar (chip'ler)      │
│  🌸 Adet • 🌷 Tahmini       │
│  🌱 Fertil • 💜 Ovulasyon   │
│  🌟 Bugün                   │
├─────────────────────────────┤
│                             │
│   Calendar Grid (7x5)       │
│   [Hücre işaretleme]        │
│                             │
├─────────────────────────────┤
│  Hızlı Aksiyonlar (2 FAB)   │
│  [Adet Başlat/Bitti]        │
│  [Günlük Kaydet]            │
├─────────────────────────────┤
│  Faz Bilgi Kartı            │
│  "Foliküler Faz - Gün 8/13" │
│  [Mini bilgi metni]         │
├─────────────────────────────┤
│  Motivasyon Kartı           │
│  "Enerjin yüksek! 💪"       │
└─────────────────────────────┘
```

**Hücre İşaretleme Mantığı:**

| Durum | Arka Plan | İkon | Açıklama |
|-------|-----------|------|----------|
| 🌸 Adet (gerçek) | `#FF7C9D` | 🌸 (sağ üst) | `periods[]`'da kayıt var |
| 🌷 Tahmini adet | `#FFD6E0` | - | Tahmin algoritması |
| 🌱 Fertil | `#D6FFF6` | 🌱 (sağ üst) | Ovulasyon ±5 gün |
| 💜 Ovulasyon | `#CBA8FF` | 💜 (sağ üst) | Tahmin edilen ovulasyon günü |
| 🌟 Bugün | Border: mint double | 🌟 (küçük, üst) | Aktif gün |
| Geçmiş günlük | Hafif gri border | - | `logs[]`'da kayıt var |

**İkon Yerleşimi:**
- Hücre boyutu: 44-48dp
- Gün numarası: ortada, 18px, semibold
- İkon: sağ üst köşe, 14px (numarayı kapatmaz)
- Padding: 4dp

**Hızlı Aksiyonlar:**
1. **Adet Başlat/Bitti:**
   - Eğer aktif adet yoksa → "Adet Başlat" butonu
   - Tıkla → Bugünün tarihi `periods[]`'a eklenir
   - Eğer aktif adet varsa → "Adet Bitti" butonu
   - Tıkla → Son `PeriodSpan`'in `end` alanı doldurulur
   - Animation: butona tıklama → hücre renginde pulse efekti

2. **Günlük Kaydet:**
   - Navigation → DailyLog ekranı (bugünün tarihi preset)
   - Floating Action Button (FAB), primary gradient

**Faz Bilgi Kartı:**
- Dinamik içerik: hangi fazdaysa ona göre
- Örnek: "Foliküler Faz - Gün 8/13"
- Alt metin: "Enerjin yükseliyor! Yeni şeyler denemek için harika zaman."
- Tıklanabilir → Modal ile detaylı faz açıklaması

**Motivasyon Kartı:**
- Rastgele pozitif mesajlar (faz bazlı)
- Örnek (Foliküler): "Bugün harika fırsatlar var! 🌟"
- Örnek (Luteal): "Kendine nazik ol, dinlenmeye ihtiyacın var 🌸"

---

### 4.2) Günlük Ekranı (Daily Log)

**Layout:**
```
┌─────────────────────────────┐
│  Header: Bugün - 15 Eylül   │
│  [Tarih seçici]             │
├─────────────────────────────┤
│  Ruh Halim 💭               │
│  [Emoji row - tek seçim]    │
│  😊 😢 😠 😌 😴 😰 ...      │
├─────────────────────────────┤
│  Semptomlarım 🩺             │
│  [Chip grid - çoklu seçim]  │
│  [Kramp] [Baş Ağrısı]       │
│  [Şişkinlik] [Akne] ...     │
├─────────────────────────────┤
│  Notlarım 📝                │
│  [TextArea, 500 char]       │
├─────────────────────────────┤
│  💡 Öneriler (dinamik)      │
│  [Seçilen semptomlara göre] │
│  "Kramplar için sıcak       │
│   kompres dene"             │
├─────────────────────────────┤
│  [Kaydet Butonu]            │
└─────────────────────────────┘
```

**Mood Seçimi:**
- Emoji'ler yatay scroll (tek seçim)
- Seçili emoji: border + scale animasyonu
- 9 emoji seçeneği

**Semptom Grid:**
- Chip'ler wrap ile yerleşir
- Çoklu seçim (toggle)
- Kategorize (ağrılar, sindirim, cilt, vb.)
- Her semptom için tooltip (kısa açıklama)

**Dinamik Öneri Kartı:**
- `tipsService.getSuggestions(selectedSymptoms)`
- En az 3 öneri göster
- Kaynak belirt: "Kaynak: Tıbbi literatür"
- Örnek öneriler:
  - Kramp → "Sıcak kompres, hafif egzersiz, magnezyum"
  - Baş ağrısı → "Su tüketimi, karanlık ortam, kafein azaltma"
  - Şişkinlik → "Tuz azaltma, bol su, hafif yürüyüş"
  - Akne → "Temiz yastık kılıfı, yüz temizliği, hormonal döngü normal"

**Kaydet Butonu:**
- Validation: en az mood VEYA semptom VEYA not gerekli
- Success: Snackbar + hafif confetti animasyonu
- `logs[]` güncellenir

---

### 4.3) Raporlar Ekranı

**Layout:**
```
┌─────────────────────────────┐
│  Header: İstatistiklerim    │
├─────────────────────────────┤
│  📊 Özet Kartları           │
│  ┌───────┐ ┌───────┐        │
│  │Ort.   │ │Ort.   │        │
│  │Döngü  │ │Adet   │        │
│  │28 gün │ │5 gün  │        │
│  └───────┘ └───────┘        │
├─────────────────────────────┤
│  📈 Döngü Geçmişi           │
│  [Bar chart - son 6 döngü]  │
├─────────────────────────────┤
│  🩺 En Sık Semptomlar       │
│  [Horizontal bar chart]     │
│  Kramp ████████ 80%         │
│  Şişkin ██████ 60%          │
├─────────────────────────────┤
│  💭 Ruh Hali Trendi         │
│  [Line chart - son 3 ay]    │
├─────────────────────────────┤
│  🎯 Tahmin Doğruluğu        │
│  "Son 3 döngüde %87"        │
└─────────────────────────────┘
```

**Hesaplamalar:**
- Ortalama döngü: `periods[]`'dan gerçek verilerle
- Ortalama adet: `periods[]`'da `end` olan kayıtlardan
- Semptom frekansı: `logs[]`'dan
- Mood trendi: `logs[]`'dan mood'ları grupla

**Empty State:**
- "Henüz yeterli veri yok"
- "En az 2 döngü kaydı gerekli"
- Sevimli illüstrasyon

---

### 4.4) Ayarlar Ekranı

**Bölümler:**

1. **Döngü Tercihleri**
   - Ortalama adet süresi (slider)
   - Ortalama döngü süresi (slider)
   - Son adet başlangıcı (tarih seçici)

2. **Bildirimler**
   - Bildirimleri aç/kapat (toggle)
   - Bildirim sıklığı (low/balanced/high)
   - Hatırlatma saati seçici
   - Yaklaşan adet bildirimi (2 gün önce)

3. **Görünüm**
   - Tema (Light/Dark) — Dark hazır olacak
   - Dil (TR/EN) — i18n altyapısı

4. **Gizlilik & Güvenlik**
   - "Verileriniz cihazınızda güvende" bilgi kartı
   - PIN kilidi (opsiyonel) — future
   - Biyometrik kilit (opsiyonel) — future

5. **Veri Yönetimi**
   - Verileri dışa aktar (JSON)
   - Verileri içe aktar (JSON)
   - Tüm verileri sil (onay modalı)

6. **Hakkında**
   - Uygulama versiyonu
   - Tıbbi açıklama: "Bu uygulama tıbbi tavsiye yerine geçmez"
   - Gizlilik politikası (metin)
   - İletişim: [email]

---

## 5) UI / Tasarım Sistemi (Design System)

### 5.1) Renkler (Light Theme)

**Ana Renkler:**
```ts
const colors = {
  // Primary (Ana pembe)
  primary: '#E66FD2',
  primary600: '#D052BE',
  primary200: '#F6DDF2',
  
  // Accent
  lilac: '#B59CFF',
  mint: '#7AD1C5',
  
  // Status
  danger: '#FF5A76',
  warning: '#FFA726',
  success: '#66D9A6',
  info: '#6F9BFF',
  
  // Neutrals
  ink: '#232326',
  inkSoft: '#6A6A6F',
  inkLight: '#A0A0A5',
  bg: '#FFFFFF',
  bgSoft: '#F7F7FA',
  bgGray: '#E8E8EC',
  
  // Cycle Colors
  menstrualRed: '#FF7C9D',
  predictedPink: '#FFD6E0',
  fertileGreen: '#D6FFF6',
  ovulationPurple: '#CBA8FF',
  todayMint: '#7AD1C5',
};
```

**Gradientler:**
```ts
const gradients = {
  primary: ['#FF9AD2', '#C78BFF', '#9E6BFF'], // Button gradient
  card: ['#FFFFFF', '#F9F9FF'], // Subtle card gradient
  header: ['#E66FD2', '#B59CFF'], // Header gradient
};
```

### 5.2) Tipografi

```ts
const typography = {
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  tiny: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
};
```

### 5.3) Spacing & Layout

```ts
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const borderRadius = {
  card: 16,
  button: 24,
  chip: 20,
  fab: 28,
  modal: 20,
};

const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
};
```

### 5.4) Bileşen Kuralları

#### **Butonlar:**
```ts
// Primary Button
- Gradient background (#FF9AD2 → #C78BFF → #9E6BFF)
- Border radius: 24dp
- Min height: 48dp
- Padding: 12dp horizontal
- Text: 16px semibold, white
- Icon + Text spacing: 8dp
- Press state: opacity 0.8 + scale 0.98
- Disabled: opacity 0.5

// Secondary Button
- Background: transparent
- Border: 2px primary color
- Text: primary color

// Text Button
- Background: transparent
- Text: primary color
- Underline on press
```

#### **Kartlar:**
```ts
- Border radius: 16dp
- Padding: 16dp
- Background: white (or bgSoft #F7F7FA)
- Shadow: card shadow
- Optional: subtle gradient overlay
```

#### **Chip (Tag):**
```ts
- Border radius: 20dp
- Padding: 8dp x 16dp
- Min height: 36dp
- Unselected: bgGray background, inkSoft text
- Selected: primary gradient background, white text
- Icon: 16px (if any)
```

#### **FAB (Floating Action Button):**
```ts
- Size: 56x56dp
- Border radius: 28dp
- Gradient background
- Icon: 24px white
- Shadow: fab shadow
- Position: bottom-right, 16dp margin
```

#### **Bottom Tab Bar:**
```ts
- Height: 64dp
- Background: white
- Border top: 1px bgGray
- Icons: 24px
- Active: gradient color + scale 1.1
- Inactive: inkLight
- Label: 11px, below icon
```

#### **Calendar Cell:**
```ts
- Size: 44-48dp (responsive)
- Day number: center, 18px semibold
- Background: varies (menstrual, fertile, etc.)
- Icon: top-right corner, 14px
- Border (today): 2px mint double
- Padding: 4dp
```

---

## 6) Veri Modeli (TypeScript)

```ts
// /src/types.ts

// ===== Mood & Symptoms =====
export type Mood = 
  | 'ecstatic'     // 🤩 Muhteşem
  | 'happy'        // 😊 Mutlu
  | 'calm'         // 😌 Sakin
  | 'neutral'      // 😐 Normal
  | 'sad'          // 😢 Üzgün
  | 'angry'        // 😠 Öfkeli
  | 'anxious'      // 😰 Endişeli
  | 'tired'        // 😴 Yorgun
  | 'irritable';   // 😤 Sinirli

export type Symptom =
  // Ağrılar
  | 'cramp'             // Kramp
  | 'headache'          // Baş ağrısı
  | 'backPain'          // Sırt ağrısı
  | 'jointPain'         // Eklem ağrısı
  
  // Sindirim
  | 'bloating'          // Şişkinlik
  | 'nausea'            // Bulantı
  | 'constipation'      // Kabızlık
  | 'diarrhea'          // İshal
  
  // Cilt & Fiziksel
  | 'acne'              // Akne
  | 'breastTenderness'  // Göğüs hassasiyeti
  | 'discharge'         // Akıntı (ovulasyon belirtisi)
  
  // Enerji & Uyku
  | 'lowEnergy'         // Düşük enerji
  | 'sleepy'            // Uykulu
  | 'insomnia'          // Uyku sorunu
  
  // İştah
  | 'appetite'          // Artan iştah
  | 'cravings'          // Özel besin istekleri
  
  // Duygusal
  | 'anxious'           // Anksiyete
  | 'irritable'         // Sinirlilik
  | 'focusIssues';      // Odaklanma zorluğu

// ===== Cycle Phase =====
export type CyclePhase = 
  | 'menstrual'   // Adet fazı (gün 1-5)
  | 'follicular'  // Foliküler faz (gün 1-13)
  | 'ovulation'   // Ovulasyon (gün 14±2)
  | 'luteal';     // Luteal faz (gün 15-28)

// ===== Core Data Models =====
export interface CyclePrefs {
  avgPeriodDays: number;      // Ortalama adet süresi (default: 5)
  avgCycleDays: number;       // Ortalama döngü süresi (default: 28)
  lastPeriodStart: string;    // Son adet başlangıcı (ISO: yyyy-mm-dd)
}

export interface DailyLog {
  id: string;                 // uuid
  date: string;               // ISO date (yyyy-mm-dd)
  mood?: Mood;                // Ruh hali
  symptoms: Symptom[];        // Semptomlar (çoklu)
  note?: string;              // Kullanıcı notu (max 500 char)
  createdAt: string;          // ISO timestamp
  updatedAt?: string;         // ISO timestamp
}

export interface PeriodSpan {
  id: string;                 // uuid
  start: string;              // Adet başlangıcı (ISO)
  end?: string;               // Adet bitişi (ISO) - null ise devam ediyor
  cycleLengthDays?: number;   // Hesaplanan döngü uzunluğu (bir sonraki period'a kadar)
  periodLengthDays?: number;  // Hesaplanan adet süresi
}

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'low' | 'balanced' | 'high';  // low: 1/gün, balanced: 2/gün, high: 3/gün
  reminderTime: string;                     // HH:mm formatında (örn: "20:00")
  upcomingPeriod: boolean;                  // Yaklaşan adet bildirimi
  waterReminder: boolean;                   // Su içme hatırlatması
  dailyLogReminder: boolean;                // Günlük kayıt hatırlatması
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  pinLock: boolean;
  pinCode?: string;                         // Hashed (future)
  biometricEnabled: boolean;                // Future
}

export interface AppState {
  prefs: CyclePrefs;
  logs: DailyLog[];
  periods: PeriodSpan[];
  notifications: NotificationSettings;
  settings: AppSettings;
  onboardingCompleted: boolean;
  setupCompleted: boolean;
}

// ===== Prediction Types =====
export interface DayPrediction {
  date: string;                             // ISO date
  phase: CyclePhase;
  isMenstrual: boolean;                     // Adet günü mü? (actual)
  isPredictedMenstrual: boolean;            // Tahmini adet günü
  isFertile: boolean;                       // Fertil pencere içinde mi?
  isOvulation: boolean;                     // Ovulasyon günü mü?
  isToday: boolean;
  hasLog: boolean;                          // Bu gün için log var mı?
}

// ===== Tips & Content =====
export interface TipCard {
  id: string;
  symptom: Symptom;
  title: string;
  content: string;
  source?: string;                          // Kaynak belirtimi
}

export interface PhaseInfo {
  phase: CyclePhase;
  title: string;
  description: string;
  hormonInfo: string;
  commonSymptoms: Symptom[];
  tips: string[];
  dayRange: string;                         // Örn: "Gün 1-5"
}
```

---

## 7) Algoritmalar & Hesaplamalar

### 7.1) Tahmin Algoritması

```ts
// /src/services/prediction.ts

export interface PredictionInput {
  lastPeriodStart: string;    // ISO date
  avgCycleDays: number;
  avgPeriodDays: number;
  periods: PeriodSpan[];      // Geçmiş kayıtlar
}

export function predictCycle(
  input: PredictionInput,
  startDate: string,          // Tahmin başlangıcı (ay başı)
  endDate: string             // Tahmin bitişi (ay sonu)
): DayPrediction[] {
  
  const predictions: DayPrediction[] = [];
  const { lastPeriodStart, avgCycleDays, avgPeriodDays, periods } = input;
  
  // 1. Ovulasyon gününü hesapla
  const ovulationDay = calculateOvulationDay(lastPeriodStart, avgCycleDays);
  
  // 2. Bir sonraki adet tahminini hesapla
  const nextPeriodStart = addDays(lastPeriodStart, avgCycleDays);
  
  // 3. Fertil pencereyi hesapla
  const fertileStart = addDays(ovulationDay, -5);
  const fertileEnd = addDays(ovulationDay, 1);
  
  // 4. Her gün için tahmin üret
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const prediction: DayPrediction = {
      date: currentDate,
      phase: determinePhase(currentDate, lastPeriodStart, avgCycleDays),
      isMenstrual: isActualPeriod(currentDate, periods),
      isPredictedMenstrual: isPredictedPeriod(
        currentDate,
        nextPeriodStart,
        avgPeriodDays
      ),
      isFertile: isInRange(currentDate, fertileStart, fertileEnd),
      isOvulation: isSameDay(currentDate, ovulationDay),
      isToday: isToday(currentDate),
      hasLog: checkHasLog(currentDate, logs),
    };
    
    predictions.push(prediction);
    currentDate = addDays(currentDate, 1);
  }
  
  return predictions;
}

// Ovulasyon günü = Son adet + (Döngü süresi - 14)
function calculateOvulationDay(lastPeriodStart: string, avgCycleDays: number): string {
  return addDays(lastPeriodStart, avgCycleDays - 14);
}

// Faz belirleme
function determinePhase(
  date: string,
  lastPeriodStart: string,
  avgCycleDays: number
): CyclePhase {
  const daysSinceStart = daysBetween(lastPeriodStart, date);
  const cycleDay = (daysSinceStart % avgCycleDays) + 1;
  
  if (cycleDay >= 1 && cycleDay <= 5) return 'menstrual';
  if (cycleDay >= 6 && cycleDay <= 13) return 'follicular';
  if (cycleDay >= 12 && cycleDay <= 16) return 'ovulation';  // ±2 gün
  return 'luteal';
}

// Gerçek adet kontrolü
function isActualPeriod(date: string, periods: PeriodSpan[]): boolean {
  return periods.some(period => {
    if (!period.end) {
      // Devam eden adet
      return date >= period.start;
    }
    return date >= period.start && date <= period.end;
  });
}
```

### 7.2) İstatistik Hesaplamaları

```ts
// /src/services/statistics.ts

export interface CycleStats {
  avgCycleLength: number;         // Ortalama döngü süresi
  avgPeriodLength: number;        // Ortalama adet süresi
  totalCycles: number;            // Toplam döngü sayısı
  predictionAccuracy: number;     // Tahmin doğruluğu (%)
  lastCycleLength?: number;       // Son döngü süresi
  cycleVariability: number;       // Döngü değişkenliği (std sapma)
}

export function calculateCycleStats(periods: PeriodSpan[]): CycleStats {
  const completedPeriods = periods.filter(p => p.end && p.cycleLengthDays);
  
  if (completedPeriods.length < 2) {
    return {
      avgCycleLength: 28,
      avgPeriodLength: 5,
      totalCycles: completedPeriods.length,
      predictionAccuracy: 0,
      cycleVariability: 0,
    };
  }
  
  // Ortalama döngü süresi
  const cycleLengths = completedPeriods.map(p => p.cycleLengthDays!);
  const avgCycleLength = mean(cycleLengths);
  
  // Ortalama adet süresi
  const periodLengths = completedPeriods.map(p => p.periodLengthDays!);
  const avgPeriodLength = mean(periodLengths);
  
  // Döngü değişkenliği
  const cycleVariability = standardDeviation(cycleLengths);
  
  // Tahmin doğruluğu (son 3 döngü)
  const predictionAccuracy = calculateAccuracy(
    completedPeriods.slice(-3),
    avgCycleLength
  );
  
  return {
    avgCycleLength: Math.round(avgCycleLength),
    avgPeriodLength: Math.round(avgPeriodLength),
    totalCycles: completedPeriods.length,
    predictionAccuracy,
    lastCycleLength: cycleLengths[cycleLengths.length - 1],
    cycleVariability,
  };
}

// Tahmin doğruluğu: gerçek vs tahmin farkı
function calculateAccuracy(
  recentPeriods: PeriodSpan[],
  avgCycleLength: number
): number {
  if (recentPeriods.length < 2) return 0;
  
  let totalError = 0;
  for (let i = 1; i < recentPeriods.length; i++) {
    const predicted = avgCycleLength;
    const actual = recentPeriods[i].cycleLengthDays!;
    const error = Math.abs(predicted - actual);
    totalError += error;
  }
  
  const avgError = totalError / (recentPeriods.length - 1);
  const accuracy = Math.max(0, 100 - (avgError / avgCycleLength) * 100);
  
  return Math.round(accuracy);
}

// Semptom frekansı
export function calculateSymptomFrequency(logs: DailyLog[]): Record<Symptom, number> {
  const frequency: Record<string, number> = {};
  
  logs.forEach(log => {
    log.symptoms.forEach(symptom => {
      frequency[symptom] = (frequency[symptom] || 0) + 1;
    });
  });
  
  // Yüzdeye çevir
  const total = logs.length;
  Object.keys(frequency).forEach(symptom => {
    frequency[symptom] = Math.round((frequency[symptom] / total) * 100);
  });
  
  return frequency as Record<Symptom, number>;
}

// Mood trendi
export interface MoodTrend {
  date: string;
  mood: Mood;
  moodScore: number;  // 1-9 arası (ecstatic=9, angry=1)
}

export function calculateMoodTrend(logs: DailyLog[]): MoodTrend[] {
  const moodScores: Record<Mood, number> = {
    ecstatic: 9,
    happy: 7,
    calm: 6,
    neutral: 5,
    tired: 4,
    sad: 3,
    anxious: 3,
    irritable: 2,
    angry: 1,
  };
  
  return logs
    .filter(log => log.mood)
    .map(log => ({
      date: log.date,
      mood: log.mood!,
      moodScore: moodScores[log.mood!],
    }));
}
```

### 7.3) Öneri Sistemi

```ts
// /src/services/tipsService.ts

export interface TipSuggestion {
  title: string;
  content: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
}

// Semptom bazlı öneriler (mock - future'da API)
export async function getSuggestions(
  symptoms: Symptom[]
): Promise<TipSuggestion[]> {
  
  const suggestions: TipSuggestion[] = [];
  
  // Öncelikli semptomlar
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
  
  if (symptoms.includes('bloating')) {
    suggestions.push({
      title: 'Şişkinliği azaltma ipuçları',
      content: 'Tuz tüketimini sınırlayın (su tutmaya neden olur). Bol su için (paradoksal ama su tutmayı azaltır). Hafif yürüyüş yapın (sindirimi destekler).',
      source: 'Tıbbi Literatür',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('acne')) {
    suggestions.push({
      title: 'Hormonal akne yönetimi',
      content: 'Yüzünüzü günde 2 kez hafif temizleyici ile yıkayın. Yastık kılıfınızı sık değiştirin. Yüzünüze dokunmamaya özen gösterin. Bu döngüsel bir durum ve normaldir.',
      source: 'Dermatoloji Kılavuzu',
      priority: 'low',
    });
  }
  
  if (symptoms.includes('lowEnergy') || symptoms.includes('tired')) {
    suggestions.push({
      title: 'Enerji seviyenizi artırın',
      content: 'Demir içeren besinler tüketin (kırmızı et, baklagiller, koyu yapraklı sebzeler). 7-9 saat uyuyun. Kısa power nap\'ler (20 dk) yardımcı olabilir.',
      source: 'Beslenme Rehberi',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('anxious') || symptoms.includes('irritable')) {
    suggestions.push({
      title: 'Duygusal dengeyi koruma',
      content: 'Derin nefes egzersizleri yapın (4-7-8 tekniği). Meditasyon veya yoga deneyin. Kendinize nazik olun - hormonal değişiklikler duygularınızı etkiliyor.',
      source: 'Psikoloji Kaynakları',
      priority: 'high',
    });
  }
  
  if (symptoms.includes('insomnia')) {
    suggestions.push({
      title: 'Uyku kalitenizi iyileştirin',
      content: 'Yatmadan 1 saat önce ekranlardan uzak durun. Oda sıcaklığını 18-20°C\'de tutun. Akşam kafein ve ağır yemeklerden kaçının.',
      source: 'Uyku Tıbbı',
      priority: 'medium',
    });
  }
  
  if (symptoms.includes('cravings') || symptoms.includes('appetite')) {
    suggestions.push({
      title: 'İştah değişikliklerini yönetin',
      content: 'Karmaşık karbonhidratlar tüketin (tam tahıllar, sebzeler). Küçük ve sık öğünler tercih edin. Tatlı isteği için meyve seçin.',
      source: 'Beslenme Rehberi',
      priority: 'low',
    });
  }
  
  // Genel öneriler (her zaman)
  if (suggestions.length < 3) {
    suggestions.push({
      title: 'Genel sağlık ipuçları',
      content: 'Bol su için (günde 2-3 litre). Düzenli hafif egzersiz yapın. Dengeli beslenin. Stres yönetimi tekniklerini deneyin.',
      source: 'Genel Sağlık',
      priority: 'low',
    });
  }
  
  // Priority\'ye göre sırala
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  }).slice(0, 3);  // En fazla 3 öneri göster
}

// Faz bazlı motivasyon mesajları
export function getPhaseMotivation(phase: CyclePhase, cycleDay: number): string {
  const motivations: Record<CyclePhase, string[]> = {
    menstrual: [
      'Kendine nazik ol, dinlenmeye ihtiyacın var 🌸',
      'Yavaşlamak cesaret gerektirir, bugün izin ver kendine 💕',
      'Vücudun yenileniyor, bu güçlü bir süreç 🌺',
    ],
    follicular: [
      'Enerjin yükseliyor! Yeni şeyler denemek için harika zaman 🌱',
      'Bugün harika fırsatlar var, kapıları aç! 🌟',
      'Yaratıcılığın zirvede, fikirlerini gerçekleştir! ✨',
    ],
    ovulation: [
      'Enerjin zirvede! Sosyalleşmek için mükemmel gün 💜',
      'Kendini harika hissediyorsun ve öylesin! 🌟',
      'İletişim yeteneğin bugün çok güçlü 💬',
    ],
    luteal: [
      'Self-care zamanı! Kendine özel vakit ayır 🛀',
      'Yavaş ve sakin, bugün acele etmene gerek yok 🌙',
      'Sezgilerin güçlü, içsel sesini dinle 🔮',
    ],
  };
  
  const messages = motivations[phase];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Faz bilgilendirme içeriği
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
      commonSymptoms: [],  // Genelde semptom yok, enerji yüksek
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
```

---

## 8) Bildirim Sistemi

```ts
// /src/services/notificationService.ts

import * as Notifications from 'expo-notifications';
import { NotificationSettings } from '../types';

// Bildirim izni kontrolü
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

// Bildirimleri planla
export async function scheduleNotifications(
  settings: NotificationSettings,
  nextPeriodDate: string
): Promise<void> {
  // Önce mevcut bildirimleri iptal et
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  if (!settings.enabled) return;
  
  const [hour, minute] = settings.reminderTime.split(':').map(Number);
  
  // 1. Günlük log hatırlatması
  if (settings.dailyLogReminder) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Günlüğünü kaydetmeyi unutma! 📖',
        body: 'Bugün nasıl hissettiğini kaydet, kendini daha iyi tanı.',
        data: { type: 'daily_log' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }
  
  // 2. Su içme hatırlatması
  if (settings.waterReminder && settings.frequency !== 'low') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Su içme zamanı! 💧',
        body: 'Hidrasyon sağlığın için çok önemli.',
        data: { type: 'water' },
      },
      trigger: {
        hour: 14,
        minute: 0,
        repeats: true,
      },
    });
  }
  
  // 3. Yaklaşan adet bildirimi (2 gün önce)
  if (settings.upcomingPeriod && nextPeriodDate) {
    const notificationDate = new Date(nextPeriodDate);
    notificationDate.setDate(notificationDate.getDate() - 2);
    notificationDate.setHours(hour, minute, 0, 0);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Adet dönemin yaklaşıyor 🌸',
        body: '2 gün içinde başlayabilir. Hazırlıklı ol!',
        data: { type: 'upcoming_period', date: nextPeriodDate },
      },
      trigger: notificationDate,
    });
  }
  
  // 4. Frekansa göre ekstra hatırlatmalar
  if (settings.frequency === 'high') {
    // Sabah motivasyonu
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Günaydın! 🌞',
        body: 'Bugün harika bir gün olacak!',
        data: { type: 'morning_motivation' },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }
}

// Bildirim handler (uygulama açıkken)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

---

## 9) Mimari & Klasör Yapısı

```
/CycleMate
├── /assets
│   ├── /icons                    # PNG/SVG icon'lar
│   ├── /lottie                   # Animasyonlar
│   └── /illustrations            # Onboarding görselleri
│
├── /src
│   ├── /components               # Reusable UI components
│   │   ├── /common
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── FAB.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Snackbar.tsx
│   │   ├── /calendar
│   │   │   ├── Calendar.tsx      # Ana takvim komponenti
│   │   │   ├── CalendarCell.tsx  # Tek hücre
│   │   │   ├── CalendarHeader.tsx
│   │   │   └── Legend.tsx        # Renk açıklama çubuğu
│   │   ├── /daily-log
│   │   │   ├── MoodSelector.tsx  # Emoji row
│   │   │   ├── SymptomGrid.tsx   # Semptom chip grid
│   │   │   └── TipCard.tsx       # Öneri kartı
│   │   └── /reports
│   │       ├── StatCard.tsx      # İstatistik kartı
│   │       ├── CycleChart.tsx    # Döngü grafiği
│   │       └── SymptomChart.tsx  # Semptom grafiği
│   │
│   ├── /screens                  # Ekranlar
│   │   ├── /onboarding
│   │   │   ├── OnboardingScreen1.tsx
│   │   │   ├── OnboardingScreen2.tsx
│   │   │   └── OnboardingScreen3.tsx
│   │   ├── /setup
│   │   │   ├── SetupScreen1.tsx  # Son adet tarihi
│   │   │   ├── SetupScreen2.tsx  # Adet süresi
│   │   │   ├── SetupScreen3.tsx  # Döngü süresi
│   │   │   └── SetupScreen4.tsx  # Bildirimler (opsiyonel)
│   │   ├── CalendarScreen.tsx    # Ana takvim
│   │   ├── DailyLogScreen.tsx    # Günlük kayıt
│   │   ├── ReportsScreen.tsx     # Raporlar
│   │   └── SettingsScreen.tsx    # Ayarlar
│   │
│   ├── /navigation               # Navigation yapısı
│   │   ├── RootStack.tsx         # Ana stack (onboarding/setup/tabs)
│   │   └── Tabs.tsx              # Bottom tabs
│   │
│   ├── /store                    # Redux state management
│   │   ├── index.ts              # Store yapılandırması
│   │   ├── prefsSlice.ts         # CyclePrefs state
│   │   ├── logsSlice.ts          # DailyLog state
│   │   ├── periodsSlice.ts       # PeriodSpan state
│   │   ├── notificationsSlice.ts # Notification settings
│   │   ├── settingsSlice.ts      # App settings
│   │   └── uiSlice.ts            # UI state (loading, modals)
│   │
│   ├── /services                 # Business logic & external services
│   │   ├── prediction.ts         # Tahmin algoritmaları
│   │   ├── statistics.ts         # İstatistik hesaplamaları
│   │   ├── tipsService.ts        # Öneri sistemi
│   │   ├── notificationService.ts # Bildirim yönetimi
│   │   ├── storage.ts            # AsyncStorage helpers
│   │   └── export.ts             # Veri export/import
│   │
│   ├── /theme                    # Design system
│   │   ├── tokens.ts             # Renkler, spacing, shadows
│   │   ├── typography.ts         # Font stilleri
│   │   └── ThemeProvider.tsx     # Theme context
│   │
│   ├── /utils                    # Utility functions
│   │   ├── date.ts               # Tarih işlemleri
│   │   ├── id.ts                 # UUID generator
│   │   ├── validation.ts         # Form validation
│   │   └── localization.ts       # i18n helpers
│   │
│   ├── /locales                  # i18n translations
│   │   ├── tr.json
│   │   └── en.json
│   │
│   ├── types.ts                  # Global TypeScript types
│   ├── constants.ts              # App constants
│   └── App.tsx                   # Root component
│
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── README.md
```

---

## 10) MASTER TASK PLAN (Cursor için sıralı uygulama)

> **ÖNEMLI:** Her task "Done" olduğunda app **çalışır halde** kalmalı. Her task sonunda kabul kriterleri kontrol edilmeli.

---

### **Task 0 — Proje Kurulumu & Temel Yapı**

**Aksiyonlar:**
1. Expo projesi oluştur (TypeScript template)
   ```bash
   npx create-expo-app CycleMate --template expo-template-blank-typescript
   ```

2. Bağımlılıkları yükle:
   ```bash
   npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   npm install @reduxjs/toolkit react-redux redux-persist
   npm install @react-native-async-storage/async-storage
   npm install expo-notifications
   npm install victory-native react-native-svg
   npm install date-fns uuid
   npm install react-native-calendars
   ```

3. Klasör yapısını oluştur (yukarıdaki mimari)

4. Theme Provider ve token'ları kur
   - `/src/theme/tokens.ts` → Renk paleti, spacing, typography
   - `/src/theme/ThemeProvider.tsx` → Context API

5. Redux store'u yapılandır
   - `/src/store/index.ts` → configureStore + persistor
   - Boş slice'lar oluştur (sonraki tasklarda doldurulacak)

6. Basit navigation iskeletini kur
   - `RootStack` (boş Onboarding → Tabs)
   - `Tabs` (4 boş ekran: Calendar, DailyLog, Reports, Settings)

**Kabul Kriterleri:**
- [x] `npx expo start` çalışıyor
- [x] Alt bar (tabs) görünür, 4 sekme var
- [x] Theme token'ları erişilebilir
- [x] Redux devtools bağlanıyor

---

### **Task 1 — Onboarding & Setup Akışı**

**Aksiyonlar:**

**1.1 Onboarding (3 ekran):**
- Ekran 1: "Takibi kolay 🌸" + takvim illustrasyonu
- Ekran 2: "Küçük hatırlatmalar 💕" + bildirim illustrasyonu
- Ekran 3: "Verilerin sende 🔒" + güvenlik illustrasyonu
- "İleri" ve "Atla" butonları
- Swipe gesture destekli

**1.2 Setup Wizard (4 ekran):**
- **Setup1:** Son adet başlangıcı
  - Date picker (react-native-calendars veya Expo DateTimePicker)
  - Zorunlu alan, "İleri" butonu disabled olmalı (tarih seçilene kadar)
  
- **Setup2:** Ortalama adet süresi
  - Slider (2-10 gün, default 5)
  - Görsel feedback (seçilen değer büyük)
  
- **Setup3:** Ortalama döngü süresi
  - Slider (21-35 gün, default 28)
  - Bilgilendirme metni: "Çoğu kadında 28 gün civarındadır"
  
- **Setup4:** Bildirim tercihleri (opsiyonel, atlanabilir)
  - Toggle: Bildirimleri aç/kapat
  - Sıklık seçici (low/balanced/high)
  - "Atla" ve "Bitir" butonları

**1.3 Akış kontrolü:**
- `AsyncStorage` → `onboardingCompleted: boolean`, `setupCompleted: boolean`
- İlk açılış: Onboarding → Setup → Tabs
- Sonraki açılışlar: direkt Tabs

**1.4 Redux Integration:**
- `prefsSlice` → `avgPeriodDays`, `avgCycleDays`, `lastPeriodStart`
- `settingsSlice` → `onboardingCompleted`, `setupCompleted`
- `notificationsSlice` → settings

**Kabul Kriterleri:**
- [x] İlk açılış → Onboarding → Setup → Tabs akışı çalışır
- [x] Setup'ta tüm değerler Redux'a kaydedilir
- [x] Uygulama kapatılıp açıldığında direkt Tabs açılır
- [x] UI tutarlı (button, card, spacing tokens)

---

### **Task 2 — Takvim Ekranı (Core Feature)**

**Aksiyonlar:**

**2.1 Calendar Component:**
- Ay görünümü (7 sütun x 5-6 satır)
- Header: "Eylül 2025" + sol/sağ ok (ay değiştirme)
- Hücre yapısı:
  ```tsx
  <CalendarCell
    date="2025-09-15"
    dayNumber={15}
    prediction={dayPrediction}
    hasLog={true}
    isToday={true}
  />
  ```

**2.2 CalendarCell Component:**
- Boyut: 44-48dp responsive
- Gün numarası: ortada, 18px semibold
- Arka plan rengi: `prediction` prop'una göre
- İkon: sağ üst köşe, 14px (🌸/🌱/💜)
- Bugün: çift mint border + 🌟 ikon
- Geçmiş günlük: hafif gri border
- Press: navigation → DailyLog (o gün preset)

**2.3 Legend Component:**
- Horizontal scroll chip bar
- 5 chip: 🌸 Adet • 🌷 Tahmini • 🌱 Fertil • 💜 Ovulasyon • 🌟 Bugün
- Her chip: ikon + text + arka plan rengi

**2.4 Prediction Integration:**
- `/src/services/prediction.ts` → `predictCycle()` fonksiyonu
- Redux'tan `prefs` ve `periods` al
- Her ay render'ında tahmin üret
- Hücrelere `DayPrediction` objesi prop olarak geç

**2.5 Hızlı Aksiyonlar (FAB'lar):**
- **Adet Başlat/Bitti:**
  - Bottom-right konumda FAB
  - Aktif adet yoksa → "Adet Başlat"
  - Aktif adet varsa → "Adet Bitti"
  - Tıklama → `periodsSlice` güncelle
  - Animation: pulse efekti

- **Günlük Kaydet:**
  - FAB, FAB'ın üzerinde (stacked)
  - Navigation → DailyLogScreen (bugün preset)

**2.6 Bilgi Kartları:**
- **Faz Bilgi Kartı:**
  - Dinamik içerik: `getPhaseInfo(currentPhase)`
  - "Foliküler Faz - Gün 8/13"
  - Kısa açıklama metni
  - Tıklanabilir → Modal (detaylı faz bilgisi)

- **Motivasyon Kartı:**
  - `getPhaseMotivation(phase, cycleDay)`
  - Rastgele pozitif mesaj
  - Faz bazlı özelleştirilmiş

**Kabul Kriterleri:**
- [x] Takvim aylar arası geçiş yapılabilir
- [x] Hücreler doğru işaretlenir (renk + ikon)
- [x] Legend birebir uyumlu
- [x] "Adet Başlat" → `periods[]` günceller, UI yansır
- [x] "Adet Bitti" → `PeriodSpan.end` doldurulur
- [x] Hücreye tıklama → DailyLog'a gider (tarih preset)
- [x] Faz bilgi kartı doğru içeriği gösterir
- [x] Tüm UI tasarım token'larına uygun

---

### **Task 3 — Günlük Kayıt Ekranı (Daily Log)**

**Aksiyonlar:**

**3.1 Screen Layout:**
- Header: Tarih gösterimi + date picker
- Scroll view (içerik uzun olabilir)
- Sections: Mood → Semptomlar → Notlar → Öneriler → Kaydet

**3.2 Mood Selector:**
- Horizontal scroll row
- 9 emoji seçeneği:
  ```
  🤩 Muhteşem
  😊 Mutlu
  😌 Sakin
  😐 Normal
  😢 Üzgün
  😠 Öfkeli
  😰 Endişeli
  😴 Yorgun
  😤 Sinirli
  ```
- Tek seçim (radio behavior)
- Seçili: border + scale 1.15 animasyonu

**3.3 Symptom Grid:**
- Chip grid (wrap layout)
- Çoklu seçim (toggle behavior)
- 18 semptom kategorisi (types.ts'deki tam liste)
- Seçili chip: gradient background + white text
- Seçili olmayan: bgGray + inkSoft text
- Her chip için tooltip (uzun basma → açıklama)

**3.4 Notes Section:**
- TextArea (multiline input)
- Max 500 karakter
- Karakter sayacı (alt sağ)
- Placeholder: "Bugün nasıl hissettin? Not ekle..."

**3.5 Dinamik Öneri Kartı:**
- `tipsService.getSuggestions(selectedSymptoms)` çağır
- Loading state (skeleton)
- 3 öneri kartı render et:
  ```tsx
  <TipCard
    title={tip.title}
    content={tip.content}
    source={tip.source}
    priority={tip.priority}
  />
  ```
- Öneri yoksa: "Semptom seç, sana özel öneriler görelim"

**3.6 Kaydet Butonu:**
- Validation:
  - En az mood VEYA semptom VEYA not gerekli
  - Yoksa: disabled state
- Success flow:
  - `logsSlice` → `addLog()` action
  - Snackbar: "Günlük kaydedildi! ✨"
  - Hafif confetti animasyonu (optional)
  - Navigation back → Calendar

**Kabul Kriterleri:**
- [x] Mood seçimi persist edilir
- [x] Semptomlar çoklu seçilebilir, persist edilir
- [x] Not alanı 500 char sınırlı
- [x] Seçilen semptomlara göre öneri kartı render edilir
- [x] "Kaydet" → Redux günceller, Takvim'e dön
- [x] Kaydedilen günlük Takvim'de gri border ile işaretlenir
- [x] UI tutarlı (button, chip, card stilleri)

---

### **Task 4 — Raporlar Ekranı (Statistics & Charts)**

**Aksiyonlar:**

**4.1 Screen Layout:**
- Scroll view
- Sections: Özet Kartları → Döngü Geçmişi → Semptom Frekansı → Mood Trendi

**4.2 Özet Kartları:**
- 2 kart (horizontal):
  ```tsx
  <StatCard
    label="Ortalama Döngü"
    value="28 gün"
    icon="🔄"
  />
  <StatCard
    label="Ortalama Adet"
    value="5 gün"
    icon="🌸"
  />
  ```
- `/src/services/statistics.ts` → `calculateCycleStats()`

**4.3 Döngü Geçmişi (Bar Chart):**
- Victory Native → VictoryBar
- X axis: Son 6 döngü
- Y axis: Döngü süresi (gün)
- Tooltip: hover/tap → detaylı bilgi
- Renk: primary gradient

**4.4 En Sık Semptomlar (Horizontal Bar Chart):**
- Victory Native → VictoryBar (horizontal)
- En sık 5 semptom
- X axis: Frekans (%)
- Y axis: Semptom adı
- Renk kodlu (ağrılar kırmızı, sindirim yeşil, vb.)

**4.5 Mood Trendi (Line Chart):**
- Victory Native → VictoryLine
- X axis: Son 3 ay (günler)
- Y axis: Mood score (1-9)
- Smooth curve
- Renk: lilac gradient

**4.6 Tahmin Doğruluğu:**
- Kart: "Son 3 döngüde %87 doğruluk"
- `calculateAccuracy()` fonksiyonu
- Progress bar görselleştirmesi

**4.7 Empty State:**
- Henüz yeterli veri yoksa:
  - İllüstrasyon + "En az 2 döngü kaydı gerekli"
  - "Günlük tutmaya başla!" butonu → DailyLog

**Kabul Kriterleri:**
- [x] Özet kartları doğru hesaplanır (Redux'tan)
- [x] Grafikler gerçek verilerle render edilir
- [x] Empty state görünür (veri yetersizse)
- [x] Grafikler responsive (ekran boyutuna uyumlu)
- [x] UI tutarlı (chart renkleri theme'e uygun)

---

### **Task 5 — Ayarlar Ekranı (Settings)**

**Aksiyonlar:**

**5.1 Screen Layout:**
- Scroll view
- Sectionlar: Döngü Tercihleri → Bildirimler → Görünüm → Gizlilik → Veri Yönetimi → Hakkında

**5.2 Döngü Tercihleri:**
- **Ortalama adet süresi:** Slider (2-10, default 5)
- **Ortalama döngü süresi:** Slider (21-35, default 28)
- **Son adet başlangıcı:** Date picker
- Değişiklik → `prefsSlice` güncelle

**5.3 Bildirimler:**
- **Toggle:** Bildirimleri aç/kapat
- **Sıklık:** Segmented control (low/balanced/high)
- **Hatırlatma saati:** Time picker
- **Yaklaşan adet bildirimi:** Toggle
- **Su içme hatırlatması:** Toggle
- **Günlük kayıt hatırlatması:** Toggle
- İzin kontrolü: `requestNotificationPermission()`
- Değişiklik → `scheduleNotifications()` çağır

**5.4 Görünüm:**
- **Tema:** Segmented control (Light/Dark)
  - Dark tema token'ları hazır olacak
  - Theme context güncellenecek
- **Dil:** Segmented control (TR/EN)
  - i18n context güncellenecek

**5.5 Gizlilik & Güvenlik:**
- Info kartı: "Verileriniz cihazınızda güvende, buluta gönderilmiyor"
- **PIN kilidi (Future):** Toggle + PIN ayarlama modal
- **Biyometrik kilit (Future):** Toggle

**5.6 Veri Yönetimi:**
- **Verileri dışa aktar:**
  - Button → JSON dosyası üret
  - Expo Sharing API ile paylaş
- **Verileri içe aktar:**
  - Button → Dosya seçici
  - JSON parse + validation
  - Confirmation modal
- **Tüm verileri sil:**
  - Button (danger color)
  - Double confirmation modal
  - Redux reset + AsyncStorage clear

**5.7 Hakkında:**
- App versiyonu (package.json'dan)
- Tıbbi açıklama: "Bu uygulama tıbbi tavsiye yerine geçmez. Ciddi semptomlar için doktora başvurun."
- Gizlilik politikası (metin modal)
- İletişim: support@cyclemate.app

**Kabul Kriterleri:**
- [x] Tercih değişiklikleri persist edilir
- [x] Bildirim ayarları çalışır (permission + schedule)
- [x] Tema değişimi anında yansır
- [x] Veri export → JSON dosyası indirilir
- [x] Veri import → doğrulama + onay akışı çalışır
- [x] "Tüm verileri sil" → double confirmation + çalışır
- [x] UI tutarlı

---

### **Task 6 — Bildirim Sistemi (Notifications)**

**Aksiyonlar:**

**6.1 Service Implementation:**
- `/src/services/notificationService.ts`
- `requestNotificationPermission()`
- `scheduleNotifications(settings, nextPeriodDate)`
- `cancelAllScheduledNotificationsAsync()`

**6.2 Bildirim Tipleri:**
1. **Günlük hatırlatma:**
   - Sıklığa göre (low: 1/gün, balanced: 2/gün, high: 3/gün)
   - "Günlüğünü kaydet! 📖"
   
2. **Yaklaşan adet:**
   - Tahmini adet başlangıcından 2 gün önce
   - "Adet dönemin yaklaşıyor 🌸"
   
3. **Su içme:**
   - Balanced/High modda
   - "Su içme zamanı! 💧"
   
4. **Motivasyon (High mod):**
   - Sabah 9:00
   - "Günaydın! Bugün harika bir gün olacak! 🌞"

**6.3 Notification Handler:**
- Uygulama açıkken: Alert + Sound
- Arka planda: Sistem bildirimi
- Tıklama → ilgili ekrana yönlendir

**6.4 Settings Integration:**
- Ayarlar'da toggle değişince `scheduleNotifications` çağrılır
- Permission yoksa → sistem permission dialog

**Kabul Kriterleri:**
- [x] Bildirim izni akışı çalışır
- [x] Ayarlara göre bildirimler planlanır
- [x] Bildirimlere tıklama → doğru ekrana yönlendirir
- [x] "Bildirimleri kapat" → tüm bildirimler iptal edilir

---

### **Task 7 — Kalite, Tutarlılık & Erişilebilirlik**

**Aksiyonlar:**

**7.1 UI Tutarlılığı:**
- Tüm ekranlarda aynı:
  - Button stilleri (primary, secondary, text)
  - Card layout ve shadow
  - Chip stilleri
  - FAB posisyon ve stil
  - Bottom tab bar görünümü
- Tokens'a sıkı bağlılık (hardcoded değer yok)

**7.2 Erişilebilirlik (A11y):**
- **Touch targets:** Min 48dp (WCAG AA)
- **Renk kontrastı:** Min 4.5:1 (text/background)
- **Screen reader:**
  - Tüm butonlarda `accessibilityLabel`
  - Tüm input'larda `accessibilityHint`
  - Anlamlı başlıklar (`accessibilityRole="header"`)
- **Keyboard navigation:** (gelecekte web)
- **Dynamic type:** Font ölçekleme desteği

**7.3 Loading & Empty States:**
- **Loading:**
  - Skeleton screens (Calendar, Reports)
  - Spinner (Data loading)
- **Empty states:**
  - İllüstrasyon + friendly message
  - Call-to-action button
  - Örnekler:
    - Reports: "Henüz yeterli veri yok"
    - DailyLog öneri: "Semptom seç, öneriler gelsin"

**7.4 Error Handling:**
- **Network errors:** (future backend)
- **Validation errors:** Form'larda inline feedback
- **Data corruption:** Graceful fallback
- **Snackbar/Toast:** User-friendly error mesajları

**7.5 Performans:**
- **FlatList:** Büyük listeler için (logs)
- **Memoization:** React.memo, useMemo, useCallback
- **Image optimization:** Compressed assets
- **Lazy loading:** Heavy components (Charts)

**Kabul Kriterleri:**
- [x] Tüm ekranlar aynı tasarım dilinde
- [x] Touch target'lar ≥48dp
- [x] Renk kontrastı ≥4.5:1
- [x] Screen reader metinleri doğru
- [x] Loading states çalışıyor
- [x] Empty states görünüyor
- [x] FPS 60'ın altına düşmüyor (büyük data'da)

---

### **Task 8 — Backend Hazırlığı (Mock → Real API)**

**Aksiyonlar:**

**8.1 Service Layer Abstraction:**
- `/src/services/api.ts` → Base API client
  ```ts
  export interface ApiConfig {
    baseUrl: string;
    timeout: number;
  }
  
  export class ApiClient {
    constructor(config: ApiConfig) {}
    
    async get<T>(endpoint: string): Promise<T> {
      // Implementation
    }
    
    async post<T>(endpoint: string, data: any): Promise<T> {
      // Implementation
    }
  }
  ```

**8.2 Tips Service (Mock → API Ready):**
- Şu anki: Local JSON'dan random öneri
- Future: API'den AI-generated öneriler
  ```ts
  export async function getSuggestions(
    symptoms: Symptom[]
  ): Promise<TipSuggestion[]> {
    // if (USE_API) {
    //   return apiClient.post('/tips/suggest', { symptoms });
    // }
    return getMockSuggestions(symptoms);
  }
  ```

**8.3 Sync Service (Future):**
- `/src/services/syncService.ts`
  ```ts
  export async function syncData(localState: AppState): Promise<void> {
    // Push local changes to backend
    // Pull remote changes
    // Merge conflicts (last-write-wins)
  }
  ```

**8.4 Endpoint Stubs:**
- `POST /auth/register` → User registration
- `POST /auth/login` → Login
- `GET /user/profile` → User data
- `POST /logs` → Create daily log
- `GET /logs?startDate&endDate` → Get logs
- `POST /periods` → Create period span
- `GET /periods` → Get periods
- `POST /tips/suggest` → AI suggestions
- `GET /analytics/stats` → Advanced statistics

**Kabul Kriterleri:**
- [x] Service layer abstract (local/API kolayca switch)
- [x] Mock data çalışıyor
- [x] API client hazır (boş implementasyon)
- [x] UI API'den veri geliyormuş gibi çalışır

---

### **Task 9 — i18n (Çoklu Dil Desteği)**

**Aksiyonlar:**

**9.1 i18n Setup:**
- `i18next` veya `react-i18next` kur
- `/src/locales/tr.json` ve `/src/locales/en.json`

**9.2 Translation Keys:**
```json
// tr.json
{
  "common": {
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "back": "Geri"
  },
  "onboarding": {
    "screen1": {
      "title": "Takibi kolay",
      "description": "Döngünü kolayca takip et"
    }
  },
  "calendar": {
    "legend": {
      "menstrual": "Adet",
      "predicted": "Tahmini",
      "fertile": "Fertil",
      "ovulation": "Ovulasyon",
      "today": "Bugün"
    }
  },
  "symptoms": {
    "cramp": "Kramp",
    "headache": "Baş Ağrısı",
    "bloating": "Şişkinlik"
    // ... tüm semptomlar
  },
  "moods": {
    "ecstatic": "Muhteşem",
    "happy": "Mutlu",
    "calm": "Sakin"
    // ... tüm mood'lar
  },
  "phases": {
    "menstrual": {
      "title": "Menstrual Faz (Adet Dönemi)",
      "description": "Uterus duvarı dökülüyor..."
    }
  }
}
```

**9.3 Usage:**
```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <Text>{t('common.save')}</Text>;
}
```

**9.4 Language Switcher:**
- Ayarlar → Dil seçimi
- `settingsSlice` → `language: 'tr' | 'en'`
- `i18n.changeLanguage(language)`

**Kabul Kriterleri:**
- [x] TR tam tercüme edilmiş
- [x] EN tam tercüme edilmiş
- [x] Ayarlar'dan dil değişimi çalışır
- [x] Tüm UI metinleri i18n kullanır (hardcoded yok)

---

### **Task 10 — Dark Theme Implementation**

**Aksiyonlar:**

**10.1 Dark Theme Tokens:**
```ts
// /src/theme/tokens.ts

export const darkColors = {
  primary: '#E66FD2',
  primary600: '#FF9AD2',
  primary200: '#4A2A42',
  
  lilac: '#C5A8FF',
  mint: '#8FE6D9',
  
  danger: '#FF7A8F',
  warning: '#FFB84D',
  success: '#7FE6B8',
  info: '#8FB3FF',
  
  ink: '#F5F5F7',
  inkSoft: '#C7C7CC',
  inkLight: '#8E8E93',
  bg: '#1C1C1E',
  bgSoft: '#2C2C2E',
  bgGray: '#3A3A3C',
  
  menstrualRed: '#FF5A76',
  predictedPink: '#4A2A35',
  fertileGreen: '#1F4A42',
  ovulationPurple: '#4A3660',
  todayMint: '#2A4A45',
};
```

**10.2 Theme Context:**
```tsx
// /src/theme/ThemeProvider.tsx

export const ThemeProvider = ({ children }) => {
  const theme = useSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ colors, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**10.3 Component Updates:**
- Tüm component'ler `useTheme()` hook kullanır
- Hardcoded renk yok
- Dynamic styling:
  ```tsx
  const { colors } = useTheme();
  <View style={{ backgroundColor: colors.bg }} />
  ```

**10.4 System Preference (Future):**
- Cihaz tema ayarını otomatik algıla
- `useColorScheme()` from React Native

**Kabul Kriterleri:**
- [x] Dark theme token'ları tanımlanmış
- [x] Ayarlar'dan tema değişimi anında yansır
- [x] Tüm ekranlar dark theme'de doğru görünür
- [x] Kontrast oranları korunmuş (A11y)

---

### **Task 11 — Testing & Quality Assurance**

**Aksiyonlar:**

**11.1 Unit Tests:**
- Jest + React Native Testing Library
- Test edilecekler:
  - `prediction.ts` → Tahmin algoritmaları
  - `statistics.ts` → İstatistik hesaplamaları
  - Redux reducers → State mutations
  - Utility functions → Date helpers, validation

**11.2 Component Tests:**
- Kritik component'ler:
  - `CalendarCell` → Doğru renk/ikon render
  - `MoodSelector` → Seçim state yönetimi
  - `SymptomGrid` → Çoklu seçim
  - `Button` → Press handlers

**11.3 Integration Tests:**
- E2E flow'lar:
  - Onboarding → Setup → Takvim
  - Adet başlat → Takvim güncellenir
  - Günlük kaydet → Persist edilir
  - Rapor görüntüleme → Doğru istatistikler

**11.4 Manual Testing Checklist:**
- [ ] Tüm ekranlar gezinilebilir
- [ ] Form validation çalışır
- [ ] Veri persist edilir (app restart)
- [ ] Bildirimler tetiklenir
- [ ] Takvim tahminleri doğru
- [ ] Grafikler doğru render edilir
- [ ] Export/Import çalışır
- [ ] Tema değişimi smooth
- [ ] A11y (TalkBack ile test)

**Kabul Kriterleri:**
- [x] Unit test coverage ≥70%
- [x] Tüm critical path'ler test edilmiş
- [x] Manual testing checklist geçer
- [x] Crash-free ≥99%

---

### **Task 12 — Yayına Hazırlık & Build**

**Aksiyonlar:**

**12.1 App Configuration:**
- `app.json`:
  ```json
  {
    "expo": {
      "name": "CycleMate",
      "slug": "cyclemate",
      "version": "1.0.0",
      "orientation": "portrait",
      "icon": "./assets/icon.png",
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#E66FD2"
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#FFFFFF"
        },
        "package": "com.cyclemate.app",
        "permissions": [
          "NOTIFICATIONS"
        ]
      }
    }
  }
  ```

**12.2 Assets:**
- App icon (1024x1024)
- Splash screen
- Adaptive icon (Android)
- Store screenshots (5-8 adet)

**12.3 Store Listing:**
- **Başlık:** CycleMate - Adet Takibi
- **Kısa Açıklama:** Döngünü takip et, kendini daha iyi tanı 🌸
- **Uzun Açıklama:**
  ```
  CycleMate, regl döngünü kolayca takip edebileceğin, özel ve güvenli bir uygulama.
  
  ✨ Özellikler:
  • Görsel takvim ile döngü takibi
  • Günlük mood ve semptom kaydı
  • Kişiselleştirilmiş öneriler
  • Detaylı istatistikler ve grafikler
  • Akıllı tahmin algoritması
  • Yerel bildirimler
  • Veriler cihazında güvende (offline-first)
  
  🔒 Gizlilik: Verileriniz yalnızca cihazınızda saklanır.
  
  💡 Not: Bu uygulama tıbbi tavsiye yerine geçmez.
  ```

**12.4 Build Commands:**
```bash
# Development build
npx expo run:android

# Production build (EAS)
eas build --platform android --profile production

# Local build
npx expo prebuild
cd android && ./gradlew assembleRelease
```

**12.5 README.md:**
```markdown
# CycleMate - Adet Takip Uygulaması

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Expo CLI
- Android Studio / Emulator

### Adımlar
1. Clone repository
   \`\`\`bash
   git clone https://github.com/your-org/cyclemate.git
   cd cyclemate
   \`\`\`

2. Bağımlılıkları yükle
   \`\`\`bash
   npm install
   \`\`\`

3. Uygulamayı çalıştır
   \`\`\`bash
   npx expo start --android
   \`\`\`

## 📱 Build

### Development
\`\`\`bash
npx expo run:android
\`\`\`

### Production (EAS)
\`\`\`bash
eas build -p android --profile production
\`\`\`

## 🏗️ Mimari
- **Framework:** Expo React Native (TypeScript)
- **State:** Redux Toolkit + redux-persist
- **Storage:** AsyncStorage
- **Navigation:** React Navigation (Stack + Tabs)
- **Charts:** Victory Native
- **Notifications:** expo-notifications

## 📂 Klasör Yapısı
/src
├── /components     # Reusable UI
├── /screens        # App screens
├── /navigation     # Navigation config
├── /store          # Redux slices
├── /services       # Business logic
├── /theme          # Design tokens
└── /utils          # Helpers

## 🎨 Tasarım Sistemi
- **Renkler:** Pastel pembe, mor, mint gradient
- **Tipografi:** SF Pro / Roboto
- **Bileşenler:** Modüler, reusable
- **A11y:** WCAG AA compliant

## 🧪 Test
\`\`\`bash
npm test
npm run test:coverage
\`\`\`

## 📄 Lisans
MIT License

## 📧 İletişim
support@cyclemate.app
\`\`\`

**Kabul Kriterleri:**
- [x] APK/AAB üretilebiliyor
- [x] App icon ve splash görünüyor
- [x] Store listing hazır
- [x] README eksiksiz
- [x] Production build crash-free

---

## 11) Kabul Kriterleri (Definition of Done — Özet)

### Fonksiyonel:
- [x] Onboarding & Setup bir kez çalışır, sonra atlanır
- [x] Takvim hücreleri **ikon + renk** ile anlamı net verir; legend birebir uyumlu
- [x] "Adet Başlat/Bitti" kayıtları **persist** ve UI'ye yansır
- [x] Günlük: mood/semptom/not kaydı **persist**; seçime göre **öneri kartı** görünür
- [x] Raporlar gerçek kayıtlardan hesaplanır ve grafiklenir
- [x] Bildirim ayarları kaydedilir, local notifications tetiklenir (izin varsa)
- [x] Tahmin algoritması bilimsel formüle göre çalışır
- [x] Faz bilgileri tıbbi doğruluğa sahip

### Teknik:
- [x] Redux state management çalışır, persist edilir
- [x] AsyncStorage veri kaybetmez
- [x] Navigation akışı sorunsuz
- [x] Kod yapısı modüler; `services`, `store`, `components` ayrımı net
- [x] TypeScript hatasız compile oluyor
- [x] Performance: 60 FPS, big data'da lag yok

### UI/UX:
- [x] UI dili tutarlı, pastel-gradient; alt bar/btn/card stili her ekranda aynı
- [x] Touch target'lar ≥48dp
- [x] Renk kontrastı ≥4.5:1 (A11y)
- [x] Loading ve empty states var
- [x] Dark theme çalışır, smooth geçiş
- [x] i18n TR/EN tam çalışır

### Güvenlik & Gizlilik:
- [x] Tüm veriler **AsyncStorage**'da; remote sync yok (MVP)
- [x] İzinler: yalnızca **notifications** (opsiyonel)
- [x] Export/Import JSON çalışır
- [x] "Verilerin sende" bildirimi görünür

### Yayın:
- [x] APK/AAB build edilebilir
- [x] README: "clone → npm i → npx expo start" + Android talimatları
- [x] Store listing hazır
- [x] Crash-free ≥99%

---

## 12) Çalıştırma & Araçlar

### Gereksinimler:
- Node.js 18+
- Expo CLI (güncel)
- Android Studio / Emulator veya fiziksel cihaz

### Kurulum:
```bash
# 1. Repository clone
git clone [repo-url]
cd CycleMate

# 2. Bağımlılıkları yükle
npm install

# 3. Uygulamayı başlat
npx expo start --android
```

### Build:
```bash
# Development build
npx expo run:android

# Production build (EAS)
eas build -p android --profile production

# Local build
npx expo prebuild
cd android && ./gradlew assembleRelease
```

---

## 13) Güvenlik & Gizlilik

### Veri Saklama:
- Tüm kullanıcı verileri **AsyncStorage**'da (cihaz local)
- Hiçbir veri sunucuya gönderilmez (MVP)
- Uygulama silinirse veriler de silinir

### İzinler:
- **Notifications:** Hatırlatmalar için (opsiyonel)
- Başka izin talep edilmez

### Export/Import:
- Kullanıcı isteğiyle JSON export
- Cihaz değişiminde import ile veri taşıma
- Manual backup teşvik edilir

### Gelecek (Backend):
- Opsiyonel bulut yedekleme
- End-to-end encryption
- GDPR compliant

### Tıbbi Sorumluluk:
- **Disclaimer:** "Bu uygulama tıbbi tavsiye, teşhis veya tedavi yerine geçmez."
- Ciddi semptomlar için doktora başvurma önerisi
- Tahminler %100 doğru değildir uyarısı

---

## 14) Başarı Ölçütleri (MVP)

### Engagement:
- İlk gün akış tamamlanma oranı (onboarding→setup→takvim) ≥80%
- Haftalık 3+ günlük kaydı yapan kullanıcı oranı ≥40%
- Aylık aktif kullanıcı (MAU) retention ≥50%

### Feature Usage:
- Öneri kartı görüntülenme oranı ≥70%
- Raporlar ekranı ziyaret oranı ≥30%
- Bildirim açık oranı ≥60%

### Teknik:
- Crash-free sessions ≥99%
- App açılış süresi ≤2 saniye
- ANR (Application Not Responding) oranı ≤0.5%

### Kullanıcı Memnuniyeti:
- Play Store rating ≥4.5/5
- Pozitif yorum oranı ≥80%
- User feedback response time ≤24 saat

---

## 15) Roadmap (Future Features)

### v1.1 (3 ay sonra):
- Backend entegrasyonu (opsiyonel sync)
- AI destekli öneriler (OpenAI API)
- Gelişmiş tahmin algoritması (ML model)
- Partnerlık modu (partner ile paylaşım)

### v1.2 (6 ay sonra):
- Google Fit / Apple Health entegrasyonu
- Kilo, uyku, aktivite korelasyonu
- Sağlık raporu export (PDF)
- Doktor paylaşımı

### v1.3 (9 ay sonra):
- Topluluk & forum özelliği
- Uzman Q&A
- Premium subscription (advanced features)
- iOS versiyonu

### v2.0 (12 ay sonra):
- Hamilelik takibi modu
- Doğum kontrol hatırlatmaları
- Kişiselleştirilmiş ürün önerileri (affiliate)
- Telemetri ve analytics

---

## 16) Teknik Borç & İyileştirmeler

### Bilinen Sınırlamalar (MVP):
- Basit tahmin algoritması (son döngü ortalaması)
- Offline-only (senkronizasyon yok)
- Mock öneri sistemi (API'ye bağlanacak)
- Tek dil (TR) — EN hazır ama içerik eksik

### İyileştirme Alanları:
- Performance: Büyük veri setlerinde (1000+ log) optimizasyon
- Accessibility: Ses bildirimleri, haptic feedback
- Grafik detayları: Interaktif tooltip'ler, zoom
- Animation polish: Daha smooth transitions

### Refactoring:
- Component library (Storybook)
- E2E test coverage artırma (Detox)
- Code splitting (lazy loading)

---

## 17) ÖZEL NOTLAR (Cursor için)

### Kritik Dikkat Noktaları:

1. **Takvim Hücre İkonları:**
   - İkon **sağ üst köşede**, gün numarasının **üzerinde DEĞİL**
   - İkon boyutu 14px, numara 18px
   - İkon numarayı kapatmamalı (padding: 4dp)

2. **Semptom Bazlı Öneriler:**
   - En az 3 farklı senaryo
   - Tıbbi doğruluk kritik
   - Kaynak belirtimi zorunlu
   - "Bu tıbbi tavsiye değildir" disclaimer

3. **Tahmin Algoritması:**
   - Ovulasyon = döngü başlangıcı + (döngü süresi - 14)
   - Fertil pencere = ovulasyon ±5 gün
   - Gerçek kayıtlar tahmini override eder

4. **Persist:**
   - Her state değişikliği AsyncStorage'a yazılmalı
   - App crash/restart sonrası veri kaybolmamalı
   - redux-persist config doğru olmalı

5. **UI Tutarlılığı:**
   - Hardcoded renk YOK (token kullan)
   - Tüm button'lar aynı gradient
   - Tüm kart'lar aynı shadow ve border-radius
   - Alt bar her ekranda aynı

6. **A11y:**
   - Touch target minimum 48dp
   - Kontrast oranı minimum 4.5:1
   - AccessibilityLabel her interactive element'te

7. **Bildirimler:**
   - Permission kontrolü her zaman yapılmalı
   - Schedule etmeden önce cancel all
   - Notification trigger doğru timezone'da

8. **Veri Modeli:**
   - PeriodSpan.end nullable (devam eden adet)
   - DailyLog.symptoms array (çoklu seçim)
   - Tüm tarihler ISO format (yyyy-mm-dd)

---

## 18) Son Kontrol Listesi (Teslim Öncesi)

### Fonksiyonel Test:
- [ ] Onboarding görünür ve atlanır
- [ ] Setup tüm adımlar çalışır
- [ ] Takvim doğru işaretlenir
- [ ] Adet başlat/bitti çalışır
- [ ] Günlük kaydı persist edilir
- [ ] Öneriler semptomlara göre değişir
- [ ] Raporlar doğru hesaplanır
- [ ] Bildirimler tetiklenir
- [ ] Ayarlar kaydedilir
- [ ] Tema değişimi çalışır
- [ ] Dil değişimi çalışır
- [ ] Export/Import çalışır

### UI Kalite:
- [ ] Tüm ekranlar tutarlı
- [ ] Loading states var
- [ ] Empty states var
- [ ] Error handling var
- [ ] Animation smooth
- [ ] Touch feedback var

### Teknik:
- [ ] TypeScript hatasız
- [ ] Linter temiz
- [ ] Console error yok
- [ ] Memory leak yok
- [ ] Performance ≥60 FPS
- [ ] Build edilebiliyor

### İçerik:
- [ ] Tüm metinler TR
- [ ] Tıbbi bilgiler doğru
- [ ] Disclaimer'lar var
- [ ] README eksiksiz

---

## 🎯 TEK CÜMLE TALİMAT (CURSOR'A KOPYALA-VER)

**TALIMAT:**

Bu PRD'ye birebir uyarak **Expo React Native (Android)** bir adet takip uygulaması (CycleMate) üret. 

**Task sırası:** Proje kurulum → Onboarding/Setup → Takvim → Günlük → Raporlar → Ayarlar → Bildirimler → Kalite → Backend hazırlık → i18n → Dark theme → Test → Build.

Her task bittiğinde uygulama **çalışır durumda** olmalı. 

**Kritik gereksinimler:**
- Tasarım sistemi tutarlı (token'lar, button/card/chip aynı her yerde)
- Takvim hücre ikonları **sağ üst 14px**, numara **orta 18px**, ikon numarayı kapatmaz
- Semptom bazlı öneriler **tıbbi doğrulukla**, kaynak belirtimli
- Tahmin algoritması: ovulasyon = başlangıç + (döngü - 14), fertil = ovulasyon ±5
- Tüm veriler **AsyncStorage**'da persist
- Redux + redux-persist + AsyncStorage
- A11y: touch ≥48dp, kontrast ≥4.5:1, screen reader label'ları
- Dark theme hazır (token'lar tanımlı, switch çalışır)
- i18n TR/EN (tam tercüme)
- Bilimsel doğruluk: menstrual cycle fazları, hormonlar, semptomlar tıbbi kaynaklara uygun
- README: kurulum/çalıştırma/build adımları

**Çıktı:** Tek seferde çalıştırılabilir, production-ready, crash-free, tasarım/kod kalitesi yüksek Android uygulaması.

