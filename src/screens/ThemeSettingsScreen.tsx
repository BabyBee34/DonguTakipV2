import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import {
  ThemeMode,
  Radius,
  Density,
  contrastRatio,
  ensureAA,
  RADIUS_VALUES,
  DENSITY_MULTIPLIERS,
  THEME_PALETTES,
  PaletteId,
} from '../theme/tokens';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ColorPalette {
  id: PaletteId;
  name: string;
  primary: string;
  secondary: string;
  preview: string;
}

const CUSTOM_PALETTES: ColorPalette[] = [
  { id: 'light', name: 'Açık', primary: '#FFB6C1', secondary: '#FF69B4', preview: '#FFF0F5' },
  { id: 'dark', name: 'Koyu', primary: '#E75480', secondary: '#FF1493', preview: '#2D1B2D' },
  { id: 'rose', name: 'Pembe', primary: '#FF3366', secondary: '#FF69B4', preview: '#FFF0F5' },
  { id: 'mint', name: 'Nane', primary: '#00C896', secondary: '#00FF7F', preview: '#F0FFF8' },
  { id: 'amber', name: 'Amber', primary: '#FFB300', secondary: '#FFD700', preview: '#FFF8DC' },
];

const FONT_SCALES = [0.85, 0.9, 1.0, 1.1, 1.25];
const FONT_SCALE_LABELS = ['85%', '90%', '100%', '110%', '125%'];

const RADIUS_OPTIONS = [
  { value: 'sm' as Radius, label: 'Küçük', icon: '○' },
  { value: 'md' as Radius, label: 'Orta', icon: '◐' },
  { value: 'lg' as Radius, label: 'Büyük', icon: '◑' },
  { value: 'xl' as Radius, label: 'XL', icon: '●' },
  { value: '2xl' as Radius, label: '2XL', icon: '⬤' },
];

const DENSITY_OPTIONS = [
  { value: 'compact' as Density, label: 'Kompakt', icon: '⊡' },
  { value: 'regular' as Density, label: 'Normal', icon: '⊞' },
  { value: 'cozy' as Density, label: 'Rahat', icon: '⊟' },
];

const THEME_MODE_OPTIONS = [
  { value: 'system' as ThemeMode, label: 'Sistem', icon: '⚙️' },
  { value: 'light' as ThemeMode, label: 'Açık', icon: '☀️' },
  { value: 'dark' as ThemeMode, label: 'Koyu', icon: '🌙' },
  { value: 'scheduled' as ThemeMode, label: 'Zamanlı', icon: '🕐' },
];

