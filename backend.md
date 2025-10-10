# Cihaz Ici Veri Plani

## Genel Bakis
- Uygulama verisi tamamen cihazda kalacak; bulut servisi, internet baglantisi veya ucretli API kullanilmamalidir.
- Mevcut mimari Redux Persist + AsyncStorage uzerine kurulu; daha yapisal bir veri hizmeti katmanina ihtiyac var.
- Bu dokuman cikartilacak is kalemlerini, ozellikle cihaz ici yapay zeka entegrasyonunu ve arayuzu bozmadan uyulmasi gereken noktalari listeler.

## Alan Bazinda Gorevler

### 1. Veri Depolama Katmani
- `AsyncStorage` yerine daha performansli ve tutarli bir cozum (ornegin `react-native-mmkv` veya SQLite) degerlendirilmelidir (`src/store/index.ts:8`, `src/services/storage.ts:8`).
- Tablolar arasi tum erisimi tek noktada yoneten bir `DataRepository` katmani olusturulmalidir (`src/services/storage.ts:13`, `src/services/backupService.ts:17`).
- Okuma ve yazma islemleri try/catch ile sarilarak hata mesajlari arayuzde kullaniciya bildirilmeli (`src/services/storage.ts:59`, `src/services/backupService.ts:67`).

### 2. Kimlik Koruma ve Yetkilendirme
- PIN ve biyometrik kilit icin basarisiz deneme sayaci, gecici kilitleme ve sifre kurtarma senaryolari gozden gecirilmelidir (`src/components/AuthGate.tsx:20`, `src/services/pinService.ts:11`).
- PIN kaldirildiginda Redux store ve tum kalici depolamayi temizleyecek bir `wipeDeviceData()` fonksiyonu yazilmalidir (`App.tsx:145`, `src/services/storage.ts:63`).
- Gunlukler ve yedek dosyalari icin yerel AES sifreleme gibi ek guvenlik onlemleri degerlendirilmelidir (`src/services/backupService.ts:17`).

### 3. Gunluk ve Period Yonetimi
- Gunluk duzenleme ekraninin mevcut kayittan semptom ve aliskanliklari state icine yuklemesi saglanmalidir (`src/screens/DailyLogScreen.tsx:50`, `src/screens/DailyLogScreen.tsx:113`).
- Ayni tarih icin yinelenen log kayitlarini engelleyecek kontroller Redux slice seviyesinde eklenmelidir (`src/store/slices/logsSlice.ts:7`).
- Period kayitlarinda `cycleLengthDays` ve `periodLengthDays` otomatik hesaplanip saklanmalidir (`src/store/slices/periodsSlice.ts:12`, `src/screens/setup/SetupLastPeriod.tsx:28`).
- Veri katmaninda opsiyonel bir `revision` alani tutularak olasi cakismalarin tespiti icin temel saglanmalidir.

### 4. Analitik ve Istatistik Motoru
- `statistics.ts` fonksiyonlari, log verisindeki semptom nesneleri ve eksik `flow` alanlari dikkate alinacak sekilde guncellenmelidir (`src/services/statistics.ts:22`, `src/types/index.ts:41`).
- Enerji ve uyku trendleri icin gereken `flow` ve `habits` bilgileri toplanmali veya algoritmalar yeniden yazilmalidir (`src/services/statistics.ts:139`, `src/utils/reportsFilters.ts:32`).
- Analitik sonuclar cihazda cachelenerek ekran acilisinda hizli gosterim saglanmalidir (`src/screens/ReportsScreen.tsx:76`).

### 5. Oneri Motoru Temelleri
- ✅ `tipsService.ts` artik cihaz icinde tutulan bilgi bankasini ve (varsa) ONNX skorlarini kullanarak semptom, faz ve duygu sinyallerine gore onerileri puanliyor (`src/services/tipsService.ts`, `src/services/aiModel.ts`).
- ✅ DailyLog ve Calendar ekranlari placeholder yerine yerel onerileri gosteriyor; bilgi bankasi JSONlari `assets/kb/` altina tasindi (`src/screens/DailyLogScreen.tsx`, `src/screens/CalendarScreen.tsx`).
- ➡️ Sonraki adim: ONNX model skorlarini `computeFeatureBonus` ile harmanlayacak sekilde `features` vektorunu genisletmek; kullanicinin begen/begenme geri bildirimlerini tutacak basit bir hafiza eklemek.

