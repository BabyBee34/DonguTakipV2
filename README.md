# 🌸 CycleMate - Adet Takip Uygulaması

CycleMate, kadınların regl döngülerini, ruh hallerini ve semptomlarını kolayca takip etmelerini sağlayan, **tıbbi doğruluğu** ön planda tutan bir React Native uygulamasıdır.

## ✨ Özellikler

### 📅 Akıllı Takvim
- Aylık takvim görünümü
- Gerçek ve tahmini adet günleri
- Fertil pencere gösterimi
- Ovulasyon tahmini
- Tek dokunuşla adet başlatma/bitirme

### 📖 Günlük Takip
- 9 farklı ruh hali seçeneği
- 19 semptom kategorisi
- Kişisel notlar
- Akıllı öneri sistemi

### 📊 Detaylı İstatistikler
- Ortalama döngü ve adet süresi
- Döngü geçmişi grafikleri
- En sık görülen semptomlar
- Ruh hali trend analizi

### ⚙️ Özelleştirilebilir Ayarlar
- Döngü tercihleri
- Bildirim ayarları
- Tema seçimi (Açık/Koyu)
- Veri yönetimi

### 🔔 Akıllı Bildirimler
- Günlük kayıt hatırlatması
- Su içme bildirimi
- Yaklaşan adet bildirimi

### 🔒 Gizlilik ve Güvenlik
- Tüm veriler cihazda saklanır
- AsyncStorage ile offline çalışma
- Bulut senkronizasyonu yok (opsiyonel olarak eklenebilir)

## 🛠️ Teknoloji Stack

- **Platform:** Expo React Native (Android)
- **State Management:** Redux Toolkit + Redux Persist
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Depolama:** AsyncStorage
- **Grafikler:** Victory Native
- **Bildirimler:** expo-notifications
- **Dil:** TypeScript

## 📦 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI
- Android Studio (Android için) veya Xcode (iOS için)

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone <repo-url>
cd CycleMateApp
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
# veya
yarn install
```

3. **Uygulamayı başlatın:**
```bash
npm start
# veya
yarn start
```

4. **Android cihazda çalıştırın:**
```bash
npm run android
# veya
yarn android
```

5. **iOS cihazda çalıştırın (Mac gerekir):**
```bash
npm run ios
# veya
yarn ios
```

## 📱 Build

### Geliştirme Build'i (Development)

Geliştirme ortamında çalışmak için:

```bash
# Android
npx expo run:android

# iOS (macOS gerekli)
npx expo run:ios
```

### Android APK Oluşturma (Preview/Test)

1. **EAS CLI yükleyin:**
```bash
npm install -g eas-cli
```

2. **Expo hesabınızla giriş yapın:**
```bash
eas login
```

3. **İlk kez build yapıyorsanız, yapılandırma oluşturun:**
```bash
eas build:configure
```

4. **Preview APK build (Test için):**
```bash
eas build -p android --profile preview
```

Bu komut, test için APK dosyası oluşturur. Build tamamlandığında QR kod veya link ile APK'yı indirebilirsiniz.

### Production Build (Google Play Store)

Play Store'a yüklemek için AAB (Android App Bundle) oluşturun:

```bash
eas build -p android --profile production
```

**Not:** Production build için aşağıdaki adımları tamamlamanız gerekir:
1. Google Play Console'da uygulama oluşturun
2. App signing key'i yapılandırın
3. `eas.json`'da service account ayarlarını yapın

### Local Build (Bilgisayarınızda)

Expo prebuild ile native projeler oluşturup Android Studio ile build edebilirsiniz:

```bash
# Prebuild
npx expo prebuild --platform android

