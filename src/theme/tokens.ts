/**
 * Theme Tokens - Merkezi Tema Sistemi
 * 
 * Tüm renkler, boyutlar ve stiller buradan yönetilir.
 * WCAG AA uyumlu, preset paletler, custom editor desteği.
 */

import { z } from 'zod';

// Tema modları
export type ThemeMode = 'system' | 'light' | 'dark' | 'scheduled';
export type Radius = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Density = 'compact' | 'regular' | 'cozy';

// Radius değerleri (px)
export const RADIUS_VALUES: Record<Radius, number> = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24
};

// Density spacing çarpanları
export const DENSITY_MULTIPLIERS: Record<Density, number> = {
  compact: 0.8,
  regular: 1.0,
  cozy: 1.2
};

// Theme schema (Zod validation)
export const ThemeTokensSchema = z.object({
  mode: z.enum(['system', 'light', 'dark', 'scheduled']),
  schedule: z.object({
    light: z.object({ hour: z.number().min(0).max(23), minute: z.number().min(0).max(59) }),
    dark: z.object({ hour: z.number().min(0).max(23), minute: z.number().min(0).max(59) })
  }).optional(),
  
  colors: z.object({
    // Core colors
    background: z.string().regex(/^#[0-9A-F]{6}$/i),
    surface: z.string().regex(/^#[0-9A-F]{6}$/i),
    card: z.string().regex(/^#[0-9A-F]{6}$/i),
    
    // Text colors
    text: z.string().regex(/^#[0-9A-F]{6}$/i),
    mutedText: z.string().regex(/^#[0-9A-F]{6}$/i),
    textOnPrimary: z.string().regex(/^#[0-9A-F]{6}$/i),
    
    // Primary colors (Legacy compat)
    primary: z.string().regex(/^#[0-9A-F]{6}$/i),
    bg: z.string().regex(/^#[0-9A-F]{6}$/i),
    bgSoft: z.string().regex(/^#[0-9A-F]{6}$/i),
    
    // Borders & dividers
    border: z.string().regex(/^#[0-9A-F]{6}$/i),
    
    // Accent & semantic colors
    accent: z.string().regex(/^#[0-9A-F]{6}$/i),
    success: z.string().regex(/^#[0-9A-F]{6}$/i),
    warning: z.string().regex(/^#[0-9A-F]{6}$/i),
    danger: z.string().regex(/^#[0-9A-F]{6}$/i),
    
    // Calendar colors
    periodColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    ovulationColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    fertileColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  }),
  
  typography: z.object({
    fontScale: z.number().min(0.85).max(1.25)
  }),
  
  spacing: z.object({
    xs: z.number(),
    sm: z.number(),
    md: z.number(),
    lg: z.number(),
    xl: z.number(),
    xxl: z.number()
  }),
  
  radius: z.enum(['sm', 'md', 'lg', 'xl', '2xl']),
  density: z.enum(['compact', 'regular', 'cozy']),
  shadows: z.boolean(),
  haptics: z.boolean()
});

export type ThemeTokens = z.infer<typeof ThemeTokensSchema>;

// WCAG Kontrast hesaplama
export function contrastRatio(hex1: string, hex2: string): number {
  const luminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };
  
  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AA kontrolü
export function ensureAA(fg: string, bg: string): { ok: boolean; ratio: number } {
  const ratio = contrastRatio(fg, bg);
  return {
    ok: ratio >= 4.5,
    ratio
  };
}

// PRESET PALETLER

export const LIGHT_PRESET: ThemeTokens = {
  mode: 'light',
  colors: {
    // Core colors
    background: '#FFFFFF',
    surface: '#FFF6FB',
    card: '#FFE6F5',
    
    // Text colors
    text: '#1F2937',
    mutedText: '#6B7280',
    textOnPrimary: '#FFFFFF',
    
    // Primary colors (Legacy compat)
    primary: '#FF99CC',
    bg: '#FFFFFF',
    bgSoft: '#FFF6FB',
    
    // Borders
    border: '#E5E7EB',
    
    // Accent & semantic
    accent: '#FF99CC',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#EF4444',
    
    // Calendar colors
    periodColor: '#FF99CC',
    ovulationColor: '#9C27B0',
    fertileColor: '#E1BEE7',
  },
  typography: {
    fontScale: 1.0
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: 'lg',
  density: 'regular',
  shadows: true,
  haptics: true
};

export const DARK_PRESET: ThemeTokens = {
  mode: 'dark',
  colors: {
    // Core colors
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',
    
    // Text colors
    text: '#F1F5F9',
    mutedText: '#94A3B8',
    textOnPrimary: '#FFFFFF',
    
    // Primary colors (Legacy compat)
    primary: '#FF99CC',
    bg: '#0F172A',
    bgSoft: '#1E293B',
    
    // Borders
    border: '#475569',
    
    // Accent & semantic
    accent: '#FF99CC',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#EF4444',
    
    // Calendar colors
    periodColor: '#FF99CC',
    ovulationColor: '#BA68C8',
    fertileColor: '#CE93D8',
  },
  typography: {
    fontScale: 1.0
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: 'lg',
  density: 'regular',
  shadows: true,
  haptics: true
};

export const ROSE_PRESET: ThemeTokens = {
  mode: 'light',
  colors: {
    background: '#FFF1F2',
    surface: '#FFE4E6',
    card: '#FECDD3',
    text: '#881337',
    mutedText: '#9F1239',
    textOnPrimary: '#FFFFFF',
    primary: '#E11D48',
    bg: '#FFF1F2',
    bgSoft: '#FFE4E6',
    border: '#FDA4AF',
    accent: '#E11D48',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#EF4444',
    periodColor: '#E11D48',
    ovulationColor: '#BE123C',
    fertileColor: '#FECDD3',
  },
  typography: {
    fontScale: 1.0
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: 'xl',
  density: 'cozy',
  shadows: true,
  haptics: true
};

export const MINT_PRESET: ThemeTokens = {
  mode: 'light',
  colors: {
    background: '#F0FDF4',
    surface: '#DCFCE7',
    card: '#BBF7D0',
    text: '#14532D',
    mutedText: '#166534',
    textOnPrimary: '#FFFFFF',
    primary: '#10B981',
    bg: '#F0FDF4',
    bgSoft: '#DCFCE7',
    border: '#86EFAC',
    accent: '#10B981',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#EF4444',
    periodColor: '#EC4899',
    ovulationColor: '#10B981',
    fertileColor: '#BBF7D0',
  },
  typography: {
    fontScale: 1.0
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: 'md',
  density: 'regular',
  shadows: true,
  haptics: true
};

export const AMBER_PRESET: ThemeTokens = {
  mode: 'light',
  colors: {
    background: '#FFFBEB',
    surface: '#FEF3C7',
    card: '#FDE68A',
    text: '#78350F',
    mutedText: '#92400E',
    textOnPrimary: '#FFFFFF',
    primary: '#F59E0B',
    bg: '#FFFBEB',
    bgSoft: '#FEF3C7',
    border: '#FCD34D',
    accent: '#F59E0B',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#EF4444',
    periodColor: '#EC4899',
    ovulationColor: '#F59E0B',
    fertileColor: '#FDE68A',
  },
  typography: {
    fontScale: 1.0
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: 'lg',
  density: 'regular',
  shadows: true,
  haptics: true
};

// Preset koleksiyonu (lowercase keys)
export const THEME_PRESETS = {
  light: LIGHT_PRESET,
  dark: DARK_PRESET,
  rose: ROSE_PRESET,
  mint: MINT_PRESET,
  amber: AMBER_PRESET
} as const;

export type PresetName = keyof typeof THEME_PRESETS;

// Android Monet renkleri ile tema oluştur
export function tokensFromDynamicMonet(monet: {
  accent: string;
  background: string;
  surface: string;
  text: string;
}): ThemeTokens {
  // Monet renklerini normalize et
  const accent = monet.accent.toUpperCase();
  const background = monet.background.toUpperCase();
  const surface = monet.surface.toUpperCase();
  const text = monet.text.toUpperCase();
  
  // Kontrast kontrolü
  const textContrast = ensureAA(text, background);
  
  return {
    mode: 'system',
    colors: {
      background,
      surface,
      card: surface,
      text: textContrast.ok ? text : '#1F2937', // Fallback
      mutedText: adjustBrightness(text, 0.7),
      border: adjustBrightness(surface, 1.2),
      accent,
      success: '#4ADE80',
      warning: '#FBBF24',
      danger: '#EF4444'
    },
    typography: {
      fontScale: 1.0
    },
    radius: 'lg',
    density: 'regular',
    shadows: true,
    haptics: true
  };
}

// Renk parlaklığını ayarla
function adjustBrightness(hex: string, factor: number): string {
  const rgb = parseInt(hex.slice(1), 16);
  let r = (rgb >> 16) & 0xff;
  let g = (rgb >> 8) & 0xff;
  let b = rgb & 0xff;
  
  r = Math.min(255, Math.floor(r * factor));
  g = Math.min(255, Math.floor(g * factor));
  b = Math.min(255, Math.floor(b * factor));
  
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
}

// Tema geçerli mi kontrol et
export function validateTheme(theme: unknown): theme is ThemeTokens {
  try {
    ThemeTokensSchema.parse(theme);
    return true;
  } catch {
    return false;
  }
}

// Deep merge helper
export function mergeThemeTokens(base: ThemeTokens, partial: Partial<ThemeTokens>): ThemeTokens {
  return {
    ...base,
    ...partial,
    colors: {
      ...base.colors,
      ...(partial.colors || {})
    },
    typography: {
      ...base.typography,
      ...(partial.typography || {})
    },
    schedule: partial.schedule || base.schedule
  };
}

