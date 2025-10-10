import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PeriodSpan } from '../../types';

// Otomatik hesaplama helper fonksiyonları
const calculatePeriodLengthDays = (start: string, end?: string): number | undefined => {
  if (!end) return undefined;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // İlk ve son gün dahil
};

const calculateCycleLengthDays = (currentStart: string, periods: PeriodSpan[]): number | undefined => {
  // Mevcut period'dan önceki period'ları bul (tarih sıralı)
  const sortedPeriods = [...periods]
    .filter(p => p.start < currentStart)
    .sort((a, b) => b.start.localeCompare(a.start));
  
  if (sortedPeriods.length === 0) return undefined;
  
  const previousPeriod = sortedPeriods[0];
  const currentDate = new Date(currentStart);
  const previousDate = new Date(previousPeriod.start);
  const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const periodsSlice = createSlice({
  name: 'periods',
  initialState: [] as PeriodSpan[],
  reducers: {
    addPeriod(state, action: PayloadAction<PeriodSpan>) {
      const period = { ...action.payload };
      
      // Otomatik hesaplamalar
      period.periodLengthDays = calculatePeriodLengthDays(period.start, period.end);
      period.cycleLengthDays = calculateCycleLengthDays(period.start, state);
      
      state.push(period);
    },
    updatePeriod(state, action: PayloadAction<PeriodSpan>) {
      const idx = state.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) {
        const period = { ...action.payload };
        
        // Otomatik hesaplamalar
        period.periodLengthDays = calculatePeriodLengthDays(period.start, period.end);
        // Cycle length hesaplanırken güncellenecek period'u hariç tut
        const otherPeriods = state.filter(p => p.id !== period.id);
        period.cycleLengthDays = calculateCycleLengthDays(period.start, otherPeriods);
        
        state[idx] = period;
      }
    },
    deletePeriod(state, action: PayloadAction<string>) {
      return state.filter(p => p.id !== action.payload);
    },
    setPeriods(state, action: PayloadAction<PeriodSpan[]>) {
      return action.payload;
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
  setPeriods,
  clearActivePeriods, 
  clearAllPeriods 
} = periodsSlice.actions;

// Alias for consistency
export const clearPeriods = clearAllPeriods;

export default periodsSlice.reducer;

