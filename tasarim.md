# CycleMate Tasarım İncelemesi

## Özet
- Yüksek öncelikli üç kritik UI sorunu: tema/dark-mod uyumsuzluğu (ör. `src/screens/CalendarScreen.tsx:123`, `src/screens/setup/SetupCycleLength.tsx:44`), takvimde 6. hafta görünmemesi (`src/screens/CalendarScreen.tsx:51`) ve onboarding/kurulum akışlarında i18n'in atlanması (`src/screens/onboarding/OnbWelcome.tsx:156`, `src/screens/setup/SetupLastPeriod.tsx:66`).
- Orta öncelikli 12 tasarım/UX iyileştirmesi belirlendi; bunlar erişilebilirlik (safe-area, ikon dili, durum geri bildirimi) ve etkileşim tutarlılığına odaklanıyor.
- Aksiyon planı: önce tema & layout temizliklerini yapmak, ardından akış bazlı düzeltmeleri (onboarding, takvim, günlük kayıt, ayarlar) ele almak ve son olarak bileşen kütüphanesini güçlendirmek.

## 1. Genel Tasarım Sistemi

### 1.1 Tema tokenlarının atlanması (Yüksek)
- Gözlem: Birçok ekran doğrudan hex değerlerine ve açık renk degradelerine bağlı (`src/screens/CalendarScreen.tsx:123`, `src/screens/setup/SetupLastPeriod.tsx:50`, `src/screens/onboarding/OnbReminders.tsx:53`). Bu yaklaşım temayı/dark modu devre dışı bırakıyor.
- Etki: Dark tema seçildiğinde arka planla metin kontrastı çöküyor, bakım maliyeti artıyor.
- Öneri: Tüm renk, gradient ve gölge değerlerini `ThemeProvider` token'larına taşı; gerekirse `gradients` için açık/koyu varyantlar tanımla ve `useTheme()` üzerinden tüket.

### 1.2 Safe-area ve responsive altyapı eksikliği (Yüksek)
- Gözlem: Çoğu üst düzey ekran, cihaz çentiğini hesaba katmadan `ScrollView` kullanıyor (örn. `src/screens/onboarding/OnboardingScreen.tsx:23`, `src/screens/DailyLogScreen.tsx:47`, `src/screens/SettingsScreen.tsx:320`). Skip butonu (`OnboardingScreen.tsx:47`) ve status-bar mesajları (`src/components/Toast.tsx:106`) iOS'ta statü çubuğunun altında kalıyor.
- Etki: Özellikle iPhone çentikli veya Android gesture cihazlarda ilk satırların okunmaması, CTA'ların görünmemesi gibi kritik kullanılabilirlik sorunları.
- Öneri: `SafeAreaView` veya `useSafeAreaInsets` ile üst/alt boşlukları yönetin, `ScrollView`'larda `contentContainerStyle` ile padding ekleyin, toast ve modal gibi overlay bileşenlere inset enjekte edin.

### 1.3 Emoji tabanlı ikonografi (Orta)
- Gözlem: Ana aksiyonlar ve durum göstergeleri için emoji karakterleri kullanılıyor (`src/screens/CalendarScreen.tsx:210`, `src/screens/setup/SetupCycleLength.tsx:102`, `src/components/MoodSelector.tsx:24`). Android'de fonta göre değişiyor, bazı yerlerde soru işareti olarak render oluyor.
- Etki: Tutarsız görünüm, erişilebilirlik okuyucularının "smiling face" gibi anlamsız etiketler okuması, marka dilinin dağılması.
- Öneri: Vektör ikon seti (MaterialIcons, Heroicons vs.) üzerinden anlamlı piktogramlar seç, ekran okuyucu etiketlerini `accessibilityLabel` ile ayarla; emoji kullanacaksan dekoratif sınırlarda bırak.

### 1.4 Statik boyut ve orientation desteği (Orta)
- Gözlem: `Dimensions.get('window')` ilk render'da alınarak tekrar güncellenmiyor (`src/screens/CalendarScreen.tsx:36`, `src/screens/DailyLogScreen.tsx:27`). Takvim hücre genişliği sabit `CELL_SIZE = 48`.
- Etki: Tablet, yatay mod veya küçük ekranlarda grid taşması, içerik kırpılması.
- Öneri: `useWindowDimensions()` veya `Dimensions.addEventListener` ile dinamik ölçü al; takvimde hücre genişliğini yüzde bazlı hesapla, min/max koy.

