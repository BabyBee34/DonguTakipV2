import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';
import { PaletteId, getPalette, DEFAULT_PALETTE } from '../../theme/palettes';

// Extended settings with theme customization
export interface ExtendedSettings extends AppSettings {
  themeMode: 'system' | 'light' | 'dark' | 'custom';
  themeCustom: {
    primary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    mutedText: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
  selectedPaletteId?: PaletteId;
}

const initialState: ExtendedSettings = { 
  theme: 'light', 
  language: 'tr', 
  pinLock: false, 
  biometricEnabled: false,
  themeMode: 'system',
  themeCustom: { ...DEFAULT_PALETTE.colors },
  selectedPaletteId: 'rose'
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: { 
    setSettings(state, action: PayloadAction<Partial<AppSettings>>) { 
      return { ...state, ...action.payload }; 
    },
    setThemeMode(state, action: PayloadAction<'system' | 'light' | 'dark' | 'custom'>) {
      state.themeMode = action.payload;
      // Legacy theme field'i de güncelle
      if (action.payload !== 'custom') {
        state.theme = action.payload === 'system' ? 'light' : action.payload;
      }
    },
    applyPalette(state, action: PayloadAction<PaletteId>) {
      const palette = getPalette(action.payload);
      state.themeCustom = { ...palette.colors };
      state.selectedPaletteId = action.payload;
      state.themeMode = 'custom';
    },
    setCustomColor(state, action: PayloadAction<{ key: keyof ExtendedSettings['themeCustom'], value: string }>) {
      const { key, value } = action.payload;
      state.themeCustom[key] = value;
      state.themeMode = 'custom';
    },
    resetCustomTheme(state) {
      const palette = getPalette(state.selectedPaletteId || 'rose');
      state.themeCustom = { ...palette.colors };
      state.themeMode = 'system';
    },
  },
});

export const { 
  setSettings, 
  setThemeMode, 
  applyPalette, 
  setCustomColor, 
  resetCustomTheme 
} = settingsSlice.actions; 

export default settingsSlice.reducer;

