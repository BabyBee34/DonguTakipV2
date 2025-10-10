import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DailyLog } from '../../types';

const logsSlice = createSlice({
  name: 'logs',
  initialState: [] as DailyLog[],
  reducers: {
    addLog(state, action: PayloadAction<DailyLog>) { 
      // Aynı tarih için duplicate kontrolü
      const existingIndex = state.findIndex(l => l.date === action.payload.date);
      if (existingIndex >= 0) {
        // Varsa güncelle
        state[existingIndex] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Yoksa ekle
        state.push(action.payload);
      }
    },
    updateLog(state, action: PayloadAction<DailyLog>) {
      const idx = state.findIndex(l => l.id === action.payload.id);
      if (idx >= 0) {
        state[idx] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteLog(state, action: PayloadAction<string>) {
      return state.filter(l => l.id !== action.payload);
    },
    setLogs(state, action: PayloadAction<DailyLog[]>) {
      return action.payload;
    },
    clearLogs() {
      return [];
    },
  },
});

export const { addLog, updateLog, deleteLog, setLogs, clearLogs } = logsSlice.actions;
export default logsSlice.reducer;

