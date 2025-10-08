import React, { useState } from 'react';
import { View, Text, Pressable, useWindowDimensions, Platform, ViewStyle } from 'react-native';
import InfoPopover from './InfoPopover';

type Item = { key: string; label: string; info: string[] };

const ITEMS: Item[] = [
  { key: 'adet', label: '🌸  Adet', info: ['Aktif adet günleri.', 'Takvimde pembe tonla gösterilir.'] },
  { key: 'tahmini', label: '🌷  Tahmini', info: ['Yaklaşan adet için tahmin aralığı.', 'Ortalama döngüye göre hesap.'] },
  { key: 'fertil', label: '🌿  Fertil', info: ['Gebelik için verimli günler penceresi.', 'Ovulasyondan önce/sonra birkaç gün.'] },
  { key: 'ovul', label: '💜  Ovulasyon', info: ['Yumurtlama günü (tahmini).', 'Kişisel farklılık gösterebilir.'] },
  { key: 'bugun', label: '☀️  Bugün', info: ['İçinde bulunduğun gün.', 'Altın çerçeve ile vurgulanır.'] },
];

interface CycleLegendCardProps {
  style?: ViewStyle;
}

export default function CycleLegendCard({ style }: CycleLegendCardProps) {
  const { width } = useWindowDimensions();
  const compact = width < 370;

  // Kart içi yatay pad ve gap
  const PAD_H = compact ? 16 : 18;
  const GAP = compact ? 8 : 10;
  const CARD_BORDER = '#F2E5EE';

  // Kartın kullanılabilir iç genişliği (ana container paddinglerini kabaca düş)
  const innerW = width - PAD_H * 2 - 40; // ekran kenar boşluklarına göre güvenli pay
  const CHIP_H = compact ? 42 : 46;
  const CHIP_W_TOP = Math.floor((innerW - GAP * 2) / 3); // üst 3
  const CHIP_W_BOT = Math.floor((innerW - GAP * 1) / 2); // alt 2

  const [open, setOpen] = useState<Item | null>(null);

  const Chip = ({ w, label, onPress }: { w: number; label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#eee' }}
      accessibilityRole="button"
      accessibilityLabel={`Etiket: ${label}`}
      style={{
        width: w,
        height: CHIP_H,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#EEDAE8',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0,
        shadowRadius: 6,
        elevation: Platform.OS === 'android' ? 1 : 0,
      }}
    >
      <Text style={{ fontSize: compact ? 13 : 14, color: '#4A4A4A', fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          paddingHorizontal: PAD_H,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: CARD_BORDER,
          marginBottom: 12,
          shadowColor: '#FFB6C1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
    >
      {/* Üst sıra: 3 adet */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: GAP }}>
        {ITEMS.slice(0, 3).map((i) => (
          <Chip key={i.key} w={CHIP_W_TOP} label={i.label} onPress={() => setOpen(i)} />
        ))}
      </View>

      {/* Alt sıra: 2 adet */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {ITEMS.slice(3).map((i) => (
          <Chip key={i.key} w={CHIP_W_BOT} label={i.label} onPress={() => setOpen(i)} />
        ))}
      </View>

      {/* Bilgi popover (mevcut InfoPopover bileşeniyle) */}
      <InfoPopover
        visible={!!open}
        onClose={() => setOpen(null)}
        title={open?.label || ''}
        lines={open?.info || []}
        tint={'#FFC0D9'}
        emoji=""
      />
    </View>
  );
}