### 1.5 Yerelleştirme tutarsızlıkları (Yüksek)
- Gözlem: Onboarding ve Setup ekranları tamamen hard-coded TR metinler içeriyor (`src/screens/onboarding/OnbWelcome.tsx:156`, `src/screens/setup/SetupPeriodLength.tsx:74`), symptom kategorileri `SymptomGrid` içinde gömülü (`src/components/SymptomGrid.tsx:13`).
- Etki: Uygulama dili değiştiğinde Türkçe/İngilizce karışımı arayüz, bakım zorluğu.
- Öneri: Metinleri `i18n` dosyalarına taşı, kategori struct'ını `t()` ile üretilen label'larla genişlet; onboarding alt başlıkları için çeviri anahtarları ekle.

## 2. Onboarding Akışı

### 2.1 İçerik lokalizasyonu ve mesaj tonu (Yüksek)
- Gözlem: Tüm başlıklar ve açıklamalar sabit TR metin (ör. `OnbReminders.tsx:112`, `OnbPrivacy.tsx:119`) ve `useTranslation` kullanılmıyor.
- Etki: Dile bağlı anlatı kayboluyor, çok dilli hedeflere ulaşılamıyor.
- Öneri: Başlık/alt başlık/CTA metinleri için i18n anahtarları oluştur, ton ve uzunlukları TR/EN için ayrı optimize et.

### 2.2 Skip/Continue butonlarının yerleşimi (Orta)
- Gözlem: Skip butonu statü çubuğuna sabit `top:16` ile yapıştırılmış (`OnboardingScreen.tsx:47`), devam butonu ekran altına çarpıyor.
- Etki: iOS'ta buton tıklanamaz hale gelebiliyor, tek elle erişilebilirlik düşüyor.
- Öneri: `SafeAreaView + insets.top` kullan, alt CTA'yı `paddingBottom + SafeArea` ile kaldır ve 48px dokunma alanını garanti et.

### 2.3 Göstergelerde erişilebilirlik (Orta)
- Gözlem: Sayfa göstergeleri sadece renk değiştiriyor, ekran okuyucu duyurusu yok (`OnboardingScreen.tsx:65`).
- Etki: Görme bozukluğu olan kullanıcı hangi adımda olduğunu anlayamıyor.
- Öneri: Her noktaya `accessibilityLabel={`${index+1}/${PAGES.length}`}` ekle, aktif dot'u boyut+kontrastla ayırt et.

### 2.4 Animasyon optimizasyonu (Düşük)
- Gözlem: Çok sayıda `Animated.loop` ve SVG çizimi var, düşük donanımlı cihazlarda performans düşüyor (`OnbWelcome.tsx:34`, `OnbReminders.tsx:30`).
- Öneri: `useReducedMotion` algısı ekle, animasyonları 60fps yerine 30fps'e düşür veya basitleştir.

## 3. Kurulum (Setup) Ekranları

### 3.1 Hard-coded içerik ve ikonlar (Yüksek)
- Gözlem: Başlıklar/CTA'lar TR ve emoji tabanlı (`SetupLastPeriod.tsx:66`, `SetupCycleLength.tsx:104`).
- Etki: Dil tutarsızlığı ve emoji render sorunları.
- Öneri: Metinleri i18n'e taşı, emoji yerine ikon+metin kombinasyonu kullan.

### 3.2 Adım ilerleme göstergesi (Orta)
- Gözlem: Üç nokta sadece renkle farklılaşıyor (`SetupLastPeriod.tsx:108`), erişilebilir açıklama yok.
- Etki: Renk körü kullanıcılar hangi adımda olduklarını göremiyor.
- Öneri: `aria` etiketi ekle, numerik etiket (1/3) göster, aktif noktayı boyut/şekille ayırt et.

### 3.3 Veri doğrulama geri bildirimi (Orta)
- Gözlem: Tarih seçimi geçersiz olduğunda kullanıcıya mesaj verilmiyor (`SetupLastPeriod.tsx:36`), buton pasifken nedenini anlatan metin yok.
- Etki: Kullanıcılar neden ilerleyemediklerini anlamıyor.
- Öneri: Yardım metni veya inline uyarı ekle (`helperText`), buton altına son seçilen tarih/uyarı yaz.

### 3.4 CTA görünürlüğü ve kontrast (Düşük)
- Gözlem: `LinearGradient` CTA'lar (örn. `SetupPeriodLength.tsx:124`) disabled olsa da kontrastını kaybetmiyor; buton gölgeleri dark temada uyumsuz.
- Öneri: `enabled/disabled` halleri için farklı gradient veya `opacity` + `border` kullan; gölgeyi tema bazlı ayarla.

