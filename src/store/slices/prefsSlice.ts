import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CyclePrefs } from '../../types';

const initialState: CyclePrefs = { avgPeriodDays: 5, avgCycleDays: 28, lastPeriodStart: '' };

const prefsSlice = createSlice({
  name: 'prefs',
  initialState,
  reducers: {
    setPrefs(state, action: PayloadAction<Partial<CyclePrefs>>) {
      return { ...state, ...action.payload };
    },
  },
});
export const { setPrefs } = prefsSlice.actions; export default prefsSlice.reducer;

