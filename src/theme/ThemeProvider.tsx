import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightColors } from './lightColors';
import { darkColors } from './darkColors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { lightGradients, darkGradients } from './gradients';

export interface Theme {
  colors: typeof lightColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  gradients: typeof lightGradients;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useSelector((state: RootState) => state.settings.theme);

  const currentColors = theme === 'dark' ? darkColors : lightColors;
  const currentGradients = theme === 'dark' ? darkGradients : lightGradients;

  const themeValue: Theme = {
    colors: currentColors,
    typography,
    spacing,
    borderRadius,
    shadows,
    gradients: currentGradients,
    isDark: theme === 'dark',
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
