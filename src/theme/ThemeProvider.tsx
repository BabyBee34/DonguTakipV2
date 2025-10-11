import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { Appearance, AppState, AppStateStatus } from 'react-native';
import { 
  ThemeTokens, 
  ThemeMode, 
  PresetName, 
  LIGHT_PRESET, 
  DARK_PRESET,
  THEME_PRESETS,
  RADIUS_VALUES,
  DENSITY_MULTIPLIERS,
  mergeThemeTokens,
  Radius,
  Density
} from './tokens';
import { loadTheme, saveTheme, resetTheme as resetThemeStorage } from './themeStorage';
import { typography } from './typography';
import { spacing as baseSpacing, borderRadius as baseBorderRadius, shadows as baseShadows } from './spacing';
import { lightGradients, darkGradients } from './gradients';
import { lightColors } from './lightColors';
import { darkColors } from './darkColors';
import { logger } from '../services/logger';

export interface ThemeContextValue {
  theme: ThemeTokens;
  isDark: boolean;
  effectiveMode: 'light' | 'dark';
  
  // Setters
  setTheme: (partial: Partial<ThemeTokens>) => void;
  setMode: (mode: ThemeMode) => void;
  setAccent: (hex: string) => void;
  setRadius: (radius: Radius) => void;
  setDensity: (density: Density) => void;
  setFontScale: (scale: number) => void;
  
  // Presets
  applyPreset: (preset: PresetName) => void;
  resetTheme: () => void;
  
  // Helpers
  resolveColor: (token: keyof ThemeTokens['colors']) => string;
  getSpacing: (multiplier: number) => number;
  getBorderRadius: (size?: 'small' | 'medium' | 'large') => number;
  shadows: {
    sm: object;
    md: object;
    card: object;
  };
  
  // Legacy compat
  colors: any;
  typography: typeof typography;
  spacing: typeof baseSpacing;
  borderRadius: typeof baseBorderRadius;
  legacyShadows: typeof baseShadows;
  gradients: typeof lightGradients;
  toggleTheme: () => void;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeTokens>(LIGHT_PRESET);
  const [isLoading, setIsLoading] = useState(true);

  // Tema yükle ve normalize et
  useEffect(() => {
    loadTheme().then(loaded => {
      if (loaded) {
        // Tema normalize et - eksik alanları default ile doldur
        const normalized = {
          ...LIGHT_PRESET,
          ...loaded,
          colors: { ...LIGHT_PRESET.colors, ...loaded.colors },
          typography: { ...LIGHT_PRESET.typography, ...loaded.typography },
          spacing: { ...LIGHT_PRESET.spacing, ...loaded.spacing }
        };
        setThemeState(normalized);
      } else {
        setThemeState(LIGHT_PRESET);
      }
      setIsLoading(false);
    }).catch(error => {
      logger.error('[ThemeProvider] Failed to load theme', error);
      setThemeState(LIGHT_PRESET);
      setIsLoading(false);
    });
  }, []);

  // Tema kaydet
  const setTheme = useCallback((partial: Partial<ThemeTokens>) => {
    setThemeState(prev => {
      const merged = mergeThemeTokens(prev, partial);
      saveTheme(merged);
      return merged;
    });
  }, []);

  // Effective mode hesapla (system/scheduled için)
  const effectiveMode = useMemo((): 'light' | 'dark' => {
    // Theme henüz yüklenmemişse default'u döndür
    if (!theme || !theme.mode) {
      return 'light';
    }
    
    if (theme.mode === 'light') return 'light';
    if (theme.mode === 'dark') return 'dark';
    
    if (theme.mode === 'system') {
      const systemScheme = Appearance.getColorScheme();
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    
    if (theme.mode === 'scheduled' && theme.schedule) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const lightMinutes = theme.schedule.light.hour * 60 + theme.schedule.light.minute;
      const darkMinutes = theme.schedule.dark.hour * 60 + theme.schedule.dark.minute;
      
      if (lightMinutes < darkMinutes) {
        // Normal: 07:00 light -> 21:00 dark
        return currentMinutes >= lightMinutes && currentMinutes < darkMinutes ? 'light' : 'dark';
      } else {
        // Ters: 21:00 light -> 07:00 dark
        return currentMinutes >= lightMinutes || currentMinutes < darkMinutes ? 'light' : 'dark';
      }
    }
    
    return 'light';
  }, [theme?.mode, theme?.schedule]);

  // Sistem teması değişikliği izle
  useEffect(() => {
    if (!theme?.mode || theme.mode !== 'system') return;
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      logger.debug('[ThemeProvider] System theme changed', { colorScheme });
      // Force re-render
      setThemeState(prev => ({ ...prev }));
    });
    