export default function ThemeSettingsScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    theme,
    effectiveMode,
    setMode,
    setAccent,
    setRadius,
    setDensity,
    setFontScale,
    applyPreset,
    resetTheme,
    resolveColor,
  } = useTheme();

  // Theme objesinin güvenli kullanımı
  const safeTheme = theme || {
    colors: { accent: '#FF99CC', background: '#FFFFFF', text: '#000000', border: '#E5E7EB', surface: '#F8F9FA', mutedText: '#6B7280', success: '#4ADE80', danger: '#EF4444' },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    radius: 'md' as const,
    density: 'regular' as const,
    typography: { fontScale: 1.0 },
    shadows: { sm: {}, md: {}, card: {} }
  };

  const [customAccent, setCustomAccent] = useState(safeTheme.colors.accent);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Simple header without animation

  // Tema modu değiştir
  const handleModeChange = (mode: ThemeMode) => {
    setMode(mode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Palette seç
  const handlePaletteSelect = (paletteId: PaletteId) => {
    applyPreset(paletteId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Custom accent color
  const handleAccentChange = (color: string) => {
    setCustomAccent(color);
    setAccent(color);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Radius değiştir
  const handleRadiusChange = (radius: Radius) => {
    setRadius(radius);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Density değiştir
  const handleDensityChange = (density: Density) => {
    setDensity(density);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Font scale değiştir
  const handleFontScaleChange = (scale: number) => {
    setFontScale(scale);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Kontrast bilgisi
  const accentContrast = useMemo(() => {
    const bg = resolveColor('background');
    return ensureAA(safeTheme.colors.accent, bg);
  }, [safeTheme.colors.accent, resolveColor]);

  // Kaydet ve uygula
  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Tema Kaydedildi',
      'Tema ayarlarınız başarıyla kaydedildi ve uygulandı.',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  // Önizleme kartı
  const PreviewCard = () => (
    <View
      style={{
        backgroundColor: safeTheme.colors.surface,
        borderRadius: RADIUS_VALUES[safeTheme.radius],
        padding: safeTheme.spacing.lg,
        marginHorizontal: safeTheme.spacing.md,
        marginVertical: safeTheme.spacing.sm,
        ...safeTheme.shadows.card,
        borderWidth: 1,
        borderColor: safeTheme.colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 18 * safeTheme.typography.fontScale,
          fontWeight: '700',
          color: safeTheme.colors.text,
          marginBottom: safeTheme.spacing.sm,
        }}
      >
        Önizleme Kartı
      </Text>
      <Text
        style={{
          fontSize: 14 * safeTheme.typography.fontScale,
          color: safeTheme.colors.mutedText,
          lineHeight: 20 * safeTheme.typography.fontScale,
          marginBottom: safeTheme.spacing.md,
        }}
      >
        Bu kart seçtiğiniz tema ayarlarını gösterir. Renkler, yazı boyutu ve köşe yuvarlaklığı gerçek zamanlı olarak güncellenir.
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: safeTheme.spacing.sm,
          flexWrap: 'wrap',
        }}
      >
        <View
          style={{
            backgroundColor: safeTheme.colors.accent,
            borderRadius: RADIUS_VALUES[safeTheme.radius] * 0.7,
            paddingHorizontal: safeTheme.spacing.md,
            paddingVertical: safeTheme.spacing.sm,
          }}
        >
          <Text
            style={{
              color: '#FFF',
              fontSize: 12 * safeTheme.typography.fontScale,
              fontWeight: '600',
            }}
          >
            Tag 1
          </Text>
        </View>
        <View
          style={{
            backgroundColor: safeTheme.colors.surface,
            borderWidth: 1,
            borderColor: safeTheme.colors.accent,
            borderRadius: RADIUS_VALUES[safeTheme.radius] * 0.7,
            paddingHorizontal: safeTheme.spacing.md,
            paddingVertical: safeTheme.spacing.sm,
          }}
        >
          <Text
            style={{
              color: safeTheme.colors.accent,
              fontSize: 12 * safeTheme.typography.fontScale,
              fontWeight: '600',
            }}
          >
            Tag 2
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: safeTheme.colors.background }}>
      <StatusBar
        barStyle={effectiveMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View
        style={{
          backgroundColor: safeTheme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: safeTheme.colors.border,
          paddingHorizontal: safeTheme.spacing.lg,
          paddingTop: safeTheme.spacing.md,
          paddingBottom: safeTheme.spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000,
        }}
      >
        <Text
          style={{
            fontSize: 24 * safeTheme.typography.fontScale,
            fontWeight: '700',
            color: safeTheme.colors.text,
          }}
        >
          🎨 Tema Ayarları
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: safeTheme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            ...safeTheme.shadows.sm,
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ fontSize: 24, color: safeTheme.colors.text }}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tema Modu */}
        <View style={{ padding: safeTheme.spacing.lg }}>
          <Text
            style={{
              fontSize: 18 * safeTheme.typography.fontScale,
              fontWeight: '600',
              color: safeTheme.colors.text,
              marginBottom: safeTheme.spacing.md,
            }}
          >
            Tema Modu
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: safeTheme.spacing.sm,
            }}
          >
            {THEME_MODE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleModeChange(option.value)}
                style={{
                  flex: 1,
                  minWidth: (SCREEN_WIDTH - safeTheme.spacing.lg * 2 - safeTheme.spacing.sm * 3) / 4,
                  backgroundColor: effectiveMode === option.value ? safeTheme.colors.accent : safeTheme.colors.surface,
                  borderRadius: RADIUS_VALUES[safeTheme.radius],
                  padding: safeTheme.spacing.md,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: effectiveMode === option.value ? safeTheme.colors.accent : safeTheme.colors.border,
                  ...safeTheme.shadows.sm,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: safeTheme.spacing.xs }}>
                  {option.icon}
                </Text>
                <Text
                  style={{
                    fontSize: 12 * safeTheme.typography.fontScale,
                    fontWeight: '600',
                    color: effectiveMode === option.value ? '#FFF' : safeTheme.colors.text,
                    textAlign: 'center',
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Renk Paleti */}
        <View style={{ padding: safeTheme.spacing.lg }}>
          <Text
            style={{
              fontSize: 18 * safeTheme.typography.fontScale,
              fontWeight: '600',
              color: safeTheme.colors.text,
              marginBottom: safeTheme.spacing.md,
            }}
          >
            Renk Paleti
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: safeTheme.spacing.sm,
            }}
          >
            {CUSTOM_PALETTES.map((palette) => (
              <TouchableOpacity
                key={palette.id}
                onPress={() => handlePaletteSelect(palette.id)}
                style={{
                  width: (SCREEN_WIDTH - safeTheme.spacing.lg * 2 - safeTheme.spacing.sm * 4) / 5,
                  aspectRatio: 1,
                  borderRadius: RADIUS_VALUES[safeTheme.radius],
                  backgroundColor: palette.preview,
                  borderWidth: 3,
                  borderColor: safeTheme.colors.accent === palette.primary ? safeTheme.colors.accent : safeTheme.colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...safeTheme.shadows.md,
                }}
              >
                <Text
                  style={{
                    fontSize: 10 * safeTheme.typography.fontScale,
                    fontWeight: '600',
                    color: safeTheme.colors.text,
                    textAlign: 'center',
                  }}
                >
                  {palette.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Vurgu Rengi */}
        <View style={{ padding: safeTheme.spacing.lg }}>
          <Text
            style={{
              fontSize: 18 * safeTheme.typography.fontScale,
              fontWeight: '600',
              color: safeTheme.colors.text,
              marginBottom: safeTheme.spacing.md,
            }}
          >
            Vurgu Rengi
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: safeTheme.spacing.md,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: RADIUS_VALUES[safeTheme.radius],
                backgroundColor: customAccent,
                borderWidth: 2,
                borderColor: safeTheme.colors.border,
                ...safeTheme.shadows.sm,
              }}
            />
            <View style={{ flex: 1 }}>
              <TextInput
                value={customAccent}
                onChangeText={handleAccentChange}
                placeholder="#FF99CC"
                placeholderTextColor={safeTheme.colors.mutedText}
                style={{
                  backgroundColor: safeTheme.colors.surface,
                  borderRadius: RADIUS_VALUES[safeTheme.radius],
                  padding: safeTheme.spacing.md,
                  fontSize: 16 * safeTheme.typography.fontScale,
                  color: safeTheme.colors.text,
                  borderWidth: 1,
                  borderColor: safeTheme.colors.border,
                  fontFamily: 'monospace',
                }}
              />
              <View
                style={{
                  marginTop: safeTheme.spacing.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: safeTheme.spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontSize: 12 * safeTheme.typography.fontScale,
                    color: safeTheme.colors.mutedText,
                  }}
                >
                  Kontrast: {accentContrast.ratio.toFixed(2)}
                </Text>
                {accentContrast.ok ? (
                  <Text
                    style={{
                      fontSize: 11 * safeTheme.typography.fontScale,
                      color: safeTheme.colors.success,
                    }}
                  >
                    ✅ WCAG AA
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontSize: 11 * safeTheme.typography.fontScale,
                      color: safeTheme.colors.danger,
                    }}
                  >
                    ⚠️ Düşük
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Görsel Stil */}
        <View style={{ padding: safeTheme.spacing.lg }}>
          <Text
            style={{
              fontSize: 18 * safeTheme.typography.fontScale,
              fontWeight: '600',
              color: safeTheme.colors.text,
              marginBottom: safeTheme.spacing.md,
            }}
          >
            Görsel Stil
          </Text>

          {/* Köşe Yuvarlaklığı */}
          <View style={{ marginBottom: safeTheme.spacing.lg }}>
            <Text
              style={{
                fontSize: 14 * safeTheme.typography.fontScale,
                color: safeTheme.colors.mutedText,
                marginBottom: safeTheme.spacing.sm,
              }}
            >
              Köşe Yuvarlaklığı
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: safeTheme.spacing.sm,
              }}
            >
              {RADIUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleRadiusChange(option.value)}
                  style={{
                    flex: 1,
                    backgroundColor: safeTheme.radius === option.value ? safeTheme.colors.accent : safeTheme.colors.surface,
                    borderRadius: RADIUS_VALUES[safeTheme.radius],
                    padding: safeTheme.spacing.md,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: safeTheme.radius === option.value ? safeTheme.colors.accent : safeTheme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: safeTheme.radius === option.value ? '#FFF' : safeTheme.colors.text,
                      marginBottom: safeTheme.spacing.xs,
                    }}
                  >
                    {option.icon}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11 * safeTheme.typography.fontScale,
                      fontWeight: '600',
                      color: safeTheme.radius === option.value ? '#FFF' : safeTheme.colors.text,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Yoğunluk */}
          <View>
            <Text
              style={{
                fontSize: 14 * safeTheme.typography.fontScale,
                color: safeTheme.colors.mutedText,
                marginBottom: safeTheme.spacing.sm,
              }}
            >
              Yoğunluk
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: safeTheme.spacing.sm,
              }}
            >
              {DENSITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleDensityChange(option.value)}
                  style={{
                    flex: 1,
                    backgroundColor: safeTheme.density === option.value ? safeTheme.colors.accent : safeTheme.colors.surface,
                    borderRadius: RADIUS_VALUES[safeTheme.radius],
                    padding: safeTheme.spacing.md,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: safeTheme.density === option.value ? safeTheme.colors.accent : safeTheme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: safeTheme.density === option.value ? '#FFF' : safeTheme.colors.text,
                      marginBottom: safeTheme.spacing.xs,
                    }}
                  >
                    {option.icon}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11 * safeTheme.typography.fontScale,
                      fontWeight: '600',
                      color: safeTheme.density === option.value ? '#FFF' : safeTheme.colors.text,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Tipografi */}
        <View style={{ padding: safeTheme.spacing.lg }}>
          <Text
            style={{
              fontSize: 18 * safeTheme.typography.fontScale,
              fontWeight: '600',
              color: safeTheme.colors.text,
              marginBottom: safeTheme.spacing.md,
            }}
          >
            Tipografi
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: safeTheme.spacing.sm,
            }}
          >
            {FONT_SCALES.map((scale, index) => (
              <TouchableOpacity
                key={scale}
                onPress={() => handleFontScaleChange(scale)}
                style={{
                  flex: 1,
                  backgroundColor: safeTheme.typography.fontScale === scale ? safeTheme.colors.accent : safeTheme.colors.surface,
                  borderRadius: RADIUS_VALUES[safeTheme.radius],
                  padding: safeTheme.spacing.md,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: safeTheme.typography.fontScale === scale ? safeTheme.colors.accent : safeTheme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14 * safeTheme.typography.fontScale,
                    fontWeight: '600',
                    color: safeTheme.typography.fontScale === scale ? '#FFF' : safeTheme.colors.text,
                  }}
                >
                  {FONT_SCALE_LABELS[index]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Önizleme */}
        <View>
          <Text
            style={{
              fontSize: 18 * safeTheme.typography.fontScale,
              fontWeight: '600',
              color: safeTheme.colors.text,
              marginHorizontal: safeTheme.spacing.lg,
              marginBottom: safeTheme.spacing.md,
            }}
          >
            Önizleme
          </Text>
          <PreviewCard />
        </View>

        {/* Alt Aksiyonlar */}
        <View style={{ padding: safeTheme.spacing.lg }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Varsayılanlara Dön',
                'Tüm tema ayarları sıfırlanacak. Devam etmek istiyor musunuz?',
                [
                  { text: 'İptal', style: 'cancel' },
                  {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: () => {
                      resetTheme();
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    },
                  },
                ]
              );
            }}
            style={{
              backgroundColor: safeTheme.colors.surface,
              borderRadius: RADIUS_VALUES[safeTheme.radius],
              paddingVertical: safeTheme.spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: safeTheme.colors.border,
              marginBottom: safeTheme.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 15 * safeTheme.typography.fontScale,
                fontWeight: '600',
                color: safeTheme.colors.text,
              }}
            >
              Varsayılanlara Dön
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 11 * safeTheme.typography.fontScale,
              color: safeTheme.colors.mutedText,
              textAlign: 'center',
              lineHeight: 16 * safeTheme.typography.fontScale,
            }}
          >
            Tema ayarları otomatik olarak kaydedilir ve tüm ekranlara uygulanır.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Save Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: safeTheme.colors.background,
          borderTopWidth: 1,
          borderTopColor: safeTheme.colors.border,
          paddingHorizontal: safeTheme.spacing.lg,
          paddingVertical: safeTheme.spacing.md,
          paddingBottom: Platform.OS === 'ios' ? 34 : safeTheme.spacing.md,
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: safeTheme.colors.accent,
            borderRadius: RADIUS_VALUES[safeTheme.radius],
            paddingVertical: safeTheme.spacing.lg,
            alignItems: 'center',
            ...safeTheme.shadows.md,
          }}
        >
          <Text
            style={{
              fontSize: 16 * safeTheme.typography.fontScale,
              fontWeight: '700',
              color: '#FFF',
            }}
          >
            Uygula ve Kaydet
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
