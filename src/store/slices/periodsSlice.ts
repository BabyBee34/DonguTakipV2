import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PeriodSpan } from '../../types';

const periodsSlice = createSlice({
  name: 'periods',
  initialState: [] as PeriodSpan[],
  reducers: {
    addPeriod(state, action: PayloadAction<PeriodSpan>) { 
      state.push(action.payload); 
    },
    updatePeriod(state, action: PayloadAction<PeriodSpan>) {
      const idx = state.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) state[idx] = action.payload;
    },
    deletePeriod(state, action: PayloadAction<string>) {
      return state.filter(p => p.id !== action.payload);
    },
    clearActivePeriods(state) {
      // Bitişi olmayan (aktif) period'ları temizle
      return state.filter(p => p.end !== undefined && p.end !== null);
    },
    clearAllPeriods() {
      return [];
    },
  },
});

export const { 
  addPeriod, 
  updatePeriod, 
  deletePeriod, 
  clearActivePeriods, 
  clearAllPeriods 
} = periodsSlice.actions;

export default periodsSlice.reducer;