    return () => subscription.remove();
  }, [theme?.mode]);

  // Scheduled mode için interval
  useEffect(() => {
    if (!theme?.mode || theme.mode !== 'scheduled' || !theme.schedule) return;
    
    // Her dakika kontrol et
    const interval = setInterval(() => {
      setThemeState(prev => ({ ...prev }));
    }, 60000); // 60 saniye
    
    return () => clearInterval(interval);
  }, [theme?.mode, theme?.schedule]);

  // App foreground olduğunda sync
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && theme?.mode === 'scheduled') {
        setThemeState(prev => ({ ...prev }));
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription.remove();
  }, [theme?.mode]);

  // Setters
  const setMode = useCallback((mode: ThemeMode) => {
    setTheme({ mode });
  }, [setTheme]);

  const setAccent = useCallback((hex: string) => {
    if (theme?.colors) {
      // Update accent AND primary for legacy compat
      setTheme({ colors: { ...theme.colors, accent: hex, primary: hex } });
    }
  }, [setTheme, theme?.colors]);

  const setRadius = useCallback((radius: Radius) => {
    setTheme({ radius });
  }, [setTheme]);

  const setDensity = useCallback((density: Density) => {
    setTheme({ density });
  }, [setTheme]);

  const setFontScale = useCallback((scale: number) => {
    setTheme({ typography: { ...theme?.typography, fontScale: scale } });
  }, [setTheme, theme?.typography]);

  // Presets
  const applyPreset = useCallback((preset: PresetName) => {
    const presetTheme = THEME_PRESETS[preset];
    
    if (presetTheme) {
      setThemeState(presetTheme);
      saveTheme(presetTheme);
      logger.debug('[ThemeProvider] Preset applied:', preset);
    } else {
      logger.warn('[ThemeProvider] Invalid preset:', preset);
    }
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState(LIGHT_PRESET);
    resetThemeStorage();
  }, []);

  // Helpers
  const resolveColor = useCallback((token: keyof ThemeTokens['colors']) => {
    return theme?.colors?.[token] || '#000000';
  }, [theme?.colors]);

  const getSpacing = useCallback((multiplier: number) => {
    const base = 8;
    const density = theme?.density || 'regular';
    
    // Debug: DENSITY_MULTIPLIERS undefined kontrolü
    if (!DENSITY_MULTIPLIERS) {
      console.warn('[ThemeProvider] DENSITY_MULTIPLIERS is undefined, using default 1.0');
      return base * multiplier * 1.0;
    }
    
    const densityMult = DENSITY_MULTIPLIERS[density] || 1.0;
    return base * multiplier * densityMult;
  }, [theme?.density]);

  const getBorderRadius = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    const radius = theme?.radius || 'md';
    const baseRadius = RADIUS_VALUES?.[radius] || 12;
    
    if (size === 'small') return baseRadius * 0.5;
    if (size === 'large') return baseRadius * 1.5;
    return baseRadius;
  }, [theme?.radius]);

  // Shadows helper (dinamik - dark mode'da daha az opacity)
  const shadows = useMemo(() => {
    const isDarkMode = effectiveMode === 'dark';
    const opacityMultiplier = isDarkMode ? 0.5 : 1.0;
    
    return {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05 * opacityMultiplier,
        shadowRadius: 2,
        elevation: isDarkMode ? 2 : 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1 * opacityMultiplier,
        shadowRadius: 4,
        elevation: isDarkMode ? 3 : 2,
      },
      card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15 * opacityMultiplier,
        shadowRadius: 8,
        elevation: isDarkMode ? 6 : 4,
      }
    };
  }, [effectiveMode]);

  // Legacy compat
  const toggleTheme = useCallback(() => {
    const newMode = effectiveMode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [effectiveMode, setMode]);

  const setThemeMode = useCallback((mode: 'system' | 'light' | 'dark') => {
    setMode(mode);
  }, [setMode]);

  // Legacy colors object (geriye dönük uyumluluk)
  // Now uses theme.colors as the primary source
  const colors = useMemo(() => {
    const themeColors = theme?.colors || {};
    
    // Merge with legacy colors but prioritize theme.colors
    const baseColors = effectiveMode === 'dark' ? darkColors : lightColors;
    
    return {
      ...baseColors,
      ...themeColors,  // Theme colors override base colors
      // Ensure all required fields exist
      background: themeColors.background || baseColors.background,
      text: themeColors.text || baseColors.text,
      primary: themeColors.primary || themeColors.accent || baseColors.primary,
      accent: themeColors.accent || baseColors.accent,
    };
  }, [effectiveMode, theme?.colors]);

  const gradients = effectiveMode === 'dark' ? darkGradients : lightGradients;

  const value: ThemeContextValue = useMemo(() => ({
    theme,
    isDark: effectiveMode === 'dark',
    effectiveMode,
    
    setTheme,
    setMode,
    setAccent,
    setRadius,
    setDensity,
    setFontScale,
    
    applyPreset,
    resetTheme,
    
    resolveColor,
    getSpacing,
    getBorderRadius,
    shadows,
    
    // Legacy
    colors,
    typography,
    spacing: baseSpacing,
    borderRadius: baseBorderRadius,
    legacyShadows: baseShadows,
    gradients,
    toggleTheme,
    setThemeMode
  }), [
    theme,
    effectiveMode,
    setTheme,
    setMode,
    setAccent,
    setRadius,
    setDensity,
    setFontScale,
    applyPreset,
    resetTheme,
    resolveColor,
    getSpacing,
    getBorderRadius,
    shadows,
    colors,
    gradients,
    toggleTheme,
    setThemeMode
  ]);

  if (isLoading) {
    return null; // Veya loading screen
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
