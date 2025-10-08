import React, { memo, useMemo, useState } from 'react';
import { View, Text, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import { themeColors, gaps, sizes, spacing, calendarColors } from '../theme';

interface DayItem {
  key: string;
  label: string;
  kind?: 'adet' | 'fertil' | 'ovu' | 'tahmini' | 'none' | 'today';
  onPress?: () => void;
}

// Hücre sol-üst köşe ikonları
const KIND_ICON: Record<string, string> = {
  adet: '🌸',
  tahmini: '🌷',
  fertil: '🌿',
  ovu: '💜',
  today: '☀️',
  none: '',
};

interface CalendarGridProps {
  days: DayItem[];
  header: {
    monthLabel: string;
    onPrev: () => void;
    onNext: () => void;
  };
}

const CalendarGrid = memo(({ days, header }: CalendarGridProps) => {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  const gap = gaps.sm; // 8
  const paddingH = spacing(1); // 8
  // 7 sütun için hücre genişliğini kesin hesapla:
  const cellW = w > 0 ? Math.floor((w - paddingH * 2 - gap * 6) / 7) : 44;
  const cellH = cellW; // kare

  const bgFor = (k?: string) => {
    switch (k) {
      case 'adet':
        return calendarColors.adetBg;
      case 'fertil':
        return calendarColors.fertilBg;
      case 'ovu':
        return calendarColors.ovulasyonBg;
      case 'tahmini':
        return calendarColors.tahminiBg;
      case 'today':
        return calendarColors.todayBg;
      case 'none':
        return calendarColors.otherBg;
      default:
        return '#FFFFFF';
    }
  };

  const borderFor = (k?: string) => (k === 'today' ? calendarColors.todayBorder : 'transparent');
  const textColorFor = (k?: string) => (k === 'none' ? calendarColors.textMuted : calendarColors.textMain);

  const weeks = useMemo(() => {
    const out: DayItem[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  return (
    <View onLayout={onLayout} style={{ paddingHorizontal: paddingH, paddingBottom: spacing(2) }}>
      {/* Başlık satırı */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing(1),
        }}
      >
        <TouchableOpacity
          onPress={header.onPrev}
          accessibilityLabel="Önceki ay"
          accessibilityRole="button"
          style={{ padding: 8 }}
        >
          <Text style={{ fontWeight: '700', fontSize: 18, color: '#777' }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: '700', fontSize: 16, color: '#333' }}>{header.monthLabel}</Text>
        <TouchableOpacity
          onPress={header.onNext}
          accessibilityLabel="Sonraki ay"
          accessibilityRole="button"
          style={{ padding: 8 }}
        >
          <Text style={{ fontWeight: '700', fontSize: 18, color: '#777' }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Hafta günleri */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: gaps.sm }}>
        {['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'].map((d) => (
          <View key={d} style={{ width: cellW, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#9AA0A6', fontWeight: '600' }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Günler */}
      {weeks.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: gap }}>
          {row.map((d) => (
            <View
              key={d.key}
              style={{
                width: cellW,
                height: cellH,
                position: 'relative',
              }}
            >
              <TouchableOpacity
                onPress={d.onPress}
                disabled={!d.onPress}
                activeOpacity={0.7}
                style={{
                  width: cellW,
                  height: cellH,
                  borderRadius: 14,
                  backgroundColor: bgFor(d.kind),
                  borderWidth: d.kind === 'today' ? 2 : 0,
                  borderColor: borderFor(d.kind),
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#FFB6C1',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                {/* Sol-üst köşe ikonu */}
                {d.kind && KIND_ICON[d.kind] ? (
                  <Text
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 6,
                      fontSize: 12,
                      opacity: d.kind === 'none' ? 0.45 : 0.9,
                    }}
                    accessible={false}
                  >
                    {KIND_ICON[d.kind]}
                  </Text>
                ) : null}

                {/* Gün numarası */}
                <Text
                  style={{
                    fontSize: 15,
                    color: textColorFor(d.kind),
                    fontWeight: '600',
                  }}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
      
      {/* Takvim altı nefes alanı */}
      <View style={{ height: 8 }} />
    </View>
  );
});

CalendarGrid.displayName = 'CalendarGrid';

export default CalendarGrid;