## 4. Takvim Ekranı

### 4.1 6. hafta eksikliği (Yüksek)
- Gözlem: Takvim sadece 35 gün oluşturuyor (`src/screens/CalendarScreen.tsx:51`), 31 gün + kayma gerektiren aylarda son günler görünmüyor.
- Etki: Kullanıcı kritik tarihleri göremiyor, güven kaybı.
- Öneri: Döngüyü 42 gün (6 satır) oluşturacak şekilde genişlet, ay görünümü 5 haftaya sığarsa son satırı gizle.

### 4.2 Sabit hücre boyutu ve taşma (Yüksek)
- Gözlem: Hücre genişliği sabit `CELL_SIZE = 48`, dış container `width - 32` üzerinden hesaplanıyor (`CalendarScreen.tsx:34`, `CalendarScreen.tsx:170`).
- Etki: 320px ekranlarda grid taşması, tabletlerde aşırı boşluk.
- Öneri: Hücre boyutunu `(availableWidth - gap * 6) / 7` formülüyle hesapla, `useWindowDimensions` ile güncelle.

### 4.3 Tema uyumsuzluğu ve kontrast (Yüksek)
- Gözlem: Arkaplan ve kartlar sabit açık tonlar (`CalendarScreen.tsx:123-167`), dark temada metin/ikon okunamıyor.
- Etki: Dark modda kullanılabilirlik sıfırlanıyor.
- Öneri: Tema renklerini kullan, gradientleri `colors.primary` vb. token'larla yeniden tanımla.

### 4.4 Hızlı aksiyon butonları (Orta)
- Gözlem: `?? Adet Başlat` gibi emoji+text, durum farkı yok (`CalendarScreen.tsx:210`).
- Etki: Adet başlat/bitti durumları görsel olarak ayırt edilmiyor.
- Öneri: Duruma göre ikon, başlık ve renk değiştir; butona kısa açıklama ekle.

### 4.5 Navigasyon ve yardım öğeleri (Orta)
- Gözlem: Ay geçişleri `<` ve `>` metin karakteri ile yapılıyor (`CalendarScreen.tsx:149`), erişilebilir açıklama yok.
- Öneri: Vektör ikon kullan, `accessibilityLabel`e "Önceki ay" / "Sonraki ay" yaz, uzun basınca ay listesi açılmasını düşün.

## 5. Daily Log Ekranı

### 5.1 CTA yerleşimi (Orta)
- Gözlem: Kaydet butonu scroll'un en sonunda (`DailyLogScreen.tsx:164`), uzun öneri listesinde görünmez oluyor.
- Etki: Kullanıcılar CTA'yı bulmak için sürekli scroll yapmak zorunda kalıyor.
- Öneri: Primary CTA'yı `position: sticky` veya ayrı alt bar ile sabitle.

### 5.2 Bildirim katmanları (Orta)
- Gözlem: Toast `top:50` ile sabit (`src/components/Toast.tsx:106`), confetti overlay status barı kaplıyor (`DailyLogScreen.tsx:187`).
- Etki: Çentikli cihazlarda mesajlar kesiliyor.
- Öneri: `useSafeAreaInsets` değerini top offset olarak kullan, confetti origin'ini `insets.top` üzeri yap.

### 5.3 Semptom kategorilerinde yerelleştirme (Orta)
- Gözlem: `SymptomGrid`'de kategori ve açıklamalar gömülü (`src/components/SymptomGrid.tsx:13-44`).
- Etki: Dil değişiminde TR içerik kalıyor, tıbbi terimler çevrilemiyor.
- Öneri: Semptom sözlüğünü `locales` altına taşı, `t()` ile doldur.

### 5.4 Mood ikonlarının tutarsızlığı (Düşük)
- Gözlem: `MoodSelector` emoji kullanıyor (`src/components/MoodSelector.tsx:22`), bazı Android sürümlerinde siyah-beyaz gösteriyor.
- Öneri: Duygu ikonlarını vektör setiyle eşleştir, alt yazılarını kısa tut.

## 6. Reports Ekranı

### 6.1 Veri görselleştirme netliği (Orta)
- Gözlem: Custom çizimler eksen/etiket göstermiyor (`ReportsScreen.tsx:206-280`), D1/D6 gibi kodlar açıklanmıyor.
- Etki: Kullanıcı metrikleri yorumlayamıyor.
- Öneri: Kısa açıklamalar ekle, `Victory` veya `react-native-svg-charts` ile eksen+grid çizdir, lejant ekle.

