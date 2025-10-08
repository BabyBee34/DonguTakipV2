import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationSettings } from '../../types';
import { REHYDRATE } from 'redux-persist';

interface NotificationState {
  settings: NotificationSettings;
  permissionGranted: boolean;
  isInitialized: boolean;
}

const initialState: NotificationState = {
  settings: {
    enabled: false,
    frequency: 'balanced',
    reminderTime: { hour: 9, minute: 0 },
    upcomingPeriodDays: 2,
    periodReminder: true,
    waterReminder: false,
    dailyLogReminder: true,
  },
  permissionGranted: false,
  isInitialized: false,
};

// Migration helper: eski string formatını object'e çevir
const migrateReminderTime = (reminderTime: any): { hour: number; minute: number } => {
  if (!reminderTime) {
    return { hour: 9, minute: 0 };
  }
  
  if (typeof reminderTime === 'string') {
    const [hourStr, minuteStr] = reminderTime.split(':');
    return {
      hour: parseInt(hourStr || '9', 10),
      minute: parseInt(minuteStr || '0', 10),
    };
  }
  
  if (typeof reminderTime === 'object' && 'hour' in reminderTime && 'minute' in reminderTime) {
    return reminderTime;
  }
  
  return { hour: 9, minute: 0 };
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      const newSettings = { ...state.settings, ...action.payload };
      // reminderTime'ı migrate et
      if (action.payload.reminderTime) {
        newSettings.reminderTime = migrateReminderTime(action.payload.reminderTime);
      }
      state.settings = newSettings;
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
  extraReducers: (builder) => {
    // Redux persist rehydrate sırasında eski formatı yeni formata çevir
    builder.addCase(REHYDRATE as any, (state, action: any) => {
      if (action.payload?.notification?.settings?.reminderTime) {
        const migratedTime = migrateReminderTime(action.payload.notification.settings.reminderTime);
        if (state.settings) {
          state.settings.reminderTime = migratedTime;
        }
      }
      
      // upcomingPeriodDays yoksa varsayılan değer ata
      if (action.payload?.notification?.settings && 
          action.payload.notification.settings.upcomingPeriodDays === undefined) {
        if (state.settings) {
          state.settings.upcomingPeriodDays = 2;
        }
      }
    });
  },
});

export const {
  setNotificationSettings,
  setPermissionGranted,
  setInitialized,
  resetNotificationSettings,
} = notificationSlice.actions;

export default notificationSlice.reducer;
