import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppFlags { 
  onboardingCompleted: boolean; 
  setupCompleted: boolean; 
}

const initialState: AppFlags = { 
  onboardingCompleted: false, 
  setupCompleted: false 
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnboardingCompleted(state, action: PayloadAction<boolean>) { 
      state.onboardingCompleted = action.payload; 
    },
    setSetupCompleted(state, action: PayloadAction<boolean>) { 
      state.setupCompleted = action.payload; 
    },
    resetApp() {
      return initialState;
    },
  },
});

export const { 
  setOnboardingCompleted, 
  setSetupCompleted, 
  resetApp 
} = appSlice.actions;

export default appSlice.reducer;

