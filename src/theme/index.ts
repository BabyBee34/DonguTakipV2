import { useColorScheme } from 'react-native';

// Modern Pastel Theme Configuration
export const themeColors = {
  bg1: '#FFF6FB',
  bg2: '#FFE6F5',
  white: '#FFFFFF',
  text: '#333333',
  sub: '#6B7280',
  chipBorder: '#F5D9E8',
  pink: '#FF66B2',
  pink2: '#FF8FC8',
  mint: '#CFF8EE',
  lilac: '#E6D5FF',
  rose: '#FFDDE6',
  gold: '#FFD86B',
  grayLight: '#F3F4F6',
};

// Tab bar tema renkleri
export const light = {
  bg: '#FFFFFF',
  hair: 'rgba(0,0,0,0.06)',
  text: '#1F1F1F',
  textDim: '#6C6C6C',
  border: 'rgba(255, 182, 212, 0.45)',
  pillBg: '#FFE1EE',
  pillBr: '#FFB6D4',
  accent: '#FF5BA6',
};

export const dark = {
  bg: '#17171A',
  hair: 'rgba(255,255,255,0.06)',
  text: '#F4F4F5',
  textDim: '#B4B4B8',
  border: 'rgba(255, 182, 212, 0.35)',
  pillBg: '#3A2633',
  pillBr: '#5A2E47',
  accent: '#FF72B3',
};

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const sizes = { 
  chipFs: 12, 
  chipPadH: 10, 
  chipPadV: 8, 
  dayFs: 14 
};

export const gaps = { 
  xs: 6, 
  sm: 8, 
  md: 12 
};

export const brand = {
  pinkFrom: '#FF8BC2',   // pembe gradient başlangıç
  pinkTo: '#FF5BA6',     // pembe gradient bitiş
  pink: '#FF5BA6',       // ana pembe
  pinkText: '#FFFFFF',   // CTA üzeri beyaz metin
  lilacFrom: '#D5B3FF',
  lilacTo: '#B073E9',
  gray900: '#1F1F1F',
  gray600: '#6C6C6C',
  gray500: '#6E6E6E',
  overlay: 'rgba(0,0,0,0.45)',
  barBg: '#FFFFFF',
  hairline: 'rgba(0,0,0,0.06)',
  pillBg: '#FFE1EE',
  pillBorder: '#FFB6D4',
};

export const calendarColors = {
  adetBg: '#FFB6CE',      // canlı pembe
  tahminiBg: '#FFD1E2',   // açık pembe
  fertilBg: '#BDF5E6',    // canlı mint
  ovulasyonBg: '#CDB8FF', // canlı lila
  todayBg: '#FFE9B8',     // açık sarı
  otherBg: '#FFF5F9',     // off-month
  textMain: '#2E2E2E',    // koyu gri
  textMuted: '#B7B7B7',   // diğer ay günleri
  todayBorder: '#FFC857', // altın border
};

export const z = {
  card: 20,
  chip: 22,
  btn: 22,
};

export const weights = {
  title: '700',
  medium: '600',
  regular: '400',
};

export const spacing = (n: number) => n * 8;

export const shadow = {
  shadowColor: '#FFB6C1',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 4,
};

