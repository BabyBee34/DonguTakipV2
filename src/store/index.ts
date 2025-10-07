import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import prefsReducer from './slices/prefsSlice';
import logsReducer from './slices/logsSlice';
import periodsReducer from './slices/periodsSlice';
import notificationReducer from './slices/notificationSlice';
import settingsReducer from './slices/settingsSlice';
import appReducer from './slices/appSlice';

const rootReducer = combineReducers({
  prefs: prefsReducer,
  logs: logsReducer,
  periods: periodsReducer,
  notification: notificationReducer,
  settings: settingsReducer,
  app: appReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['prefs', 'logs', 'periods', 'notification', 'settings', 'app'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({ 
  reducer: persistedReducer, 
  middleware: (getDefault) => getDefault({ 
    serializableCheck: {
      // redux-persist actionları ve expo-notifications objeleri için ignore
      ignoredActions: [
        'persist/PERSIST',
        'persist/REHYDRATE',
        'persist/PAUSE',
        'persist/PURGE',
        'persist/FLUSH',
        'persist/REGISTER',
      ],
      ignoredPaths: [
        // notification permission ya da listener referansları tutulursa hata vermesin
        'notification.permissionGranted',
      ],
    }
  }) 
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

