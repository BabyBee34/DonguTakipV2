/**
 * useThemeTokens - Basit Token Hook
 * 
 * Ekranlarda hex yerine token kullanmayı kolaylaştırır
 */

import { useTheme } from '../theme/ThemeProvider';

export function useThemeTokens() {
  const { theme, resolveColor, getSpacing, getBorderRadius, shadows } = useTheme();
  
  // Renk resolver (güvenli)
  const c = (token: keyof typeof theme.colors) => {
    return theme?.colors?.[token] || resolveColor(token);
  };
  
  // Spacing helper
  const sp = (multiplier: number) => getSpacing(multiplier);
  
  // Border radius helper
  const br = (size?: 'small' | 'medium' | 'large') => getBorderRadius(size);
  
  return {
    // Token object
    theme,
    
    // Helpers
    c,      // c('background') -> '#FFFFFF'
    sp,     // sp(2) -> 16 (8*2)
    br,     // br('large') -> 24
    
    // Direct access (güvenli)
    colors: theme?.colors || {},
    radius: theme?.radius || 'md',
    density: theme?.density || 'regular',
    fontScale: theme?.typography?.fontScale || 1.0,
    shadows: shadows,
    haptics: theme?.haptics || true
  };
}

// Legacy compat - mevcut kod için
export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

