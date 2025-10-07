import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DailyLog } from '../../types';

const logsSlice = createSlice({
  name: 'logs',
  initialState: [] as DailyLog[],
  reducers: {
    addLog(state, action: PayloadAction<DailyLog>) { 
      state.push(action.payload); 
    },
    updateLog(state, action: PayloadAction<DailyLog>) {
      const idx = state.findIndex(l => l.id === action.payload.id);
      if (idx >= 0) state[idx] = action.payload;
    },
    deleteLog(state, action: PayloadAction<string>) {
      return state.filter(l => l.id !== action.payload);
    },
    clearLogs() {
      return [];
    },
  },
});

export const { addLog, updateLog, deleteLog, clearLogs } = logsSlice.actions;
export default logsSlice.reducer;

