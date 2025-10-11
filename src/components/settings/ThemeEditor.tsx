/**
 * Theme Editor - Gelişmiş Tema Düzenleyici
 * 
 * Preset, accent, radius, density, scheduled mode, font scale
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { PresetName, THEME_PRESETS, Radius, Density, contrastRatio, ensureAA, RADIUS_VALUES, DENSITY_MULTIPLIERS } from '../../theme/tokens';
import SectionCard from '../Card';
import SettingSection from './SettingSection';
import SettingRow from './SettingRow';
import SegmentedControl from './SegmentedControl';
import * as Haptics from 'expo-haptics';

export default function ThemeEditor() {
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
    setTheme
  } = useTheme();

  // Safe theme with defaults
  const safeTheme = theme || {
    mode: 'light' as const,
    colors: { accent: '#FF99CC', background: '#FFFFFF', text: '#000000', mutedText: '#6B7280', surface: '#F8F9FA', border: '#E5E7EB', card: '#FFFFFF', success: '#4ADE80', danger: '#EF4444', warning: '#FFC107' },
    typography: { fontScale: 1.0 },
    radius: 'md' as const,
    density: 'regular' as const,
    shadows: true,
    haptics: true,
    schedule: undefined
  };

  const [customAccent, setCustomAccent] = useState(safeTheme.colors.accent);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Tema modu değiştir
  const handleModeChange = (mode: string) => {
    if (mode === 'system' || mode === 'light' || mode === 'dark' || mode === 'scheduled') {
      setMode(mode);
      if (theme?.haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Preset uygula
  const handlePresetSelect = (preset: PresetName) => {
    applyPreset(preset);
    if (theme?.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Accent rengi değiştir
  const handleAccentChange = (hex: string) => {
    const normalized = hex.toUpperCase().startsWith('#') ? hex : `#${hex}`;
    
    if (/^#[0-9A-F]{6}$/i.test(normalized)) {
      // Kontrast kontrolü
      const bgColor = resolveColor('background');
      const contrast = ensureAA(normalized, bgColor);
      
      if (!contrast.ok) {
        Alert.alert(
          '⚠️ Düşük Kontrast',
          `Seçilen rengin kontrast oranı ${contrast.ratio.toFixed(2)}. WCAG AA standardı için minimum 4.5 gerekli. Devam etmek istiyor musunuz?`,
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Devam', onPress: () => setAccent(normalized) }
          ]
        );
      } else {
        setAccent(normalized);
        if (safeTheme.haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }
  };

  // Radius değiştir
  const handleRadiusChange = (radius: string) => {
    setRadius(radius as Radius);
    if (safeTheme.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Density değiştir
  const handleDensityChange = (density: string) => {
    setDensity(density as Density);
    if (safeTheme.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Kontrast bilgisi
  const accentContrast = useMemo(() => {
    const bg = resolveColor('background');
    return ensureAA(safeTheme.colors.accent, bg);
  }, [safeTheme.colors.accent, resolveColor]);

  return (
    <View>
      {/* Tema Modu */}
      <SettingSection title="Tema Modu">
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <SegmentedControl
            options={[
              { value: 'system', label: 'Sistem' },
              { value: 'light', label: 'Açık' },
              { value: 'dark', label: 'Koyu' },
              { value: 'scheduled', label: 'Zamanlı' }
            ]}
            selectedValue={safeTheme.mode}
            onValueChange={handleModeChange}
          />
        </View>

        {/* Scheduled mode için saat seçici */}
        {safeTheme.mode === 'scheduled' && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Text style={{ fontSize: 13, color: safeTheme.colors.mutedText, marginBottom: 8 }}>
              ⏰ Açık tema: {safeTheme.schedule?.light.hour || 7}:00 - Koyu tema: {safeTheme.schedule?.dark.hour || 21}:00
            </Text>
            <Text style={{ fontSize: 11, color: safeTheme.colors.mutedText }}>
              Zamanlı tema ayarları yakında gelecek
            </Text>
          </View>
        )}
      </SettingSection>

      {/* Renk Paleti - Presets */}
      <SettingSection title="Renk Paleti">
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(THEME_PRESETS).map(([name, preset]) => (
              <TouchableOpacity
                key={name}
                onPress={() => handlePresetSelect(name as PresetName)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: preset.colors.accent,
                  borderWidth: 2,
                  borderColor: safeTheme.colors.accent === preset.colors.accent ? '#000' : 'transparent'
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFF' }}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SettingSection>

      {/* Accent Rengi */}
      <SettingSection title="Vurgu Rengi">
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Renk preview */}
            <TouchableOpacity
              onPress={() => setShowColorPicker(!showColorPicker)}
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                backgroundColor: safeTheme.colors.accent,
                borderWidth: 2,
                borderColor: safeTheme.colors.border
              }}
            />

            {/* HEX input */}
            <View style={{ flex: 1 }}>
              <TextInput
                value={customAccent}
                onChangeText={setCustomAccent}
                onBlur={() => handleAccentChange(customAccent)}
                placeholder="#FF99CC"
                placeholderTextColor={safeTheme.colors.mutedText}
                maxLength={7}
                autoCapitalize="characters"
                style={{
                  backgroundColor: safeTheme.colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: safeTheme.colors.text,
                  borderWidth: 1,
                  borderColor: safeTheme.colors.border
                }}
              />
            </View>
          </View>

          {/* Kontrast bilgisi */}
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 12, color: safeTheme.colors.mutedText }}>
              Kontrast: {accentContrast.ratio.toFixed(2)}
            </Text>
            {accentContrast.ok ? (
              <Text style={{ fontSize: 11, color: safeTheme.colors.success }}>✅ WCAG AA</Text>
            ) : (
              <Text style={{ fontSize: 11, color: safeTheme.colors.danger }}>⚠️ Düşük</Text>
            )}
          </View>
        </View>
      </SettingSection>

      {/* Görsel Stil */}
      <SettingSection title="Görsel Stil">
        {/* Radius */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text style={{ fontSize: 13, color: safeTheme.colors.mutedText, marginBottom: 8 }}>
            Köşe Yuvarlaklığı
          </Text>
          <SegmentedControl
            options={[
              { value: 'sm', label: 'Küçük' },
              { value: 'md', label: 'Orta' },
              { value: 'lg', label: 'Büyük' },
              { value: 'xl', label: 'XL' },
              { value: '2xl', label: '2XL' }
            ]}
            selectedValue={safeTheme.radius}
            onValueChange={handleRadiusChange}
          />
        </View>

        {/* Density */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text style={{ fontSize: 13, color: safeTheme.colors.mutedText, marginBottom: 8 }}>
            Yoğunluk
          </Text>
          <SegmentedControl
            options={[
              { value: 'compact', label: 'Kompakt' },
              { value: 'regular', label: 'Normal' },
              { value: 'cozy', label: 'Rahat' }
            ]}
            selectedValue={safeTheme.density}
            onValueChange={handleDensityChange}
          />
        </View>

        {/* Shadows */}
        <SettingRow
          title="Gölgeler"
          subtitle="Kartlarda ve butonlarda gölge efekti"
          rightElement={
            <Switch
              value={safeTheme.shadows}
              onValueChange={(value) => {
                setTheme({ shadows: value });
                if (safeTheme.haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              trackColor={{ false: safeTheme.colors.border, true: safeTheme.colors.accent }}
              thumbColor="#FFF"
            />
          }
        />

        {/* Haptics */}
        <SettingRow
          title="Dokunsal Geri Bildirim"
          subtitle="Etkileşimlerde titreşim"
          rightElement={
            <Switch
              value={safeTheme.haptics}
              onValueChange={(value) => {
                setTheme({ haptics: value });
              }}
              trackColor={{ false: safeTheme.colors.border, true: safeTheme.colors.accent }}
              thumbColor="#FFF"
            />
          }
        />
      </SettingSection>

      {/* Tipografi */}
      <SettingSection title="Tipografi">
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: safeTheme.colors.mutedText }}>
              Yazı Boyutu
            </Text>
            <Text style={{ fontSize: 13, color: safeTheme.colors.text, fontWeight: '600' }}>
              {Math.round(safeTheme.typography.fontScale * 100)}%
            </Text>
          </View>

          {/* Font scale slider simulation */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0.85, 0.9, 1.0, 1.1, 1.25].map(scale => (
              <TouchableOpacity
                key={scale}
                onPress={() => {
                  setFontScale(scale);
                  if (safeTheme.haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: safeTheme.typography.fontScale === scale 
                    ? safeTheme.colors.accent 
                    : safeTheme.colors.surface,
                  alignItems: 'center'
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: safeTheme.typography.fontScale === scale ? '#FFF' : safeTheme.colors.text
                  }}
                >
                  {Math.round(scale * 100)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SettingSection>

      {/* Önizleme */}
      <SettingSection title="Önizleme">
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
          {/* Kart önizleme */}
          <View
            style={{
              backgroundColor: safeTheme.colors.card,
              borderRadius: RADIUS_VALUES[safeTheme.radius],
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: safeTheme.shadows ? 0.1 : 0,
              shadowRadius: 8,
              elevation: safeTheme.shadows ? 3 : 0
            }}
          >
            <Text style={{ fontSize: 15 * safeTheme.typography.fontScale, fontWeight: '600', color: safeTheme.colors.text, marginBottom: 8 }}>
              Örnek Kart
            </Text>
            <Text style={{ fontSize: 13 * safeTheme.typography.fontScale, color: safeTheme.colors.mutedText, lineHeight: 20 }}>
              Bu, seçilen tema ayarlarının önizlemesidir.
            </Text>
          </View>

          {/* Buton önizleme */}
          <TouchableOpacity
            style={{
              backgroundColor: safeTheme.colors.accent,
              borderRadius: RADIUS_VALUES[safeTheme.radius],
              paddingVertical: 12 * DENSITY_MULTIPLIERS[safeTheme.density],
              paddingHorizontal: 24,
              alignItems: 'center',
              shadowColor: safeTheme.colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: safeTheme.shadows ? 0.3 : 0,
              shadowRadius: 8,
              elevation: safeTheme.shadows ? 5 : 0
            }}
          >
            <Text style={{ fontSize: 15 * safeTheme.typography.fontScale, fontWeight: '600', color: '#FFF' }}>
              Örnek Buton
            </Text>
          </TouchableOpacity>

          {/* Tag önizleme */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <View
              style={{
                backgroundColor: safeTheme.colors.surface,
                borderRadius: RADIUS_VALUES[safeTheme.radius] * 0.5,
                paddingVertical: 6 * DENSITY_MULTIPLIERS[safeTheme.density],
                paddingHorizontal: 12
              }}
            >
              <Text style={{ fontSize: 12 * safeTheme.typography.fontScale, color: safeTheme.colors.text }}>
                Tag 1
              </Text>
            </View>
            <View
              style={{
                backgroundColor: safeTheme.colors.accent,
                borderRadius: RADIUS_VALUES[safeTheme.radius] * 0.5,
                paddingVertical: 6 * DENSITY_MULTIPLIERS[safeTheme.density],
                paddingHorizontal: 12
              }}
            >
              <Text style={{ fontSize: 12 * safeTheme.typography.fontScale, color: '#FFF' }}>
                Tag 2
              </Text>
            </View>
          </View>
        </View>
      </SettingSection>

      {/* Alt Aksiyonlar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}>
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
                    if (safeTheme.haptics) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                  }
                }
              ]
            );
          }}
          style={{
            backgroundColor: safeTheme.colors.surface,
            borderRadius: RADIUS_VALUES[safeTheme.radius],
            paddingVertical: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: safeTheme.colors.border
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: safeTheme.colors.text }}>
            Varsayılanlara Dön
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bilgi */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 11, color: safeTheme.colors.mutedText, textAlign: 'center', lineHeight: 16 }}>
          Tema ayarları otomatik olarak kaydedilir ve tüm ekranlara uygulanır.
        </Text>
      </View>
    </View>
  );
}
