import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarScreen from '../CalendarScreen';
import DailyLogScreen from '../DailyLogScreen';
import ReportsScreen from '../ReportsScreen';
import SettingsScreen from '../SettingsScreen';
import PastelTabBar from '../../components/PastelTabBar';
import { setupNotificationListeners } from '../../services/notificationService';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

export default function MainTabs({ navigation }: any) {
  const { t } = useTranslation();

  // Bildirim listener'ını kur
  useEffect(() => {
    const cleanup = setupNotificationListeners(navigation);
    return cleanup;
  }, [navigation]);
  
  return (
    <Tab.Navigator
      tabBar={(props) => <PastelTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ 
          tabBarLabel: 'Takvim',
        }} 
      />
      <Tab.Screen 
        name="DailyLog" 
        component={DailyLogScreen} 
        options={{ 
          tabBarLabel: 'Günlük',
        }} 
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ 
          tabBarLabel: 'Rapor',
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          tabBarLabel: 'Ayarlar',
        }} 
      />
    </Tab.Navigator>
  );
}