### 6. Bildirimler ve Planlama
- `notificationSlice` ile `notificationService` ayni veri semasini kullanacak sekilde refactor edilmeli (`src/store/slices/notificationSlice.ts:18`, `src/services/notificationService.ts:119`).
- String saat degeri donduren fallback fonksiyonu duzeltilecek ve eksik bayraklar eklenecektir (`src/services/notificationService.ts:321`).
- Expo bildirim izin durumu ve planlanmis bildirim sayisini saklayan yerel bir kayit olusturulup ayarlar ekraninda gosterilmelidir (`src/screens/SettingsScreen.tsx:96`).
- Yaklasan period bildirimleri icin uretilecek tarih listesi cachelenmeli ve yeniden kullanilabilir hale getirilmelidir (`src/utils/notify.ts:48`, `src/services/notificationService.ts:191`).

### 7. Yedekleme ve Ice Aktarma
- ✅ `BackupData` �emas�� semptom siddeti ve al��kanl��k alanlar�� ile g��ncelle�Ytirildi; export/import ak��lar�� normalize edilmi�Y veriyi kullan��yor (`src/services/backupService.ts`, `src/types/backup.ts`, `src/services/symptomUtils.ts`).
- ➡️ Sonraki ad�m: eski yedek dosyalar�� i�in geriye d��k uyumluluk testi ve otomatik migrasyon notu haz��rlamak (manual QA).
- ↗️ Yedek dosyalar��n�� istege ba�l�� sifrelemek ve payla�Ymadan �nce kullan��c��y�� uyarmak i�in UI eklenmeli (`src/services/backupService.ts:40`).
- ↗️ Import sonras��nda Redux aksiyonlar�� ile store g��ncellenmesine devam; Settings ekran��nda i�lem tamam mesaj�� g��ncellenmeli (`src/screens/SettingsScreen.tsx:279`).

### 8. Altyapi, Gozlemlenebilirlik ve Guvenlik
- `USE_API` bayragi kapali tutulacak; uzak API cagrilari koruyucu kosullarla cevrilmelidir (`src/services/api.ts:84`, `src/services/tipsService.ts:25`).
- Cihaz icinde hata kaydi tutmak icin merkezi bir logger yazilmali ve kritik hatalar Toast ile gosterilmelidir (`src/components/Toast.tsx:12`, `src/components/ErrorBoundary.tsx:8`).
- Yedekleme, PIN degistirme ve veri silme gibi islemler kullanici onayi ve haptik geri bildirimle desteklenmelidir (`src/screens/SettingsScreen.tsx:343`).
- Log kayitlarinda hassas bilgiler maskelenmeli ve gizlilik politikasina uyum dokumante edilmelidir.

## Yapay Zeka Yol Haritasi

### 9. Bilgi Bankasi ve Veri Toplama
- ✅ Faz bazli ipuclar�� ve FAQ maddeleri `assets/kb/` alt��nda versiyonlanabilir JSON format��na cekildi (`assets/kb/tips.json`, `assets/kb/faq.json`).
- ✅ `knowledgeBase.ts` tek seferlik cache ile tiplenmi�Y veriyi uygulamaya aktariyor (`src/services/knowledgeBase.ts`, `src/types/ai.ts`).
- ➡️ G��ncelleme stratejisi: ileride JSON versiyon bilgisini kontrol edip UI taraf��nda “bilgi bankasi g��ncellendi” bildirimi g��sterilecek.

### 10. Ozellik Muhendisligi (Feature Builder)
- ✅ `buildTipFeatures` yardimcisi mood, semptom siddeti, aliskanlik ve cikis tarihine gore normalize edilmis vektor uretir (`src/services/featureBuilder.ts`).
- ➡️ Sonraki adim: `ml/train_model.py` ile uretilen ONNX modeli gercek verilerle egitip agirliklari finalize etmek.

### 11. Yerel Model Egitimi ve Pipeline
- ✅ `ml/train_model.py` sahte veri ile MLP pipeline egitip modeli ONNX/quantize eden ornek scripti saglar.
- ✅ Pipeline ONNX + dynamic quantization ile `assets/models/model.onnx` dosyasini uretir (model yoksa uygulama heuristik moda donar).
- ✅ Model bulunamazsa servis otomatik olarak heuristik skorlara doner (`src/services/aiModel.ts`).

### 12. Cihaz Ici Calistirma (Inference)
- ONNX Runtime Mobile veya `onnxruntime-react-native` kullanarak `runModel(features)` fonksiyonunu hayata gecirin (`yapay.md` satirlarinda verilen `runModel`, `getOrtSession`, `getModelUri` ornekleri). Model dosyasi sadece gerekli oldugunda cache dizinine kopyalanmalidir.
- `AI_ENABLED` bayragi dinamik hale getirilerek model mevcut olmadiginda otomatik kapali kalmalidir (`src/services/aiPlaceholders.ts`).
- `aiHooks.ts` icinde toplanan mood ve semptom sinyalleri model ozellikleri ile uyumlu formatta cachelenmelidir.

