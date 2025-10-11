# Tema Sistemi Analiz Raporu

## 1. Mimari Özeti
- Tema durumu ThemeProvider içinde context olarak dağıtılıyor (CycleMateApp/src/theme/ThemeProvider.tsx:68); ilk açılışta MMKV üzerinden yükleme yapılıyor ve eksik alanlar LIGHT_PRESET ile tamamlanıyor.
- setTheme çağrıları mergeThemeTokens ile birleştiriliyor ve sonuç saveTheme üzerinden persist ediliyor; ancak bu işlem useCallback içinde asenkron kaydın sonucunu beklemiyor, olası hata/yarış durumları log ile sınırlı (CycleMateApp/src/theme/ThemeProvider.tsx:104).
- Etkin mod hesabı sistem temasını, zamanlanmış geçişleri ve foreground dönüşlerini izleyerek güncelleniyor; AppState/Appearance dinleyicileri kapatma anında temizlenmiş durumda.
- Context değeri içinde “legacy” amaçlı colors, spacing, orderRadius, legacyShadows gibi alanlar hâlâ eski token setlerini döndürüyor (CycleMateApp/src/theme/ThemeProvider.tsx:287-324).

## 2. Renk Yönetimi Sorunları
- colors nesnesi lightColors / darkColors ile 	heme.colors’u birleştiriyor; fakat ThemeTokens içinde primary, g, gGray gibi anahtarlar olmadığı için kullanıcı ayarları bu alanlara yansımıyor (CycleMateApp/src/theme/ThemeProvider.tsx:287, CycleMateApp/src/theme/tokens.ts:102).
- Uygulamanın büyük bölümü hâlâ statik 	hemeColors, rand, calendarColors gibi sabitlerden besleniyor (CycleMateApp/src/theme/index.ts:4). Örnekler:
  - Takvim ızgarası tamamen sabit renklerle çiziliyor (CycleMateApp/src/components/CalendarGrid.tsx:3).
  - Günlük kayıt ekranı eski useThemeColors kancasını kullanıyor (CycleMateApp/src/screens/DailyLogScreen.tsx:22,104).
  - SectionCard, GradientButton, SettingRow, Skeleton gibi bileşenler sabit hex değerlerine dayanıyor (CycleMateApp/src/components/SectionCard.tsx:4, CycleMateApp/src/components/GradientButton.tsx:4, CycleMateApp/src/components/settings/SettingRow.tsx:113, CycleMateApp/src/components/Skeleton.tsx:1).
- Button, Chip, Card, Modal gibi yeni sağlayıcıyı kullanan bileşenler dahi colors.primary, colors.bg gibi eski anahtarları bekliyor (CycleMateApp/src/components/Button.tsx:76-88, CycleMateApp/src/components/Chip.tsx:32, CycleMateApp/src/components/Card.tsx:63, CycleMateApp/src/components/Modal.tsx:118). Bu anahtarlar kullanıcı tarafından güncellenmediğinden tonlar değişmiyor.
- Tema ayarlarında setAccent sadece 	heme.colors.accent alanını güncelliyor; UI’nin geri kalanı ise colors.primary üzerinden çalıştığı için değişikliği görmüyor (CycleMateApp/src/theme/ThemeProvider.tsx:184).

## 3. Diğer Tema Tokenlarının Kullanılmaması
- getSpacing ve getBorderRadius esnekliği sağlamak için tanımlanmış olsa da bileşenler doğrudan sabit spacing ve orderRadius nesnelerini kullanıyor (CycleMateApp/src/theme/ThemeProvider.tsx:223,319; örn. CycleMateApp/src/components/Card.tsx:37).
- density ve ontScale bilgilerinin tek tüketildiği yer tema ayar ekranları; uygulama içi tipografi/boşluklar dinamikleşmemiş durumda (CycleMateApp/src/screens/ThemeSettingsScreen.tsx:170+, CycleMateApp/src/components/settings/ThemeEditor.tsx:300+).
- useThemeTokens yardımcı kancası hiç çağrılmıyor; token tabanlı tüketim için planlanan arayüz devreye alınmamış (CycleMateApp/src/hooks/useThemeTokens.ts:9).

## 4. Tema Ayarları ve Editörün Durumu
- ThemeSettingsScreen ve ThemeEditor bileşenleri tema verisini doğru okuyup yazıyor; ancak bu değerleri kullanan global UI olmadığı için değişiklik sadece önizleme kartlarında görülüyor.
- Ekran THEME_PALETTES ve PaletteId gibi tipleri ../theme/tokens içinden import ediyor fakat bu semboller gerçekte palettes.ts dosyasında; build sırasında kullandığınız modül çözümleme ayarına bağlı olarak tip hataları oluşabilir (CycleMateApp/src/screens/ThemeSettingsScreen.tsx:17, CycleMateApp/src/theme/palettes.ts:7).
- pplyPreset doğrudan THEME_PRESETS’ten gelen tokenları yüklediği için colors.primary gibi eski alanlara ilişkin eşleme yapılmazsa UI yine sabit kalıyor (CycleMateApp/src/theme/ThemeProvider.tsx:201, CycleMateApp/src/theme/tokens.ts:120).

## 5. Önerilen Yol Haritası
1. **Token haritasını genişletin:** ThemeTokens.colors içine uygulamanın ihtiyaç duyduğu primary, g, gSoft, 	extOnPrimary vb. anahtarları ekleyin ve presetleri buna göre güncelleyin. Alternatif olarak ThemeProvider içinde ccent değerinden primary türeten bir köprü katmanı oluşturun.
2. **Legacy exports’u kaldırın:** src/theme/index.ts içinde tutulan sabitleri aşamalı olarak kaldırıp bütün bileşenleri useTheme veya useThemeTokens üzerinden besleyin.
3. **Bileşen refaktoru:** Öncelik sırasına göre (örn. CalendarScreen, DailyLogScreen, SettingRow, tüm settings bileşenleri) sabit renkleri token çağrılarına çevirin. Kod tekrarını azaltmak için ortak useThemeTokens() yardımcılarını devreye alın.
4. **Spacing ve radius kullanımını yaygınlaştırın:** Bileşenlerdeki spacing(...), sabit px ve orderRadius.card çağrılarını getSpacing / getBorderRadius ile değiştirin; density seçeneğinin gerçek etkisini sağlayın.
5. **Font ölçeği entegrasyonu:** Ana tipografi stillerini 	heme.typography.fontScale çarpanı ile tanımlayın; metinleri merkezî TextStyle helper’larında toplayın.
6. **Navigation / StatusBar senkronu:** Navigasyon teması halihazırda esolveColor ile çalışıyor (CycleMateApp/App.tsx:35); bileşen refaktöründen sonra genel görünüm uyumu için ek testler yapın.
7. **Test ve regresyon planı:** Temel ekranlarda (Takvim, Günlük, Ayarlar, Onboarding) manuel geçiş testleri yapıp açık/koyu, preset ve özel renk kombinasyonlarını doğrulayın.

Bu adımlar tamamlandığında tema ayarlarında yapılan değişikliklerin tüm ekranlara gerçek zamanlı yansıması mümkün olacaktır.
