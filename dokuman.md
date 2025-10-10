# 🌸 CycleMate - Kapsamlı Proje Dokümantasyonu

> **Versiyon:** 1.0.0  
> **Son Güncelleme:** 10 Ekim 2025  
> **Platform:** React Native (Expo) - Android

---

## 📑 İçindekiler

1. [Proje Hakkında](#proje-hakkında)
2. [Özellikler](#özellikler)
3. [Teknoloji Stack](#teknoloji-stack)
4. [Mimari ve Klasör Yapısı](#mimari-ve-klasör-yapısı)
5. [Veri Modeli](#veri-modeli)
6. [Ekranlar ve Kullanıcı Akışı](#ekranlar-ve-kullanıcı-akışı)
7. [Servisler ve İş Mantığı](#servisler-ve-iş-mantığı)
8. [AI/ML Entegrasyonu](#aiml-entegrasyonu)
9. [Tema ve Tasarım Sistemi](#tema-ve-tasarım-sistemi)
10. [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
11. [Build ve Deployment](#build-ve-deployment)
12. [Güvenlik ve Gizlilik](#güvenlik-ve-gizlilik)
13. [Test](#test)
14. [Geliştirme Notları](#geliştirme-notları)
15. [Future Roadmap](#future-roadmap)

---

## 🌸 Proje Hakkında

### Misyon

CycleMate, kadınların **regl döngülerini**, **ruh hallerini** ve **semptomlarını** kolayca kaydedip anlamlandırmalarını sağlayan, **tıbben doğru**, **eğlenceli** ve **bilgilendirici** bir mobil uygulamadır.

### Ana Değer Önerileri

- **Hızlı Kullanım:** Takvimden tek dokunuşla "Adet Başlat/Bitti" ve "Günlük Kaydet"
- **Bilimsel Doğruluk:** Hormon döngüleri ve faz bilgileri tıbbi kaynaklara dayalı
- **Kişisel Destek:** Seçilen semptom/mood'a göre anında kanıta dayalı öneri kartı
- **Özel & Güvenli:** Veriler buluta değil, **cihazda saklanır** (offline-first)
- **Modern Deneyim:** Pastel renk paleti, gradient efektler, smooth animasyonlar
- **Eğitici:** Her fazın anlamını ve hormon değişikliklerini açıklayan bilgi kartları
- **AI Destekli:** Cihaz içi ML model ile kişiselleştirilmiş öneriler

### Hedef Kitle

- 15-45 yaş arası kadınlar
- Regl döngüsünü takip etmek isteyenler
- Sağlık bilincine sahip bireyler
- Gizliliğe önem verenler (offline-first yaklaşım)

---

## ✨ Özellikler

### MVP (Mevcut) Özellikler ✅

#### 📅 Akıllı Takvim
- Görsel ay takvimi görünümü
- Gerçek ve tahmini adet günleri işaretlemesi
- Fertil pencere (döl verme dönemi) gösterimi
- Ovulasyon tahmini (bilimsel algoritma)
- Tek dokunuşla adet başlatma/bitirme
- Faz bilgilendirme kartları (menstrual, follicular, ovulation, luteal)
- Motivasyonel mesajlar (faz bazlı)

#### 📖 Günlük Takip
- 9 farklı ruh hali seçeneği (mood tracking)
- 19 semptom kategorisi (şiddet seviyeleri ile)
- Alışkanlık takibi (su, yürüyüş, dinlenme, duş)
- Akıntı takibi (light, medium, heavy)
- Kişisel notlar (500 karakter)
- AI destekli akıllı öneri sistemi
- Tarihe göre geçmiş kayıt düzenleme

#### 📊 Detaylı İstatistikler ve Raporlar
- Ortalama döngü ve adet süresi hesaplama
- Döngü geçmişi grafikleri (son 6 döngü)
- En sık görülen semptomlar analizi
- Ruh hali trend analizi (grafik)
- Tahmin doğruluğu yüzdesi
- Döngü değişkenliği (standart sapma)
- Filtrelenebilir raporlar

#### ⚙️ Özelleştirilebilir Ayarlar
- Döngü tercihleri (ortalama süre ayarları)
- Bildirim ayarları (sıklık, zaman, türler)
- Tema seçimi (Açık/Koyu/Sistem)
- Dil seçimi (Türkçe/İngilizce)
- PIN kilidi ve biyometrik doğrulama
- Veri yedekleme (export/import)
- Tüm verileri silme

#### 🔔 Akıllı Bildirimler
- Günlük kayıt hatırlatması
- Su içme hatırlatması
- Yaklaşan adet bildirimi (1-7 gün öncesinden)
- Özelleştirilebilir bildirim sıklığı (low/balanced/high)

#### 🔒 Gizlilik ve Güvenlik
- Tüm veriler cihazda saklanır (offline-first)
- PIN kilidi desteği
- Biyometrik kimlik doğrulama (fingerprint)
- Şifreli veri yedekleme
- Bulut senkronizasyonu YOK (gizlilik öncelikli)

#### 💬 Soru & Cevap Asistanı
- Yerel FAQ sistemi
- Anahtar kelime bazlı arama
- Tıbbi bilgi rehberi
- Kritik durumlar için uyarılar

#### 🧠 AI/ML Özellikleri
- Cihaz içi ONNX model (offline)
- Semptom bazlı öneri skoru hesaplama
- Faz bazlı kişiselleştirilmiş ipuçları
- Yerel bilgi bankası (tips.json, faq.json)

### Future Özellikler 🔜

- Backend sync (opsiyonel bulut yedekleme)
- Gelişmiş AI tahminleri (geçmiş verilerden öğrenme)
- Partnerlık modu (partner ile paylaşım)
- Sağlık uygulaması entegrasyonu (Google Fit)
- Topluluk & forum özelliği
- Premium subscription

---

## 🛠️ Teknoloji Stack

### Frontend

| Kategori | Teknoloji | Versiyon | Açıklama |
|----------|-----------|----------|----------|
| **Framework** | Expo React Native | ~54.0 | Cross-platform mobil framework |
| **Language** | TypeScript | ~5.9 | Type-safe development |
| **State Management** | Redux Toolkit | ^2.9.0 | Global state yönetimi |
| **Persistence** | Redux Persist | ^6.0.0 | State kalıcılığı |
| **Navigation** | React Navigation v7 | ^7.x | Native Stack + Bottom Tabs |
| **UI Library** | React Native | 0.81.4 | Core UI components |
| **Icons** | Lucide React Native | ^0.545 | Modern icon seti |
| **Charts** | Victory Native | ^41.20 | Veri görselleştirme |
| **Fonts** | Nunito (Google Fonts) | ^0.4.2 | Modern, okunabilir font |

### Storage & Data

| Teknoloji | Kullanım | Durum |
|-----------|----------|-------|
| **AsyncStorage** | Mevcut storage | ✅ Aktif |
| **MMKV** | Yüksek performanslı storage | 🚧 Hazır (devre dışı) |
| **Expo SecureStore** | PIN/hassas veri | ✅ Aktif |
| **Expo FileSystem** | Dosya işlemleri | ✅ Aktif |

### AI/ML

| Teknoloji | Kullanım |
|-----------|----------|
| **ONNX Runtime** | Model inference (offline) |
| **scikit-learn** | Model eğitimi (Python) |
| **NumPy/Pandas** | Veri işleme |

### Utilities

| Teknoloji | Kullanım |
|-----------|----------|
| **date-fns** | Tarih işlemleri |
| **i18next** | Çoklu dil desteği |
| **expo-notifications** | Push notifications |
| **expo-haptics** | Haptic feedback |
| **expo-blur** | Blur efektleri |
| **expo-linear-gradient** | Gradient efektleri |
| **react-native-calendars** | Takvim UI |
| **uuid** | Unique ID generation |

### Development Tools

| Araç | Kullanım |
|------|----------|
| **Jest** | Unit testing |
| **React Native Testing Library** | Component testing |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

---

## 🏗️ Mimari ve Klasör Yapısı

### Genel Mimari

```
CycleMateApp/
├── App.tsx                    # Ana uygulama giriş noktası
├── index.ts                   # Expo entry point
├── app.json                   # Expo konfigürasyonu
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── babel.config.js            # Babel config
├── jest.config.js             # Test config
├── eas.json                   # EAS Build config
│
├── assets/                    # Statik kaynaklar
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   ├── kb/                    # AI Knowledge Base
│   │   ├── tips.json          # Öneri veritabanı
│   │   └── faq.json           # Sık sorulan sorular
│   └── models/
│       └── model.onnx         # AI model (ONNX format)
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── __tests__/
│   │   ├── AuthGate.tsx       # PIN/Biometric guard
│   │   ├── Button.tsx         # Primary button
│   │   ├── Card.tsx           # Card container
│   │   ├── Chip.tsx           # Tag/chip component
│   │   ├── CalendarGrid.tsx   # Calendar grid
│   │   ├── ConfirmModal.tsx   # Confirmation dialog
│   │   ├── ErrorBoundary.tsx  # Error handler
│   │   ├── FAB.tsx            # Floating action button
│   │   ├── Icon.tsx           # Icon wrapper
│   │   ├── Input.tsx          # Text input
│   │   ├── LoadingState.tsx   # Loading indicator
│   │   ├── Modal.tsx          # Modal dialog
│   │   ├── MoodPicker.tsx     # Mood selector
│   │   ├── ProgressBar.tsx    # Progress indicator
│   │   ├── Skeleton.tsx       # Skeleton loader
│   │   ├── SymptomChip.tsx    # Symptom chip
│   │   ├── Toast.tsx          # Toast notification
│   │   └── settings/          # Settings components
│   │
│   ├── data/
│   │   └── symptomData.ts     # Symptom definitions
│   │
│   ├── i18n/
│   │   └── index.ts           # i18n configuration
│   │
│   ├── locales/
│   │   ├── tr.json            # Türkçe çeviriler
│   │   └── en.json            # İngilizce çeviriler
│   │
│   ├── screens/               # App screens
│   │   ├── __tests__/
│   │   ├── onboarding/
│   │   │   └── OnboardingScreen.tsx    # 3-slide onboarding
│   │   ├── setup/
│   │   │   ├── SetupLastPeriod.tsx     # Setup step 1
│   │   │   ├── SetupPeriodLength.tsx   # Setup step 2
│   │   │   └── SetupCycleLength.tsx    # Setup step 3
│   │   ├── navigation/
│   │   │   ├── MainTabs.tsx            # Bottom tabs
│   │   │   └── ChatStack.tsx           # Chat navigator
│   │   ├── chat/
│   │   │   └── ChatScreen.tsx          # FAQ chat
│   │   ├── CalendarScreen.tsx          # Home/Calendar
│   │   ├── DailyLogScreen.tsx          # Daily log entry
│   │   ├── ReportsScreen.tsx           # Statistics
│   │   └── SettingsScreen.tsx          # Settings
│   │
│   ├── services/              # Business logic
│   │   ├── __tests__/
│   │   ├── aiHooks.ts         # AI signal collectors
│   │   ├── aiModel.ts         # ONNX model runner
│   │   ├── aiPlaceholders.ts  # Fallback suggestions
│   │   ├── backupService.ts   # Export/Import
│   │   ├── cache.ts           # Cache manager
│   │   ├── encryption.ts      # Data encryption
│   │   ├── faqService.ts      # FAQ search
│   │   ├── featureBuilder.ts  # ML feature engineering
│   │   ├── knowledgeBase.ts   # Tips/FAQ loader
│   │   ├── logger.ts          # Logging system
│   │   ├── migration.ts       # Storage migration
│   │   ├── mmkvStorage.ts     # MMKV adapter
│   │   ├── notificationService.ts  # Notifications
│   │   ├── pinService.ts      # PIN management
│   │   ├── prediction.ts      # Cycle prediction
│   │   ├── statistics.ts      # Statistics calculation
│   │   ├── storage.ts         # Storage helpers
│   │   ├── symptomUtils.ts    # Symptom utilities
│   │   └── tipsService.ts     # AI tip suggestions
│   │
│   ├── store/                 # Redux state
│   │   ├── index.ts           # Store configuration
│   │   └── slices/
│   │       ├── appSlice.ts        # App state
│   │       ├── logsSlice.ts       # Daily logs
│   │       ├── notificationSlice.ts  # Notifications
│   │       ├── periodsSlice.ts    # Period spans
│   │       ├── prefsSlice.ts      # Cycle preferences
│   │       └── settingsSlice.ts   # App settings
│   │
│   ├── theme/                 # Design system
│   │   ├── colors.ts          # Color palette
│   │   ├── darkColors.ts      # Dark theme colors
│   │   ├── gradients.ts       # Gradient definitions
│   │   ├── index.ts           # Theme exports
│   │   ├── lightColors.ts     # Light theme colors
│   │   ├── spacing.ts         # Spacing scale
│   │   ├── ThemeProvider.tsx  # Theme context
│   │   └── typography.ts      # Font styles
│   │
│   ├── types/                 # TypeScript types
│   │   ├── index.ts           # Core types
│   │   ├── ai.ts              # AI-related types
│   │   └── backup.ts          # Backup types
│   │
│   └── utils/                 # Utility functions
│       ├── __tests__/
│       ├── confirm.ts         # Confirmation helpers
│       ├── date.ts            # Date utilities
│       ├── id.ts              # ID generation
│       ├── notify.ts          # Notification helpers
│       ├── reportsFilters.ts  # Report filters
│       ├── symptomLabels.ts   # Symptom labels
│       └── validation.ts      # Form validation
│
├── ml/                        # Machine Learning
│   ├── generate_synthetic_data.py  # Data generation
│   ├── train_model.py              # Model training
│   ├── requirements.txt            # Python deps
│   ├── README.md
│   ├── TRAINING_GUIDE.md
│   └── synthetic_cycle_data_v2_2_part_*.json  # Training data
│
└── android/                   # Android native (after prebuild)
    └── app/
        └── build.gradle
```

### Mimari Prensipleri

1. **Separation of Concerns:** Components, services, store ayrımı
2. **Offline-First:** Tüm veriler önce cihazda, sync opsiyonel
3. **Type Safety:** Tüm kod TypeScript ile yazılmış
4. **Modular:** Her modül bağımsız test edilebilir
5. **Scalable:** Yeni özellikler kolayca eklenebilir

---

## 💾 Veri Modeli

### Core Types

#### 1. **Mood (Ruh Hali)**

```typescript
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
```

#### 2. **Symptom (Semptom)**

```typescript
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
  | 'discharge'         // Akıntı
  
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
```

#### 3. **CyclePhase (Döngü Fazı)**

```typescript
export type CyclePhase = 
  | 'menstrual'   // Adet fazı (gün 1-5)
  | 'follicular'  // Foliküler faz (gün 6-13)
  | 'ovulation'   // Ovulasyon (gün 14±2)
  | 'luteal';     // Luteal faz (gün 15-28)
```

### Data Structures

#### 1. **CyclePrefs (Döngü Tercihleri)**

```typescript
interface CyclePrefs {
  avgPeriodDays: number;      // Ortalama adet süresi (default: 5)
  avgCycleDays: number;       // Ortalama döngü süresi (default: 28)
  lastPeriodStart: string;    // Son adet başlangıcı (ISO: yyyy-mm-dd)
}
```

#### 2. **DailyLog (Günlük Kayıt)**

```typescript
interface DailyLog {
  id: string;                                    // uuid
  date: string;                                  // ISO date (yyyy-mm-dd)
  mood?: Mood;                                   // Ruh hali
  symptoms: { id: string; severity: number }[];  // Semptomlar (1-5 şiddet)
  habits?: string[];                             // Alışkanlıklar
  flow?: 'light' | 'medium' | 'heavy';          // Akıntı yoğunluğu
  note?: string;                                 // Kullanıcı notu (max 500 char)
  createdAt: string;                            // ISO timestamp
  updatedAt?: string;                           // ISO timestamp
}
```

#### 3. **PeriodSpan (Adet Dönemi)**

```typescript
interface PeriodSpan {
  id: string;                  // uuid
  start: string;               // Adet başlangıcı (ISO)
  end?: string;                // Adet bitişi (ISO) - null ise devam ediyor
  cycleLengthDays?: number;    // Hesaplanan döngü uzunluğu
  periodLengthDays?: number;   // Hesaplanan adet süresi
}
```

#### 4. **NotificationSettings (Bildirim Ayarları)**

```typescript
interface NotificationSettings {
  enabled: boolean;
  frequency?: 'low' | 'balanced' | 'high';
  reminderTime: { hour: number; minute: number };
  upcomingPeriodDays: 0 | 1 | 2 | 3 | 5 | 7;
  periodReminder?: boolean;
  waterReminder?: boolean;
  dailyLogReminder?: boolean;
}
```

#### 5. **AppSettings (Uygulama Ayarları)**

```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  pinLock: boolean;
  pinCode?: string;
  biometricEnabled: boolean;
}
```

#### 6. **AppState (Global State)**

```typescript
interface AppState {
  prefs: CyclePrefs;
  logs: DailyLog[];
  periods: PeriodSpan[];
  notifications: NotificationSettings;
  settings: AppSettings;
  onboardingCompleted: boolean;
  setupCompleted: boolean;
}
```

### Prediction Types

#### **DayPrediction (Günlük Tahmin)**

```typescript
interface DayPrediction {
  date: string;                   // ISO date
  phase: CyclePhase;
  isMenstrual: boolean;           // Gerçek adet günü
  isPredictedMenstrual: boolean;  // Tahmini adet günü
  isFertile: boolean;             // Fertil pencere içinde mi?
  isOvulation: boolean;           // Ovulasyon günü mü?
  isToday: boolean;
  hasLog: boolean;                // Bu gün için log var mı?
}
```

---

## 📱 Ekranlar ve Kullanıcı Akışı

### User Flow

```
İlk Açılış:
├─ Onboarding (3 slide)
│  ├─ Slide 1: "Takibi kolay 🌸"
│  ├─ Slide 2: "Küçük hatırlatmalar 💕"
│  └─ Slide 3: "Verilerin sende 🔒"
│
├─ Setup Wizard (3 adım)
│  ├─ Adım 1: Son adet başlangıcı (date picker)
│  ├─ Adım 2: Ortalama adet süresi (slider 2-10)
│  └─ Adım 3: Ortalama döngü süresi (slider 21-35)
│
└─ Ana Uygulama (Bottom Tabs)
   ├─ 📅 Takvim (Home)
   ├─ 📖 Günlük
   ├─ 📊 Raporlar
   └─ ⚙️ Ayarlar

Sonraki Açılışlar:
├─ PIN/Biyometrik Doğrulama (etkinse)
└─ Direkt Ana Uygulama
```

### Ekran Detayları

#### 1. **Onboarding Screen**

- **Amaç:** İlk kullanıcı deneyimi, uygulamayı tanıtma
- **Özellikler:**
  - 3 slide'lı swipeable carousel
  - "Atla" ve "İleri" butonları
  - Smooth animasyonlar
  - İllüstrasyonlar
- **Navigation:** `Onboarding` → `Setup`

#### 2. **Setup Wizard**

**Step 1: Son Adet Tarihi**
- Date picker (Expo DateTimePicker)
- Zorunlu alan
- Maksimum: bugün
- Minimum: 3 ay önce

**Step 2: Adet Süresi**
- Slider (2-10 gün)
- Default: 5 gün
- Visual feedback

**Step 3: Döngü Süresi**
- Slider (21-35 gün)
- Default: 28 gün
- Bilgilendirme metni

#### 3. **Calendar Screen (Ana Ekran)**

**Layout:**
```
┌─────────────────────────────┐
│  Header: Ekim 2025  [<][>]  │
├─────────────────────────────┤
│  Legend (Chip Bar)          │
│  🌸 Adet • 🌷 Tahmini       │
│  🌱 Fertil • 💜 Ovulasyon   │
├─────────────────────────────┤
│                             │
│   Calendar Grid (7x5/6)     │
│   [Renkli hücre işaretleme] │
│                             │
├─────────────────────────────┤
│  Faz Bilgi Kartı            │
│  "Foliküler Faz - Gün 8/13" │
│  [Hormon bilgisi]           │
├─────────────────────────────┤
│  Motivasyon Kartı           │
│  "Enerjin yüksek! 💪"       │
│  [Faz bazlı mesaj]          │
└─────────────────────────────┘
    [FAB: Günlük Kaydet] 📝
```

**Hücre İşaretleme:**
- 🌸 Adet (gerçek): Canlı pembe `#FFB6CE`
- 🌷 Tahmini adet: Açık pembe `#FFD1E2`
- 🌱 Fertil: Mint `#BDF5E6`
- 💜 Ovulasyon: Lila `#CDB8FF`
- ⭐ Bugün: Altın border `#FFC857`

**Hızlı Aksiyonlar:**
- FAB: "Günlük Kaydet" → DailyLogScreen
- Hücre tıklama → DailyLogScreen (o tarih preset)

#### 4. **Daily Log Screen (Günlük Kayıt)**

**Sections:**

1. **Tarih Seçici** (Header)
2. **Ruh Halim** (Mood Picker)
   - 9 emoji horizontal scroll
   - Tek seçim
   - Border + scale animasyon

3. **Semptomlarım** (Symptom Grid)
   - 19 chip kategorize
   - Çoklu seçim
   - Şiddet seviyesi (1-5)
   - Wrap layout

4. **Alışkanlıklarım** (Habits)
   - Su, yürüyüş, dinlenme, duş
   - Toggle chips

5. **Akıntı** (Flow)
   - Light, medium, heavy
   - Tek seçim

6. **Notlarım** (Notes)
   - TextArea (max 500 char)
   - Karakter sayacı

7. **💡 AI Önerileri** (Dynamic)
   - Seçilen semptomlara göre
   - 3 öneri kartı
   - Kaynak belirtimi

8. **Kaydet Butonu**
   - Validation
   - Haptic feedback
   - Confetti animasyonu

#### 5. **Reports Screen (Raporlar)**

**Sections:**

1. **Özet Kartları**
   - Ortalama döngü süresi
   - Ortalama adet süresi
   - Toplam döngü sayısı
   - Tahmin doğruluğu

2. **Döngü Geçmişi**
   - Bar chart (son 6 döngü)
   - Victory Native

3. **En Sık Semptomlar**
   - Horizontal bar chart
   - Yüzde gösterimi

4. **Ruh Hali Trendi**
   - Line chart (son 3 ay)
   - Mood score mapping

**Empty State:**
- "Henüz yeterli veri yok"
- Minimum 2 döngü gerekli

#### 6. **Settings Screen (Ayarlar)**

**Bölümler:**

1. **Döngü Tercihleri**
   - Adet süresi (slider)
   - Döngü süresi (slider)
   - Son adet tarihi (date picker)

2. **Bildirimler**
   - Bildirimleri aç/kapat
   - Bildirim sıklığı
   - Hatırlatma saati
   - Yaklaşan adet bildirimi

3. **Görünüm**
   - Tema (Light/Dark/System)
   - Dil (TR/EN)

4. **Güvenlik**
   - PIN kilidi
   - Biyometrik doğrulama
   - PIN değiştir
   - PIN kaldır (tüm verileri siler)

5. **Veri Yönetimi**
   - Verileri dışa aktar (JSON)
   - Verileri içe aktar
   - Tüm verileri sil

6. **Destek**
   - Soru & Cevap Asistanı
   - Hakkında
   - Versiyon bilgisi

#### 7. **Chat Screen (S&C Asistanı)**

- FAQ arama sistemi
- Anahtar kelime matching
- Kategorilere göre filtreleme
- Kritik kelime guardrails

---

## 🔧 Servisler ve İş Mantığı

### 1. **Prediction Service** (`prediction.ts`)

**Amaç:** Döngü tahminleri ve faz hesaplamaları

**Ana Fonksiyonlar:**

```typescript
// Döngü tahmini
predictCycle(
  input: PredictionInput,
  startDate: string,
  endDate: string
): DayPrediction[]

// Ovulasyon günü hesaplama
// Formula: Son adet + (Döngü süresi - 14)
calculateOvulationDay(lastPeriodStart: string, avgCycleDays: number): string

// Fertil pencere
// Formula: Ovulasyon - 5 gün, Ovulasyon + 1 gün
calculateFertileWindow(ovulationDate: string): { start: string; end: string }

// Faz belirleme
determinePhase(date: string, lastPeriodStart: string, avgCycleDays: number): CyclePhase
```

**Algoritma:**
1. Son adet başlangıcından itibaren döngü günü hesapla
2. Ovulasyon günü = Döngü süresi - 14
3. Fertil pencere = Ovulasyon ±5 gün
4. Her günün fazını belirle (menstrual/follicular/ovulation/luteal)

### 2. **Statistics Service** (`statistics.ts`)

**Amaç:** İstatistik ve analiz hesaplamaları

**Ana Fonksiyonlar:**

```typescript
// Döngü istatistikleri
calculateCycleStats(periods: PeriodSpan[]): CycleStats

// Semptom frekansı
calculateSymptomFrequency(logs: DailyLog[]): Record<Symptom, number>

// Mood trendi
calculateMoodTrend(logs: DailyLog[]): MoodTrend[]

// Tahmin doğruluğu
calculatePredictionAccuracy(periods: PeriodSpan[], avgCycle: number): number
```

**Hesaplamalar:**
- Ortalama: `sum / count`
- Standart sapma: `sqrt(variance)`
- Doğruluk: `100 - (avgError / avgCycle * 100)`

### 3. **Tips Service** (`tipsService.ts`)

**Amaç:** AI destekli öneri sistemi

**Ana Fonksiyonlar:**

```typescript
// Öneri getir (AI-enhanced)
async getSuggestionsWithModel(
  symptoms: Symptom[],
  mood?: Mood,
  phase?: CyclePhase
): Promise<TipSuggestion[]>

// Faz bazlı motivasyon
getPhaseMotivation(phase: CyclePhase, cycleDay: number): string

// Faz bilgisi
getPhaseInfo(phase: CyclePhase): PhaseInfo
```

**Akış:**
1. Semptom/mood/faz sinyalleri topla
2. Feature vector oluştur (`featureBuilder.ts`)
3. ONNX model ile skoru hesapla (`aiModel.ts`)
4. Yerel bilgi bankasından önerileri al (`knowledgeBase.ts`)
5. Skorlara göre sırala ve en iyi 3'ü döndür

### 4. **Notification Service** (`notificationService.ts`)

**Amaç:** Bildirim yönetimi

**Ana Fonksiyonlar:**

```typescript
// İzin kontrolü
requestNotificationPermission(): Promise<boolean>

// Bildirimleri planla
scheduleNotifications(settings: NotificationSettings, nextPeriodDate: string): Promise<void>

// Bildirimleri iptal et
cancelAllNotifications(): Promise<void>
```

**Bildirim Tipleri:**
1. **Günlük Hatırlatma:** Belirlenen saatte
2. **Su İçme:** Sıklığa göre (balanced/high)
3. **Yaklaşan Adet:** X gün öncesinden
4. **Motivasyon:** Sabah mesajı (high mode)

### 5. **Backup Service** (`backupService.ts`)

**Amaç:** Veri yedekleme ve geri yükleme

**Ana Fonksiyonlar:**

```typescript
// Export
exportData(): Promise<BackupData>

// Import
importData(jsonData: string): Promise<void>

// Validation
validateBackupData(data: any): boolean
```

**Format:**
```json
{
  "version": "1.0.0",
  "exportDate": "2025-10-10T12:00:00Z",
  "data": {
    "prefs": {...},
    "logs": [...],
    "periods": [...],
    "settings": {...}
  }
}
```

### 6. **Storage Service** (`storage.ts`)

**Amaç:** Düşük seviye storage işlemleri

**Ana Fonksiyonlar:**

```typescript
// Get
getData<T>(key: string): Promise<T | null>

// Set
setData<T>(key: string, value: T): Promise<void>

// Delete
deleteData(key: string): Promise<void>

// Clear all
clearAllData(): Promise<void>
```

**Storage Stratejisi:**
- **Mevcut:** AsyncStorage (React Native)
- **Future:** MMKV (30x daha hızlı, hazır kod var)
- **Hassas Veri:** Expo SecureStore (PIN)

### 7. **AI Services**

#### a) **AI Model** (`aiModel.ts`)

```typescript
// ONNX model inference
getTipModelScores(features: number[]): Promise<number[] | null>

// Model yükleme
loadModel(): Promise<InferenceSession | null>
```

#### b) **Feature Builder** (`featureBuilder.ts`)

```typescript
// Feature vector oluşturma
buildTipFeatures(
  mood: Mood | undefined,
  symptoms: Array<{ id: string; severity: number }>,
  habits: string[],
  daysSinceLastPeriod: number
): number[]
```

#### c) **Knowledge Base** (`knowledgeBase.ts`)

```typescript
// Bilgi bankası yükleme
loadKnowledgeBase(): Promise<void>

// Tips getir
getTips(): Tip[]

// FAQ getir
getFAQs(): FAQ[]
```

#### d) **FAQ Service** (`faqService.ts`)

```typescript
// FAQ arama
searchFaq(query: string): FAQ[]

// Kategori filtresi
filterByCategory(category: string): FAQ[]

// Kritik kelime kontrolü
checkCriticalKeywords(query: string): string | null
```

### 8. **PIN Service** (`pinService.ts`)

**Amaç:** PIN ve biyometrik doğrulama

**Ana Fonksiyonlar:**

```typescript
// PIN ayarla
setPIN(pin: string): Promise<void>

// PIN doğrula
verifyPIN(pin: string): Promise<boolean>

// PIN var mı kontrolü
hasPIN(): Promise<boolean>

// PIN kaldır (tüm verileri siler!)
removePIN(): Promise<void>

// Biyometrik doğrulama
authenticateWithBiometrics(): Promise<boolean>
```

---

## 🧠 AI/ML Entegrasyonu

### Genel Bakış

CycleMate, **cihaz içi (on-device)** yapay zeka kullanarak tamamen **offline** kişiselleştirilmiş öneriler sunar.

### Mimari

```
[Kullanıcı Girişi]
       ↓
[Feature Builder] → Feature vector oluştur
       ↓
[ONNX Model] → Model inference (cihazda)
       ↓
[Tip Scorer] → Skorları hesapla
       ↓
[Knowledge Base] → Yerel JSON'dan önerileri al
       ↓
[Ranker] → En iyi 3 öneriyi seç
       ↓
[UI] → Kullanıcıya göster
```

### ML Model

**Format:** ONNX (Open Neural Network Exchange)  
**Boyut:** ~50-100KB (quantized)  
**Runtime:** ONNX Runtime React Native  
**Training:** Python (scikit-learn)

**Model Detayları:**
- **Tip:** Multi-layer Perceptron (MLP)
- **Input:** 35 features (cycle phase, symptoms, mood, habits)
- **Output:** Tip recommendation scores
- **Hidden Layers:** [64, 32]
- **Activation:** ReLU
- **Optimizer:** Adam
- **Loss:** Cross-entropy

### Feature Engineering

**Input Features (35 total):**

1. **Cycle Features (6):**
   - Döngü günü (normalized 0-1)
   - Son adet başlangıcından günler
   - Ortalama döngü süresi
   - Ortalama adet süresi
   - Cycle phase (one-hot: 4)

2. **Symptom Features (19):**
   - Her semptom için severity (0-5)
   - Multi-hot encoding

3. **Mood Features (9):**
   - One-hot encoding

4. **Habit Features (4):**
   - Binary flags (water, walk, rest, shower)

### Training Pipeline

**Dosyalar:**
- `ml/generate_synthetic_data.py`: Sentetik veri üretimi
- `ml/train_model.py`: Model eğitimi
- `ml/requirements.txt`: Python dependencies

**Adımlar:**

```bash
# 1. Veri üretimi
python ml/generate_synthetic_data.py

# 2. Model eğitimi
python ml/train_model.py --data ml/synthetic_cycle_data.json --output assets/models/model.onnx

# 3. Model otomatik olarak uygulamaya dahil edilir
```

**Training Data:**
- 500 sentetik kullanıcı
- 6,000 döngü
- ~25,000+ günlük kayıt
- Gerçekçi semptom/mood dağılımı

### Knowledge Base

**Dosyalar:**
- `assets/kb/tips.json`: Öneri veritabanı (~200 öneri)
- `assets/kb/faq.json`: Sık sorulan sorular (~50 soru)

**Tip Format:**
```json
{
  "id": "tip_001",
  "category": "pain",
  "symptomTags": ["cramp", "headache"],
  "phaseTags": ["menstrual"],
  "moodTags": ["tired"],
  "title": "Krampları Hafifletme",
  "content": "Sıcak kompres uygulayın...",
  "source": "Mayo Clinic",
  "priority": "high"
}
```

### Inference Flow

```typescript
// 1. Feature vector oluştur
const features = buildTipFeatures(mood, symptoms, habits, daysSinceLastPeriod);

// 2. Model inference
const scores = await getTipModelScores(features);

// 3. Skorları kullanarak önerileri sırala
const rankedTips = rankTipsByScore(allTips, scores);

// 4. En iyi 3'ü döndür
return rankedTips.slice(0, 3);
```

### Fallback Stratejisi

Model yoksa veya hata olursa:
1. Heuristic-based scoring kullan
2. Semptom/faz eşleşmesine göre öneri seç
3. Priority skoruna göre sırala

**Guardrails:**
- Tıbbi tavsiye uyarısı
- Kritik kelime kontrolü (hamilelik, kanama, şiddetli ağrı)
- Acil durum yönlendirmesi

---

## 🎨 Tema ve Tasarım Sistemi

### Renk Paleti

#### Light Theme

```typescript
const lightColors = {
  // Backgrounds
  bg1: '#FFF6FB',        // Ana arka plan (hafif pembe)
  bg2: '#FFE6F5',        // İkincil arka plan
  white: '#FFFFFF',      // Kart arka planı
  
  // Text
  text: '#333333',       // Ana metin
  sub: '#6B7280',        // Alt metin
  
  // Brand Colors
  pink: '#FF66B2',       // Ana pembe
  pink2: '#FF8FC8',      // Açık pembe
  mint: '#CFF8EE',       // Mint yeşil
  lilac: '#E6D5FF',      // Lila
  rose: '#FFDDE6',       // Gül kurusu
  gold: '#FFD86B',       // Altın
  
  // Cycle Colors
  adetBg: '#FFB6CE',     // Adet günü
  tahminiBg: '#FFD1E2',  // Tahmini adet
  fertilBg: '#BDF5E6',   // Fertil dönem
  ovulasyonBg: '#CDB8FF',// Ovulasyon
  todayBg: '#FFE9B8',    // Bugün
};
```

#### Dark Theme

```typescript
const darkColors = {
  // Backgrounds
  bg: '#17171A',         // Ana arka plan
  bgSoft: '#2C2C2E',     // Kart arka planı
  
  // Text
  text: '#F4F4F5',       // Ana metin
  textDim: '#B4B4B8',    // Alt metin
  
  // Brand (daha canlı)
  pink: '#FF72B3',
  mint: '#8FE6D9',
  lilac: '#C5A8FF',
  
  // Cycle Colors (daha koyu)
  adetBg: '#4A2633',
  tahminiBg: '#3A2E35',
  fertilBg: '#1F4A42',
  ovulasyonBg: '#4A3660',
};
```

### Typography

**Font Family:** Nunito (Google Fonts)
- **Regular:** 400
- **SemiBold:** 600
- **Bold:** 700

**Text Styles:**
```typescript
const typography = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyBold: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  tiny: { fontSize: 11, lineHeight: 14, fontWeight: '400' },
};
```

### Spacing Scale

```typescript
const spacing = (n: number) => n * 8; // 8pt grid system

// Usage:
spacing(1) // 8px
spacing(2) // 16px
spacing(3) // 24px
spacing(4) // 32px
```

### Component Styles

#### Buttons

**Primary Button:**
- Gradient background: `#FF8BC2` → `#FF5BA6`
- Border radius: 24px
- Min height: 48px
- Text: 16px semibold, white
- Press: opacity 0.8, scale 0.98

**Secondary Button:**
- Background: transparent
- Border: 2px pink
- Text: pink

#### Cards

- Border radius: 16px
- Padding: 16px
- Background: white
- Shadow: subtle (elevation 2)

#### Chips

- Border radius: 20px
- Padding: 8px × 16px
- Unselected: gray background
- Selected: gradient background, white text

#### FAB (Floating Action Button)

- Size: 56×56px
- Border radius: 28px
- Gradient background
- Shadow: elevation 4
- Position: bottom-right, 16px margin

### Gradients

```typescript
const gradients = {
  primary: ['#FF8BC2', '#C78BFF', '#9E6BFF'],    // Pembe-mor gradient
  card: ['#FFFFFF', '#F9F9FF'],                  // Hafif kart gradient
  header: ['#E66FD2', '#B59CFF'],                // Header gradient
};
```

### Shadows

```typescript
const shadow = {
  card: {
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
};
```

### Animasyonlar

- **Smooth Transitions:** 300ms cubic-bezier
- **Micro-interactions:** Haptic feedback
- **Loading States:** Skeleton screens
- **Success Feedback:** Confetti + toast

### Accessibility

- **Touch Targets:** Min 48dp (WCAG AA)
- **Color Contrast:** Min 4.5:1
- **Screen Reader:** AccessibilityLabel'lar mevcut
- **Dynamic Type:** Font scaling destekli

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- **Node.js:** v18 veya üzeri
- **npm/yarn:** Güncel versiyon
- **Expo CLI:** Güncel versiyon
- **Android Studio:** (Android için)
- **Xcode:** (iOS için - Mac gerekli)

### 1. Projeyi Klonlama

```bash
git clone <repo-url>
cd CycleMateApp
```

### 2. Bağımlılıkları Yükleme

```bash
npm install
# veya
yarn install
```

### 3. Geliştirme Sunucusunu Başlatma

```bash
npm start
# veya
yarn start
```

### 4. Platformda Çalıştırma

#### Android

```bash
npm run android
# veya
yarn android
```

**Not:** Android emulator veya fiziksel cihaz gerekli.

#### iOS (Mac gerekli)

```bash
npm run ios
# veya
yarn ios
```

#### Web (Deneysel)

```bash
npm run web
# veya
yarn web
```

### 5. Expo Go ile Test

```bash
# QR kod ile
npm start

# Expo Go uygulamasını açın ve QR kodu tarayın
```

**Önemli:** MMKV gibi native modüller Expo Go ile çalışmaz, development build gerekir.

---

## 📦 Build ve Deployment

### Development Build

#### Android

```bash
# Prebuild (native projeler oluştur)
npx expo prebuild --clean

# Development build çalıştır
npx expo run:android
```

### Production Build (EAS)

#### 1. EAS CLI Kurulum

```bash
npm install -g eas-cli
```

#### 2. EAS Login

```bash
eas login
```

#### 3. Build Yapılandırması

**eas.json:**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

#### 4. Build Çalıştırma

**Preview (APK - Test için):**
```bash
eas build --platform android --profile preview
```

**Production (AAB - Play Store için):**
```bash
eas build --platform android --profile production
```

### Local Build (Android Studio)

```bash
# 1. Prebuild
npx expo prebuild --platform android

# 2. Android Studio ile aç veya Gradle ile build et
cd android
./gradlew assembleRelease

# 3. APK yolu:
# android/app/build/outputs/apk/release/app-release.apk
```

### Build Sorun Giderme

#### Permission Denied
```bash
cd android
chmod +x gradlew
```

#### Memory Error
`android/gradle.properties` dosyasına ekle:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

#### SDK Not Found
`android/local.properties` oluştur:
```properties
# Windows
sdk.dir=C:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk

# macOS
sdk.dir=/Users/USERNAME/Library/Android/sdk
```

### Google Play Store Yayınlama

1. **Google Play Console'da uygulama oluştur**
2. **App signing key yapılandır**
3. **AAB dosyasını yükle**
4. **Store listing hazırla:**
   - Başlık: "CycleMate - Adet Takibi"
   - Kısa açıklama (80 karakter)
   - Uzun açıklama
   - Screenshots (5-8 adet)
   - App icon (512×512)

5. **Test sürümü yayınla (Internal Testing)**
6. **Production'a geç**

---

## 🔒 Güvenlik ve Gizlilik

### Veri Saklama Stratejisi

#### Offline-First Yaklaşım
- **Tüm veriler cihazda:** AsyncStorage (şimdilik) / MMKV (gelecekte)
- **Hassas veriler:** Expo SecureStore (PIN kodu)
- **Bulut sync YOK:** Gizlilik öncelikli

#### Veri Şifreleme
- **PIN kodu:** Hashed (PBKDF2 + Salt)
- **Backup dosyaları:** AES-256 (opsiyonel)
- **SecureStore:** Platform native encryption

### PIN ve Biyometrik Güvenlik

#### PIN Kilidi
- 4-6 haneli PIN
- Başarısız deneme sayacı
- 5 başarısız denemeden sonra bekleme süresi
- PIN unutulursa: **Tüm verileri sil** (geri alınamaz)

#### Biyometrik Doğrulama
- Fingerprint (Android)
- Face ID (iOS - gelecekte)
- PIN backup olarak gerekli

### Veri Yedekleme

#### Export
- JSON formatında export
- Şifreleme opsiyonel
- Expo Sharing API ile paylaşım

#### Import
- JSON validation
- Veri integrity kontrolü
- Confirmation modal

### Gizlilik Politikası

**Temel İlkeler:**
1. **Veri toplama YOK:** Hiçbir veri sunucuya gönderilmez
2. **Analytics YOK:** Kullanıcı davranışı izlenmez
3. **Reklam YOK:** Üçüncü parti tracker'lar yok
4. **Cihazda kalır:** Tüm veriler lokal

**Kullanıcı Hakları:**
- Tüm verilere erişim (export)
- Tüm verileri silme
- PIN ile erişim kontrolü

### İzinler

**Gerekli İzinler:**
- **Notifications:** Hatırlatmalar için (opsiyonel)

**GEREKMEYEN İzinler:**
- Internet (sadece ilk kurulum için)
- Konum
- Kamera
- Mikrofon
- Contacts
- Storage (Expo managed ile gerekmiyor)

### Tıbbi Sorumluluk

**Disclaimer:**
> "Bu uygulama tıbbi tavsiye, teşhis veya tedavi yerine geçmez. Düzensiz döngüler, aşırı ağrı veya diğer sağlık endişeleriniz için lütfen bir doktora danışın."

**Guardrails:**
- Kritik kelime kontrolü (hamilelik, kanama, şiddetli ağrı)
- Acil durum yönlendirmesi
- Tahmin doğruluğu uyarısı

---

## 🧪 Test

### Test Stratejisi

#### 1. Unit Tests

**Araçlar:** Jest

**Kapsam:**
- Services (prediction, statistics, tipsService)
- Redux slices (reducers, actions)
- Utility functions (date, validation)

**Çalıştırma:**
```bash
npm test
# veya
npm run test:watch
```

**Mevcut Testler:**
- `src/services/__tests__/prediction.test.ts`
- `src/services/__tests__/statistics.test.ts`

#### 2. Component Tests

**Araçlar:** React Native Testing Library

**Kapsam:**
- Button, Card, Chip gibi base components
- MoodPicker, SymptomGrid gibi feature components

**Mevcut Testler:**
- `src/components/__tests__/`

#### 3. Integration Tests

**Kapsam:**
- Onboarding → Setup → MainTabs flow
- Adet başlat → Calendar update
- Günlük kaydet → Persist
- Raporlar → Statistics hesaplama

**Mevcut Testler:**
- `src/__tests__/App.integration.test.tsx`

#### 4. E2E Tests

**Araçlar:** Detox (opsiyonel)

**Kapsam:**
- Kritik user flow'lar
- Navigation akışları
- Veri persistence

### Coverage Hedefleri

- **Unit Tests:** ≥70%
- **Critical Paths:** 100%
- **Services:** ≥80%

### Test Coverage Raporu

```bash
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Tüm ekranlar gezinilebilir
- [ ] Form validation çalışır
- [ ] Veri persist edilir (app restart)
- [ ] Bildirimler tetiklenir
- [ ] Takvim tahminleri doğru
- [ ] Grafikler doğru render edilir
- [ ] Export/Import çalışır
- [ ] Tema değişimi smooth
- [ ] PIN kilidi çalışır
- [ ] Biyometrik doğrulama çalışır
- [ ] Dark theme uyumlu
- [ ] Dil değişimi çalışır

---

## 🔧 Geliştirme Notları

### Storage Migration (AsyncStorage → MMKV)

**Durum:** MMKV kodu hazır ama geçici devre dışı

**Neden?** MMKV native module olduğu için Expo Go ile çalışmaz. Development build gerekiyor.

**Aktifleştirme Adımları:**

1. **Storage adapter değiştir:**
   - `src/store/index.ts`: `AsyncStorage` → `mmkvStorageAdapter`
   - `src/services/cache.ts`: Aynı değişiklik
   - `src/services/logger.ts`: Aynı değişiklik
   - `src/services/storage.ts`: Aynı değişiklik

2. **Migration çalıştır:**
   - `App.tsx`: Migration kodunu uncomment et

3. **Development build:**
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

**Faydaları:**
- **30x daha hızlı** (AsyncStorage: ~100ms → MMKV: ~3ms)
- Senkron API
- Built-in encryption
- Daha az memory

### AI Model Development

#### Model Eğitimi

**Gereksinimler:**
```bash
pip install -r ml/requirements.txt
```

**Veri Üretimi:**
```bash
cd ml
python generate_synthetic_data.py
```

**Model Eğitimi:**
```bash
python train_model.py --data synthetic_cycle_data.json --output ../assets/models/model.onnx
```

**Parametreler:**
- `--epochs`: Eğitim epoch sayısı (default: 100)
- `--hidden-layers`: Hidden layer boyutları (default: [64, 32])
- `--learning-rate`: Learning rate (default: 0.001)

#### Model Güncelleme

1. Yeni veri üret veya gerçek veri kullan
2. `train_model.py` çalıştır
3. Yeni `model.onnx` dosyası otomatik olarak eskisinin üzerine yazılır
4. Uygulama restart sonrası yeni modeli kullanır

### Development Mode

**DEV_MODE_SHOW_ONBOARDING:**
- `App.tsx` dosyasında bulunur
- `true`: Her açılışta onboarding göster
- `false`: Normal akış (production)

**Kullanım:**
```typescript
const DEV_MODE_SHOW_ONBOARDING = false; // App.tsx içinde
```

### Logger Sistemi

**Seviyeler:**
- `logger.debug()`: Detaylı debug bilgileri
- `logger.info()`: Genel bilgilendirme
- `logger.warn()`: Uyarılar
- `logger.error()`: Hatalar

**Kullanım:**
```typescript
import { logger } from './services/logger';

logger.info('İşlem başladı', { userId: 123 });
logger.error('Hata oluştu', error);
```

**Storage:**
- Loglar MMKV/AsyncStorage'da saklanır
- Max log boyutu: 100 kayıt
- Eski loglar otomatik silinir

### Cache Sistemi

**API:**
```typescript
import { cacheService } from './services/cache';

// Set
await cacheService.set('key', data, ttl);

// Get
const data = await cacheService.get('key');

// Clear
await cacheService.clear('key');
```

**TTL (Time To Live):**
- Default: 1 saat
- Maksimum: 24 saat

### Debugging Tips

#### Redux State Inspecting

**Redux DevTools (Web):**
```bash
npm start -- --web
# Chrome'da açın ve Redux DevTools extension kullanın
```

**React Native Debugger:**
```bash
# Standalone app indir ve çalıştır
# Expo'da "Debug remote JS" seç
```

#### Network Debugging

**Reactotron:**
```bash
npm install --save-dev reactotron-react-native
# Setup kodu ekle
```

#### Performance Profiling

**React DevTools Profiler:**
- Render sürelerini ölç
- Unnecessary re-render'ları tespit et

### Common Issues

#### 1. Metro Bundler Cache

**Sorun:** Değişiklikler yansımıyor

**Çözüm:**
```bash
npm start -- --reset-cache
```

#### 2. Expo Go Limitations

**Sorun:** Native modüller çalışmıyor

**Çözüm:** Development build kullan
```bash
npx expo run:android
```

#### 3. Android Build Hatası

**Sorun:** Gradle build fails

**Çözüm:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

#### 4. TypeScript Errors

**Sorun:** Type errors

**Çözüm:**
```bash
# Type cache temizle
rm -rf node_modules
rm -rf .expo
npm install
```

---

## 🚀 Future Roadmap

### v1.1 (3 ay)

- [ ] Backend entegrasyonu (opsiyonel sync)
- [ ] AI destekli öneriler (OpenAI API ile enhanced)
- [ ] Gelişmiş tahmin algoritması (6 döngü ortalaması)
- [ ] Partnerlık modu (partner ile paylaşım)
- [ ] MMKV migration production'a al

### v1.2 (6 ay)

- [ ] Google Fit / Apple Health entegrasyonu
- [ ] Kilo, uyku, aktivite korelasyonu
- [ ] Sağlık raporu export (PDF)
- [ ] Doktor paylaşımı
- [ ] Widget desteği (Android)
- [ ] iOS versiyonu

### v1.3 (9 ay)

- [ ] Topluluk & forum özelliği
- [ ] Uzman Q&A
- [ ] Premium subscription
- [ ] Advanced analytics (ML-based insights)
- [ ] Wearable entegrasyonu

### v2.0 (12 ay)

- [ ] Hamilelik takibi modu
- [ ] Doğum kontrol hatırlatmaları
- [ ] Kişiselleştirilmiş ürün önerileri (affiliate)
- [ ] Telemetri ve analytics (opt-in)
- [ ] Çoklu profil desteği

---

## 📝 Notlar ve Kaynaklar

### Bilimsel Kaynaklar

- Mayo Clinic - Menstrual Cycle Guide
- American College of Obstetricians and Gynecologists (ACOG)
- National Institutes of Health (NIH)

### Design İlham Kaynakları

- Dribbble - Cycle tracking apps
- Behance - Health app designs
- Material Design 3

### Teknoloji Kaynakları

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [ONNX Runtime](https://onnxruntime.ai/)

### Community

- Expo Discord
- React Native Community
- Women's Health Tech Community

---

## 📧 İletişim ve Destek

**Proje:** CycleMate  
**Versiyon:** 1.0.0  
**Platform:** Android (iOS gelecekte)  
**Lisans:** MIT  

**Destek:**
- GitHub Issues
- Email: support@cyclemateapp.com
- FAQ: Uygulama içi "Destek" bölümü

---

## 🙏 Katkıda Bulunanlar

Bu proje, kadınların sağlık ve wellness yolculuklarında yanlarında olmak için geliştirilmiştir.

**Geliştirme Ekibi:**
- Frontend Development
- AI/ML Engineering
- UI/UX Design
- Medical Consultation

**Teşekkürler:**
- Tüm beta testerlerimize
- Geri bildirimde bulunan kullanıcılarımıza
- Open-source community'ye

---

**🌸 Kendine iyi bak, CycleMate seninle! 🌸**

---

*Son Güncelleme: 10 Ekim 2025*  
*Dokümantasyon Versiyonu: 1.0.0*

