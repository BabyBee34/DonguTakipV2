import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarScreen from '../CalendarScreen';
import DailyLogScreen from '../DailyLogScreen';
import ReportsScreen from '../ReportsScreen';
import SettingsScreen from '../SettingsScreen';
import { useTheme } from '../../theme/ThemeProvider';
import { Text, View } from 'react-native';
import { setupNotificationListeners } from '../../services/notificationService';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';

const Tab = createBottomTabNavigator();

export default function MainTabs({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Bildirim listener'ını kur
  useEffect(() => {
    const cleanup = setupNotificationListeners(navigation);
    return cleanup;
  }, [navigation]);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkLight,
        tabBarStyle: {
          height: 64,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          backgroundColor: colors.bg,
          elevation: 12,
        },
        tabBarItemStyle: { paddingVertical: 6 },
        // Tab geçiş animasyonu
        animation: 'fade',
      }}
    >
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => <Icon name="event" color={color} size={size} />,
          tabBarLabel: t('calendar.title'),
        }} 
      />
      <Tab.Screen 
        name="DailyLog" 
        component={DailyLogScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => <Icon name="edit" color={color} size={size} />,
          tabBarLabel: t('dailyLog.todayTitle'),
        }} 
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => <Icon name="insights" color={color} size={size} />,
          tabBarLabel: t('reports.title'),
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => <Icon name="settings" color={color} size={size} />,
          tabBarLabel: t('settings.title'),
        }} 
      />
    </Tab.Navigator>
  );
}
