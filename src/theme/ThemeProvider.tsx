import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setSettings } from '../store/slices/settingsSlice';
import { lightColors } from './lightColors';
import { darkColors } from './darkColors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { lightGradients, darkGradients } from './gradients';
import { Appearance } from 'react-native';

export interface Theme {
  colors: typeof lightColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  gradients: typeof lightGradients;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
}

const ThemeContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const themeMode = settings.theme || 'system';

  // Sistem temasını kullan
  const systemColorScheme = Appearance.getColorScheme();
  const effectiveTheme = themeMode === 'system' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : themeMode;

  const currentColors = effectiveTheme === 'dark' ? darkColors : lightColors;
  const currentGradients = effectiveTheme === 'dark' ? darkGradients : lightGradients;

  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    dispatch(setSettings({ ...settings, theme: newTheme }));
  };

  const setThemeMode = (mode: 'system' | 'light' | 'dark') => {
    dispatch(setSettings({ ...settings, theme: mode }));
  };

  const themeValue: Theme = {
    colors: currentColors,
    typography,
    spacing,
    borderRadius,
    shadows,
    gradients: currentGradients,
    isDark: effectiveTheme === 'dark',
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