### 13. Oneri Harmanlama ve UI Entegrasyonu
- ✅ DailyLog ve Calendar ekranlarinda placeholder yerine yerel+model harmanli oneriler gosteriliyor (`src/screens/DailyLogScreen.tsx`, `src/screens/CalendarScreen.tsx`).
- ➡️ Model skorlarini devreye aldiktan sonra `computeFeatureBonus` agirliklari yeniden kalibre edilecek; kullanici geri bildirimi (begen/begenme) icin hafif bir UI eklenecek.
- ➡️ Raporlar ekraninda (henuz degismedi) ilk onerileri gosteren bir blok eklenmeli.

### 14. Chatbot / Soru-Cevap Modulu
- ✅ `faqService.searchFaq` yerel JSON uzerinde anahtar kelime/tags eslesmesi yapan basit arama sagliyor (`src/services/faqService.ts`).
- ✅ "Soru & Cevap Asistani" icin lokal arama yapan ekran olusturuldu (`src/screens/chat/ChatScreen.tsx`, `src/screens/navigation/ChatStack.tsx`) ve Ayarlar > Destek altindan aciliyor.
- ➡️ Guardrail: kritik kelime listesine otomatik olarak yeni senaryolar eklenmeli ve yaklasimdaki mesajlar lokalize edilmeli.

### 15. Veri Gizliligi ve Performans
- Model egitimi icin kullanilan tum veriler anonim olmalidir; cihazda tutulan log verisi hicbir sekilde disari aktarilmamalidir.
- Model calisma suresi, bellek kullanimi ve dosya boyutu yavas cihazlar icin test edilmelidir. Gerekirse ozellik sayisi azaltin veya model mimarisini sadelestirin.
- Hata durumlarinda AI bolumu gracefully degrade etmeli; UI'da placeholder mesajlari gosterilmeye devam etmelidir.

## Veri Modeli Uyumlulugu
- `DailyLog` tipine `symptoms: {id:string; severity:number}[]`, `habits: HabitKey[]` ve opsiyonel `flow` alanlari eklenmeli; ilgili slice ve servisler bu formata uyarlanmalidir (`src/types/index.ts:41`, `src/store/slices/logsSlice.ts:7`).
- `BackupJournalEntry` mood anahtarlari uygulamadaki degerlerle (happy, calm vb.) eslestirilmeli ve aliskanlik verisi eklenmelidir (`src/types/backup.ts:17`).
- `NotificationSettings` yapisi her yerde `{ enabled, frequency, reminderTime {hour, minute}, ... }` seklinde tutulmali, string saat formatindan kacinilmalidir (`src/store/slices/notificationSlice.ts:18`, `src/services/notificationService.ts:321`).
- `AppState` icindeki `notification` ve `notifications` isimleri tutarlilastirilmalidir (`src/types/index.ts:77`).

## Frontend Hata ve Tutarsizliklari
- `DailyLogScreen` mevcut kaydi yuklerken semptom ve aliskanlik bilgilerini state'e aktarmadigi icin duzenlemede veri kaybi oluyor (`src/screens/DailyLogScreen.tsx:50`).
- Gunlukler semptomu nesne olarak saklarken analitik fonksiyonlar string bekliyor; rapor hesaplari yanlis cikiyor (`src/services/statistics.ts:22`, `src/screens/ReportsScreen.tsx:166`).
- Rapor filtreleri `log.flow` alanina bagimli fakat UI bu veriyi toplamiyor (`src/utils/reportsFilters.ts:32`).
- Yedekleme servisinde `state.notification.*` ve `log.notes` alanlari hatali kullanim nedeniyle kayboluyor (`src/services/backupService.ts:21`, `src/services/backupService.ts:33`).
- Ice aktarma sonrasinda Redux guncellenmedigi icin kullanici verileri ekranda gorunmuyor (`src/screens/SettingsScreen.tsx:279`).
- `DEV_MODE_SHOW_ONBOARDING` surekli `true`; uygulama her acilista onboarding ekranina donuyor (`App.tsx:47`).
- PIN kaldirma islemi tum verinin silinecegini soyluyor fakat gercek silme yapilmiyor (`App.tsx:145`).
- Bildirim fallback fonksiyonu hatali tip donduruyor; planlanan bildirimler yanlis saatte tetiklenebiliyor (`src/services/notificationService.ts:321`).

Bu gorevler tamamlandiginda uygulama verileri tamamen cihaz uzerinde, guvenli ve tutarli sekilde calisirken yapay zeka ozellikleri de offline olarak devreye alinabilir.
