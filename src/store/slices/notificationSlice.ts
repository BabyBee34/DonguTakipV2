import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationSettings } from '../../types';

interface NotificationState {
  settings: NotificationSettings;
  permissionGranted: boolean;
  isInitialized: boolean;
}

const initialState: NotificationState = {
  settings: {
    enabled: true,
    frequency: 'balanced',
    reminderTime: '09:00',
    periodReminder: true,
    waterReminder: false,
    dailyLogReminder: true,
  },
  permissionGranted: false,
  isInitialized: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setPermissionGranted: (state, action: PayloadAction<boolean>) => {
      state.permissionGranted = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    resetNotificationSettings: (state) => {
      state.settings = initialState.settings;
    },
  },
});

export const {
  setNotificationSettings,
  setPermissionGranted,
  setInitialized,
  resetNotificationSettings,
} = notificationSlice.actions;

export default notificationSlice.reducer;