# Android Studio ile projeyi açın
# veya
cd android
./gradlew assembleRelease
```

Build edilen APK: `android/app/build/outputs/apk/release/app-release.apk`

### Build Sorun Giderme

**Sorun:** "gradlew: Permission denied"
**Çözüm:**
```bash
cd android
chmod +x gradlew
```

**Sorun:** Build sırasında memory hatası
**Çözüm:** `android/gradle.properties` dosyasına ekleyin:
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

**Sorun:** "SDK location not found"
**Çözüm:** `android/local.properties` dosyası oluşturun:
```
sdk.dir=/Users/USERNAME/Library/Android/sdk  # macOS
sdk.dir=C:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk  # Windows
```

## 🗂️ Proje Yapısı

```
CycleMateApp/
├── src/
│   ├── components/        # Reusable UI bileşenleri
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Chip.tsx
│   ├── screens/          # Ekranlar
│   │   ├── onboarding/   # Onboarding flow
│   │   ├── setup/        # İlk kurulum
│   │   ├── navigation/   # Tab navigation
│   │   ├── CalendarScreen.tsx
│   │   ├── DailyLogScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # İş mantığı servisleri
│   │   ├── prediction.ts       # Tahmin algoritması
│   │   ├── statistics.ts       # İstatistik hesaplamaları
│   │   ├── tipsService.ts      # Öneri sistemi
│   │   └── notificationService.ts
│   ├── store/            # Redux state management
│   │   ├── index.ts
│   │   └── slices/
│   ├── theme/            # Tasarım sistemi
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── gradients.ts
│   ├── types/            # TypeScript tipleri
│   │   └── index.ts
│   └── utils/            # Yardımcı fonksiyonlar
│       └── date.ts
├── assets/               # Görseller ve fontlar
├── App.tsx              # Ana uygulama
├── app.json             # Expo konfigürasyonu
├── package.json         # Bağımlılıklar
└── tsconfig.json        # TypeScript konfigürasyonu
```

## 🔬 Bilimsel Temel

CycleMate, menstrual döngü takibinde tıbbi doğruluğu ön planda tutar:

### Döngü Fazları
1. **Menstrual Faz** (Gün 1-5): Adet dönemi
2. **Foliküler Faz** (Gün 6-13): Enerji yükselişi
3. **Ovulasyon** (Gün 14±2): Döl verme zirvesi
4. **Luteal Faz** (Gün 15-28): PMS belirtileri

### Tahmin Algoritması
```
Ovulasyon Günü = Son Adet Başlangıcı + (Döngü Süresi - 14)
Fertil Pencere = Ovulasyon Günü ±5 gün
```

## 🔔 Bildirimler

Uygulama şu bildirim türlerini destekler:
- **Günlük Kayıt:** Belirlenen saatte günlük kaydı hatırlatır
- **Su İçme:** Sıklık ayarına göre (Düşük/Orta/Yüksek)
- **Yaklaşan Adet:** Tahmin edilen tarihin 2 gün öncesi

## ⚠️ Önemli Not

**Bu uygulama tıbbi tavsiye yerine geçmez.** Düzensiz döngüler, aşırı ağrı veya diğer sağlık endişeleriniz için lütfen bir doktora danışın.

## 🎨 Tasarım

Uygulama, modern ve kullanıcı dostu bir arayüz sunar:
- **Pastel Renk Paleti:** Rahatlatıcı ve kadınsı
- **Gradient Efektler:** Estetik buton ve kartlar
- **Smooth Animasyonlar:** Akıcı kullanıcı deneyimi
- **Responsive Design:** Farklı ekran boyutlarına uyumlu

## 🧪 Test

Projeye test coverage'ı eklenmiştir:

```bash
# Tüm testleri çalıştır
npm test

# Watch modda çalıştır
npm run test:watch

# Coverage raporu
npm run test:coverage
```

**Test Dosyaları:**
- Unit testler: `src/**/__tests__/*.test.ts(x)`
- Integration testler: `src/__tests__/*.integration.test.tsx`
- Component testleri: `src/components/__tests__/*.test.tsx`

**Test Coverage Hedefleri:**
- Unit testler: ≥70%
- Critical path'ler: 100%

## 📱 Google Play Store Listing

### Başlık
```
CycleMate - Adet Takibi & Döngü Takvimi
```

### Kısa Açıklama (80 karakter)
```
Döngünü takip et, kendini daha iyi tanı 🌸 Akıllı takvim, öneri & istatistikler
```

### Uzun Açıklama
```
CycleMate ile regl döngünü kolayca takip et, kendini daha iyi tanı! 🌸

✨ ÖZELLİKLER

📅 Akıllı Takvim
• Görsel ay görünümü
• Gerçek ve tahmini adet günleri
• Fertil pencere ve ovulasyon tahmini
• Tek dokunuşla adet başlat/bitir

📖 Günlük Takip
• 9 farklı ruh hali seçeneği
• 19 detaylı semptom kategorisi
• Kişisel notlar
• Semptomlara özel akıllı öneriler

📊 Detaylı İstatistikler
• Ortalama döngü ve adet süresi
• Döngü geçmişi grafikleri
• En sık semptomlar analizi
• Ruh hali trend takibi

💡 Akıllı Öneriler
• Her semptom için kanıta dayalı öneriler
• Döngü fazına göre kişiselleştirilmiş ipuçları
• Tıbbi kaynaklara dayalı bilgiler

🔔 Hatırlatmalar
• Günlük kayıt bildirimleri
• Yaklaşan adet uyarıları
• Su içme hatırlatmaları
• Özelleştirilebilir bildirim sıklığı

🔒 GİZLİLİK & GÜVENLİK
• Tüm veriler cihazınızda güvende
• Bulut senkronizasyonu yok
• Offline çalışır
• Veri export/import desteği

🎨 MODERN TASARIM
• Pastel renk paleti
• Gradient efektler
• Smooth animasyonlar
• Karanlık tema desteği

🌍 TÜRKÇE & İNGİLİZCE
• Tam Türkçe destek
• İngilizce dil seçeneği

⚠️ ÖNEMLİ NOT
Bu uygulama tıbbi tavsiye yerine geçmez. Düzensiz döngüler veya sağlık endişeleriniz için lütfen bir doktora danışın.

🌸 Kendine iyi bak, CycleMate seninle!

---

ANAHTAR KELİMELER: adet takvimi, regl takibi, döngü takibi, adet günleri, ovulasyon takvimi, fertil dönem, PMS takibi, ruh hali takibi, semptom günlüğü, kadın sağlığı, menstrüel döngü, period tracker
```

### Kategori
```
Sağlık ve Fitness
```

### Hedef Yaş Grubu
```
16+
```

### İletişim
```
E-posta: support@cyclemateapp.com
Website: (varsa eklenecek)
Gizlilik Politikası: (URL eklenecek)
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📧 İletişim

Sorularınız veya önerileriniz için lütfen iletişime geçin.

---

**Sürüm:** 1.0.0  
**Son Güncelleme:** Ekim 2025  

🌸 Kendinize iyi bakın!

