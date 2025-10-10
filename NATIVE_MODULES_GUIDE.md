# 🔧 Native Modüller Aktivasyon Rehberi

**Durum:** 2 native module hazır ama Expo Go ile çalışmıyor

---

## 📦 NATIVE MODÜLLER

### 1. react-native-mmkv (30x Hızlı Storage)
- ✅ Yüklü
- ✅ Kod hazır
- ⏸️ Geçici devre dışı (AsyncStorage kullanılıyor)

### 2. onnxruntime-react-native (AI Model)
- ✅ Yüklü
- ✅ Model eğitildi (assets/models/model.onnx)
- ✅ Kod hazır
- ⏸️ Geçici devre dışı (AI_ENABLED = false)

---

## ❓ NEDEN ÇALIŞMIYOR?

Expo Go **custom native modülleri desteklemez**.

**Çözüm:** Development Build veya Production Build gerekiyor.

---

## 🚀 AKTİFLEŞTİRME (2 Yöntem)

### Yöntem A: EAS Build (Cloud Build - Önerilen)

#### 1. EAS CLI Yükle
```bash
npm install -g eas-cli
```

#### 2. EAS Login
```bash
eas login
```
(Expo hesabın ile giriş yap)

#### 3. EAS Build Config Oluştur
```bash
eas build:configure
```

#### 4. Development Build Oluştur
```bash
eas build --profile development --platform android
```

**Süre:** ~10-15 dakika (cloud'da build alınır)

**Çıktı:** APK dosyası download linki

#### 5. APK'yı İndir ve Cihaza Yükle
- Link'ten APK indir
- Cihaza kur
- Uygulamayı aç

#### 6. Native Modülleri Aktif Et

**Tüm dosyalarda şu değişiklikleri yap:**

`src/store/index.ts`:
```typescript
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { mmkvStorageAdapter } from '../services/mmkvStorage';

storage: mmkvStorageAdapter,
```

`src/services/cache.ts`, `logger.ts`, `storage.ts`:
```typescript
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { mmkvStorageAdapter } from './mmkvStorage';
const storageAdapter = mmkvStorageAdapter;
```

`App.tsx`:
```typescript
import { migrateAsyncStorageToMMKV, isMigrationCompleted } from './src/services/migration';
// performMigration() uncomment et
```

`src/services/aiPlaceholders.ts`:
```typescript
export const AI_ENABLED = true;
```

#### 7. Tekrar Build Al
```bash
eas build --profile development --platform android
```

---

### Yöntem B: Local Build (Cihaz Bağlı Olmalı)

#### 1. Android Studio Kur
- [Android Studio](https://developer.android.com/studio) indir
- Android SDK yükle
- Emulator oluştur VEYA cihazı USB ile bağla

#### 2. USB Debugging Aç
- Cihazda: Ayarlar → Geliştirici Seçenekleri → USB Debugging

#### 3. Cihazı Kontrol Et
```bash
adb devices
```
Çıktı: Cihazını görmeli

#### 4. Native Modülleri Aktif Et (Yukarıdaki değişiklikleri yap)

#### 5. Build & Run
```bash
npx expo run:android
```

**Süre:** İlk build ~10 dakika

---

## 📊 PERFORMANS KARŞILAŞTIRMA

### Şu An (AsyncStorage)
- Storage: ~100ms/operation
- AI: Devre dışı

### Build Sonrası (MMKV + AI)
- Storage: ~3ms/operation (**30x hızlı!**)
- AI: Aktif (akıllı öneriler)

---

## 🎯 ÖNERİ

### Test İçin (Şu An)
✅ AsyncStorage ile test et
✅ AI features olmadan da uygulama tam çalışıyor
✅ Tüm diğer özellikler aktif

### Production Build İçin
🔄 Native modülleri aktif et
🔄 Development/Production build al
✅ MMKV + AI tam performans

---

## 📝 HIZLI AKTİFLEŞTİRME CHECKLİST

- [ ] `src/store/index.ts` → AsyncStorage → mmkvStorageAdapter
- [ ] `src/services/cache.ts` → AsyncStorage → mmkvStorageAdapter
- [ ] `src/services/logger.ts` → AsyncStorage → mmkvStorageAdapter
- [ ] `src/services/storage.ts` → AsyncStorage → mmkvStorageAdapter
- [ ] `App.tsx` → performMigration() uncomment
- [ ] `src/services/aiPlaceholders.ts` → AI_ENABLED = true
- [ ] Development build al
- [ ] Test et

---

**Şimdilik AsyncStorage + AI disabled ile test edebilirsin!** ✅


