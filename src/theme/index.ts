import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeProvider';

// ⚠️ DEPRECATED: Use useTheme() hook instead
// These are kept for backward compatibility only
// Modern Pastel Theme Configuration (STATIC - DO NOT USE)
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

// ✅ USE THIS: Dynamic theme colors hook
export function useThemeColors() {
  const { colors } = useTheme();
  return {
    bg1: colors.surface || '#FFF6FB',
    bg2: colors.card || '#FFE6F5',
    white: colors.background || '#FFFFFF',
    text: colors.text || '#333333',
    sub: colors.mutedText || '#6B7280',
    chipBorder: colors.border || '#F5D9E8',
    pink: colors.primary || '#FF66B2',
    pink2: colors.accent || '#FF8FC8',
    mint: '#CFF8EE',
    lilac: '#E6D5FF',
    rose: '#FFDDE6',
    gold: '#FFD86B',
    grayLight: colors.surface || '#F3F4F6',
  };
}

// ✅ USE THIS: Dynamic tab bar colors
export function useTabBarColors() {
  const { effectiveMode, colors } = useTheme();
  
  if (effectiveMode === 'dark') {
    return {
      bg: colors.background || '#17171A',
      hair: 'rgba(255,255,255,0.06)',
      text: colors.text || '#F4F4F5',
      textDim: colors.mutedText || '#B4B4B8',
      border: colors.border + '59' || 'rgba(255, 182, 212, 0.35)',  // 35% opacity
      pillBg: colors.surface || '#3A2633',
      pillBr: colors.border || '#5A2E47',
      accent: colors.primary || '#FF72B3',
    };
  }
  
  return {
    bg: colors.background || '#FFFFFF',
    hair: 'rgba(0,0,0,0.06)',
    text: colors.text || '#1F1F1F',
    textDim: colors.mutedText || '#6C6C6C',
    border: colors.border + '73' || 'rgba(255, 182, 212, 0.45)',  // 45% opacity
    pillBg: colors.bgSoft || '#FFE1EE',
    pillBr: colors.border || '#FFB6D4',
    accent: colors.primary || '#FF5BA6',
  };
}

// ⚠️ DEPRECATED - Static values (use useTabBarColors hook)
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

// ✅ USE THIS: Dynamic brand colors
export function useBrandColors() {
  const { colors } = useTheme();
  return {
    pinkFrom: colors.accent || '#FF8BC2',
    pinkTo: colors.primary || '#FF5BA6',
    pink: colors.primary || '#FF5BA6',
    pinkText: colors.textOnPrimary || '#FFFFFF',
    lilacFrom: '#D5B3FF',
    lilacTo: '#B073E9',
    gray900: colors.text || '#1F1F1F',
    gray600: colors.mutedText || '#6C6C6C',
    gray500: '#6E6E6E',
    overlay: 'rgba(0,0,0,0.45)',
    barBg: colors.background || '#FFFFFF',
    hairline: colors.border || 'rgba(0,0,0,0.06)',
    pillBg: colors.bgSoft || '#FFE1EE',
    pillBorder: colors.border || '#FFB6D4',
  };
}

// ⚠️ DEPRECATED - Use useBrandColors() hook
export const brand = {
  pinkFrom: '#FF8BC2',
  pinkTo: '#FF5BA6',
  pink: '#FF5BA6',
  pinkText: '#FFFFFF',
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

// ✅ USE THIS: Dynamic calendar colors
export function useCalendarColors() {
  const { colors } = useTheme();
  return {
    adetBg: colors.periodColor || '#FFB6CE',
    tahminiBg: colors.periodColor + '80' || '#FFD1E2',  // 50% opacity
    fertilBg: colors.fertileColor || '#BDF5E6',
    ovulasyonBg: colors.ovulationColor || '#CDB8FF',
    todayBg: '#FFE9B8',
    otherBg: colors.surface || '#FFF5F9',
    textMain: colors.text || '#2E2E2E',
    textMuted: colors.mutedText || '#B7B7B7',
    todayBorder: colors.warning || '#FFC857',
  };
}

// ⚠️ DEPRECATED - Use useCalendarColors() hook
export const calendarColors = {
  adetBg: '#FFB6CE',
  tahminiBg: '#FFD1E2',
  fertilBg: '#BDF5E6',
  ovulasyonBg: '#CDB8FF',
  todayBg: '#FFE9B8',
  otherBg: '#FFF5F9',
  textMain: '#2E2E2E',
  textMuted: '#B7B7B7',
  todayBorder: '#FFC857',
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

