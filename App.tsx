﻿import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Text, BackHandler, Alert, StatusBar, Platform } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor, RootState } from './src/store';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import './src/i18n'; // Initialize i18n
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import SetupLastPeriod from './src/screens/setup/SetupLastPeriod';
import SetupPeriodLength from './src/screens/setup/SetupPeriodLength';
import SetupCycleLength from './src/screens/setup/SetupCycleLength';
import MainTabs from './src/screens/navigation/MainTabs';
import { setupNotificationListeners } from './src/services/notificationService';
import ErrorBoundary from './src/components/ErrorBoundary';
import AuthGate from './src/components/AuthGate';
import * as Notifications from 'expo-notifications';
import { hasPIN, removePIN } from './src/services/pinService';

// Notification handler - App bootstrap
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Android notification channel setup
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Genel',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 100, 50, 100],
    lightColor: '#FF4FA0',
  });
}

const Stack = createNativeStackNavigator();

// 🔧 GELİŞTİRME MODU
// Her açılışta onboarding görmek için true yapın
const DEV_MODE_SHOW_ONBOARDING = true;

function AppNavigator() {
  const onboardingCompleted = useSelector((state: RootState) => state.app.onboardingCompleted);
  const setupCompleted = useSelector((state: RootState) => state.app.setupCompleted);

  // Geliştirme modunda her zaman onboarding'den başla
  const shouldShowOnboarding = DEV_MODE_SHOW_ONBOARDING || !onboardingCompleted;
  const shouldShowSetup = !DEV_MODE_SHOW_ONBOARDING && !setupCompleted;

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
      initialRouteName={shouldShowOnboarding ? "Onboarding" : shouldShowSetup ? "Setup" : "MainTabs"}
    >
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{
          animation: 'fade',
          animationDuration: 400,
        }}
      />
      <Stack.Screen 
        name="Setup" 
        component={SetupLastPeriod}
        options={{
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      />
      <Stack.Screen 
        name="SetupPeriodLength" 
        component={SetupPeriodLength}
        options={{
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      />
      <Stack.Screen 
        name="SetupCycleLength" 
        component={SetupCycleLength}
        options={{
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      />
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{
          animation: 'fade',
          animationDuration: 400,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingPIN, setCheckingPIN] = useState(true);
  
  const ThemedStatusBar = () => {
    const { isDark } = useTheme();
    return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />;
  };

  // PIN kontrolü
  useEffect(() => {
    checkPINStatus();
  }, []);

  const checkPINStatus = async () => {
    const pinExists = await hasPIN();
    if (!pinExists) {
      setIsAuthenticated(true);
    }
    setCheckingPIN(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleForgotPIN = () => {
    Alert.alert(
      'PIN\'i Unut',
      'PIN\'i kaldırmak tüm verilerinizi silecektir. Bu işlem geri alınamaz!',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tüm Verileri Sil',
          style: 'destructive',
          onPress: async () => {
            await removePIN();
            // Store'u temizle (deleteAllData fonksiyonunu çağır)
            setIsAuthenticated(true);
            Alert.alert('Başarılı', 'PIN kaldırıldı ve tüm veriler silindi.');
          },
        },
      ]
    );
  };
  
  useEffect(() => {
    const onBackPress = () => {
      Alert.alert('Çıkış', 'Uygulamadan çıkmak istiyor musunuz?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Evet', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);
  
  if (!fontsLoaded || checkingPIN) {
    return null;
  }

  // Global Text font
  // @ts-ignore
  if (!Text.defaultProps) Text.defaultProps = {};
  // @ts-ignore
  Text.defaultProps.style = [{ fontFamily: 'Nunito_400Regular' }];

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <ThemedStatusBar />
            <ErrorBoundary>
              {!isAuthenticated ? (
                <AuthGate
                  onSuccess={handleAuthSuccess}
                  onForgotPIN={handleForgotPIN}
                />
              ) : (
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              )}
            </ErrorBoundary>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