### 6.2 Renk kontrastı (Orta)
- Gözlem: Kart gradientleri açık renk, dark modda kontrast düşüyor (`ReportsScreen.tsx:141`, `ReportsScreen.tsx:289`).
- Öneri: Tema bazlı alternatifler; grafik alanlarında arka planı şeffaf yerine `colors.bg` yap.

### 6.3 Boş durum iletişimi (Düşük)
- Gözlem: `EmptyState` emoji tabanlı (`ReportsScreen.tsx:99`), marka dilini taşımıyor.
- Etki: Anlam belirsiz, markaya katkı yok.
- Öneri: İllustrasyon veya temalı ikon tercih et, aksiyon butonunu netleştir.

### 6.4 Tahmin doğruluğu modülü (Düşük)
- Gözlem: `%` metni iki kere gösteriliyor (`ReportsScreen.tsx:318`), progress bar metrikleri açıklanmıyor.
- Öneri: Tek başlık, alt açıklamada nasıl hesaplandığını anlat.

## 7. Settings Ekranı

### 7.1 Açılışta izin diyaloğu (Yüksek)
- Gözlem: Ekran açılır açılmaz `Alert` tetikleniyor (`SettingsScreen.tsx:53`), kullanıcı bağlamı olmadan izin isteniyor.
- Etki: Negatif deneyim, kullanıcılar izin reddediyor.
- Öneri: Önce bilgi kartı göster, kullanıcı switch'i açtığında izin iste.

### 7.2 Kritik aksiyonların ayrıştırılması (Orta)
- Gözlem: Veri silme/ithal etme kartları diğerleriyle aynı görünümde (`SettingsScreen.tsx:494`), sadece ince kırmızı çizgi var.
- Etki: Yanlışlıkla basılma riski.
- Öneri: Ayrı "Tehlikeli Bölge" başlığı, kırmızı ikon, ikincil doğrulama diyaloğu ekle.

### 7.3 Frekans seçimi UX'i (Orta)
- Gözlem: Bildirim frekansı "sıradaki moda geç" mantığında (`SettingsScreen.tsx:367`), seçenek listesi yok.
- Etki: Seçim kontrolü kullanıcıya kapalı, keşfedilebilirlik düşük.
- Öneri: BottomSheet veya modal ile seçenekleri listele, açıklamalar ekle.

### 7.4 Dil/tema göstergeleri (Düşük)
- Gözlem: Dil etiketi sadece TR/EN metin (`SettingsScreen.tsx:420`), seçili hal görsel değil.
- Öneri: Bayrak/ikon eşlemesi veya check işareti ekle.

## 8. Ortak Bileşenler & Mikro UX

### 8.1 Toast ikonografisi (Orta)
- Gözlem: `Toast` bileşeni ASCII karakterler döndürüyor (`src/components/Toast.tsx:94-101`), bazı platformlarda `?` görünüyor.
- Öneri: Durum ikonlarını MaterialIcons üzerinden çek, ekran okuyucuya durumunu söyle.

### 8.2 Modal kapatma butonu (Düşük)
- Gözlem: Modal kapama `Text '×'` (`src/components/Modal.tsx:142`), tıklama alanı 32px.
- Öneri: İkon buton kullan, dokunma alanını 44px yap, `hitSlop` ekle.

### 8.3 Button disabled durumu (Düşük)
- Gözlem: `Button` bileşeni primary kapalıyken gradient kaybediyor ve düz renk kalıyor (`src/components/Button.tsx:110`), fakat kontrast farkı yok.
- Öneri: Disabled için nötr arka plan ve `colors.inkLight` metin kullan; `aria-disabled` bilgisi ekle.

### 8.4 Kart gölgeleri (Düşük)
- Gözlem: Gölge parametreleri iOS'a göre ayarlı (`Card.tsx` ve `shadows` token'ı), Android'de `elevation` tutarsız.
- Öneri: `shadows` token'ını platforma göre ayarla veya `react-native-shadow-2` gibi çözüme geç.

## 9. Önerilen Yol Haritası

1. Tema/dark mode refaktörü ve safe-area düzeltmeleri (tüm ekranlar).
2. Onboarding & Setup metin/i18n düzenlemeleri, ikon değişimleri.
3. Takvim grid revizyonu + responsive düzen ve quick action güncellemeleri.
4. Günlük, raporlar ve ayarlar ekranlarında CTA/bildirim/diyalog iyileştirmeleri.
5. Ortak bileşenlerde (Toast, Modal, Button) erişilebilirlik ve ikonografi standardizasyonu.
