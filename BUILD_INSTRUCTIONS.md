# 🔧 MMKV AKTİFLEŞTİRME TALİMATLARI

**Durum:** MMKV kodu hazır ama geçici olarak devre dışı (AsyncStorage kullanılıyor)

---

## 📋 MMKV'Yİ AKTİF ETMEK İÇİN

### Neden Geçici Devre Dışı?

`react-native-mmkv` **native module** olduğu için Expo Go ile çalışmaz.
**Development build** veya **production build** gerekiyor.

---

## 🚀 AKTİFLEŞTİRME ADIMLARI

### Adım 1: Storage Adapter Değişiklikleri

#### `src/store/index.ts`
```typescript
// ŞU AN:
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { mmkvStorageAdapter } from '../services/mmkvStorage'; // Build sırasında aktif edilecek

const persistConfig = {
  key: 'root',
  storage: AsyncStorage, // TODO: Build sırasında mmkvStorageAdapter'a çevir
  ...
}

// AKTİF ETMEK İÇİN:
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { mmkvStorageAdapter } from '../services/mmkvStorage';

const persistConfig = {
  key: 'root',
  storage: mmkvStorageAdapter, // MMKV (30x daha hızlı!)
  ...
}
```

#### `src/services/cache.ts`
```typescript
// ŞU AN:
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { mmkvStorageAdapter } from './mmkvStorage';
const storageAdapter = AsyncStorage;

// AKTİF ETMEK İÇİN:
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { mmkvStorageAdapter } from './mmkvStorage';
const storageAdapter = mmkvStorageAdapter;
```

#### `src/services/logger.ts`
```typescript
// Aynı değişiklik (AsyncStorage -> mmkvStorageAdapter)
```

#### `src/services/storage.ts`
```typescript
// Aynı değişiklik (AsyncStorage -> mmkvStorageAdapter)
```

#### `App.tsx`
```typescript
// ŞU AN:
// import { migrateAsyncStorageToMMKV, isMigrationCompleted } from './src/services/migration';
// performMigration(); // Commented

// AKTİF ETMEK İÇİN:
import { migrateAsyncStorageToMMKV, isMigrationCompleted } from './src/services/migration';
// performMigration(); çağrısını uncomment et
```

---

### Adım 2: Development Build

```bash
# Android için
npx expo prebuild --clean
npx expo run:android

# VEYA production build
eas build --platform android
```

---

## ⚡ MMKV FAYDALARI

- **30x daha hızlı** (AsyncStorage: ~100ms → MMKV: ~3ms)
- **Senkron API** (async wrapper ile)
- **Built-in encryption**
- **Daha az memory kullanımı**

---

## 📱 ŞU AN TEST İÇİN

**AsyncStorage ile çalışıyor** - Normal hızda ama stabil!

Test tamamlandıktan sonra build alırken MMKV'yi aktif edebilirsin.

---

**TODO Notları:**
Tüm dosyalarda `// TODO: Build sırasında mmkvStorageAdapter'a çevir` yorumları var.
Bu yorumları arayıp değişiklikleri yapman yeterli.

