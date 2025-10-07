import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';

const initialState: AppSettings = { theme: 'light', language: 'tr', pinLock: false, biometricEnabled: false };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: { setSettings(state, action: PayloadAction<Partial<AppSettings>>) { return { ...state, ...action.payload }; } },
});
export const { setSettings } = settingsSlice.actions; export default settingsSlice.reducer;

