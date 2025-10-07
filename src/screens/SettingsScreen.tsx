import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, persistor } from '../store';
import { setPrefs } from '../store/slices/prefsSlice';
import { setNotificationSettings, setPermissionGranted } from '../store/slices/notificationSlice';
import { setSettings } from '../store/slices/settingsSlice';
import { clearActivePeriods } from '../store/slices/periodsSlice';
import { useTheme } from '../theme/ThemeProvider';
import Slider from '@react-native-community/slider';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { 
  requestNotificationPermission, 
  scheduleNotifications, 
  cancelAllScheduledNotificationsAsync,
  calculateNextPeriodDate 
} from '../services/notificationService';
import { exportDataToJSON, importDataFromJSON, deleteAllData } from '../services/storage';
import * as DocumentPicker from 'expo-document-picker';
import Icon from '../components/Icon';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  type: 'toggle' | 'slider' | 'date' | 'action' | 'info';
  label: string;
  description?: string;
  value?: any;
  onPress?: () => void;
  onValueChange?: (value: any) => void;
  min?: number;
  max?: number;
  step?: number;
  danger?: boolean;
}

export default function SettingsScreen() {
  const { colors, spacing, borderRadius, shadows, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const prefs = useSelector((state: RootState) => state.prefs);
  const periods = useSelector((state: RootState) => state.periods);
  const logs = useSelector((state: RootState) => state.logs);
  const notificationState = useSelector((state: RootState) => state.notification);
  const settings = useSelector((state: RootState) => state.settings);
  
  const [notifications, setNotifications] = useState(notificationState.settings.enabled);
  const [notificationFrequency, setNotificationFrequency] = useState(notificationState.settings.frequency);
  const [reminderTime, setReminderTime] = useState(notificationState.settings.reminderTime);
  const [periodReminder, setPeriodReminder] = useState(notificationState.settings.periodReminder);

  // Bildirim izni kontrolü ve kullanıcı bilgilendirmesi
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await requestNotificationPermission();
      dispatch(setPermissionGranted(granted));
      if (!granted && notifications) {
        Alert.alert(
          t('notifications.permission.title'),
          t('notifications.permission.message'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('notifications.permission.grant'),
              onPress: () => requestNotificationPermission(),
            },
          ]
        );
      }
    };
    checkPermission();
  }, [dispatch]);

  const openDatePicker = () => {
    const initial = prefs.lastPeriodStart ? new Date(prefs.lastPeriodStart) : new Date();
    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      is24Hour: true,
      onChange: (_event, selected) => {
        if (selected) {
          const iso = new Date(selected).toISOString().slice(0, 10);
          
          // Aktif period varsa uyar
          const activePeriod = periods.find(p => !p.end);
          if (activePeriod) {
            Alert.alert(
              t('common.warning'),
              t('settings.cycle.lastPeriodStart'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                { 
                  text: t('common.confirm'), 
                  onPress: () => {
                    dispatch(clearActivePeriods());
                    dispatch(setPrefs({
                      ...prefs,
                      lastPeriodStart: iso,
                    }));
                    Alert.alert(t('common.success'), t('settings.cycle.lastPeriodStart'));
                  }
                }
              ]
            );
          } else {
            dispatch(setPrefs({
              ...prefs,
              lastPeriodStart: iso,
            }));
            Alert.alert(t('common.success'), t('settings.cycle.lastPeriodStart'));
          }
        }
      },
    });
  };

  const openTimePicker = () => {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const initial = new Date();
    initial.setHours(hours, minutes, 0);
    
    DateTimePickerAndroid.open({
      value: initial,
      mode: 'time',
      is24Hour: true,
      onChange: async (_event, selected) => {
        if (selected) {
          const hours = selected.getHours().toString().padStart(2, '0');
          const minutes = selected.getMinutes().toString().padStart(2, '0');
          const timeString = `${hours}:${minutes}`;
          
          setReminderTime(timeString);
          await updateNotificationSettings({ reminderTime: timeString });
          
          Alert.alert(t('common.success'), `${t('settings.notifications.reminderTime')}: ${timeString}`);
        }
      },
    });
  };

  const handleExportData = async () => {
    Alert.alert(
      t('settings.data.export'),
      t('settings.data.exportConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.data.export'), 
          onPress: async () => {
            try {
              // Redux state'i al
              const state = {
                prefs,
                periods,
                logs,
                settings,
                notifications: notificationState,
              };

              await exportDataToJSON(state);
              Alert.alert(t('common.success'), t('settings.data.exportSuccess'));
            } catch (error) {
              Alert.alert(t('common.error'), 'Veri dışa aktarılamadı. Lütfen tekrar deneyin.');
            }
          }
        }
      ]
    );
  };

  const handleImportData = async () => {
    Alert.alert(
      t('settings.data.import'),
      t('settings.data.importConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.selectFile'), 
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });

              if (result.canceled) {
                return;
              }

              const fileUri = result.assets[0].uri;
              const importedData = await importDataFromJSON(fileUri);

              // Double confirmation
              Alert.alert(
                t('settings.data.import'),
                t('settings.data.importConfirm'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { 
                    text: t('common.confirm'), 
                    style: 'destructive',
                    onPress: () => {
                      // Import verileri Redux'a yükle
                      if (importedData.prefs) dispatch(setPrefs(importedData.prefs));
                      if (importedData.settings) dispatch(setSettings(importedData.settings));
                      if (importedData.notifications) dispatch(setNotificationSettings(importedData.notifications.settings));
                      
                      Alert.alert(t('common.success'), t('settings.data.import'));
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Import error:', error);
              Alert.alert(t('common.error'), t('settings.data.import'));
            }
          }
        }
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('settings.data.delete'),
      t('settings.data.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive', 
          onPress: () => {
            // Double confirmation
            Alert.alert(
              t('common.warning'),
              t('settings.data.deleteConfirm'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('common.delete'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAllData();
                      await persistor.purge();
                      Alert.alert(
                        t('common.success'), 
                        t('settings.data.deleteSuccess'),
                        [{ text: t('common.ok') }]
                      );
                    } catch (error) {
                      Alert.alert(t('common.error'), t('settings.data.delete'));
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  // Bildirim ayarlarını güncelle
  const updateNotificationSettings = async (newSettings: Partial<typeof notificationState.settings>) => {
    const updatedSettings = { ...notificationState.settings, ...newSettings };
    dispatch(setNotificationSettings(updatedSettings));
    
    // Bildirimleri yeniden planla
    const nextPeriodDate = calculateNextPeriodDate({ prefs } as RootState);
    await scheduleNotifications(updatedSettings, nextPeriodDate);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotifications(enabled);
    await updateNotificationSettings({ enabled });
    
    if (!enabled) {
      await cancelAllScheduledNotificationsAsync();
    }
  };

  const handleFrequencyChange = async (frequency: 'low' | 'balanced' | 'high') => {
    setNotificationFrequency(frequency);
    await updateNotificationSettings({ frequency });
  };

  const handlePeriodReminderToggle = async (enabled: boolean) => {
    setPeriodReminder(enabled);
    await updateNotificationSettings({ periodReminder: enabled });
  };

  const handleLanguageChange = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'tr' ? 'en' : 'tr';
    
    i18n.changeLanguage(newLang);
    dispatch(setSettings({ language: newLang }));
    
    Alert.alert(
      'Başarılı',
      `Dil ${newLang === 'tr' ? 'Türkçe' : 'English'} olarak değiştirildi`
    );
  };

  const handleThemeChange = () => {
    const currentTheme = settings.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    dispatch(setSettings({ theme: newTheme }));
    
    Alert.alert(
      'Başarılı',
      `Tema ${newTheme === 'light' ? 'Açık' : 'Karanlık'} olarak değiştirildi`
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      title: t('settings.sections.cycle'),
      items: [
        {
          id: 'avgPeriodDays',
          type: 'slider',
          label: t('settings.cycle.avgPeriodDays'),
          description: `${prefs.avgPeriodDays} ${t('reports.stats.days')}`,
          value: prefs.avgPeriodDays,
          min: 3,
          max: 10,
          step: 1,
          onValueChange: (value) => {
            dispatch(setPrefs({
              ...prefs,
              avgPeriodDays: Math.round(value),
            }));
          },
        },
        {
          id: 'avgCycleDays',
          type: 'slider',
          label: t('settings.cycle.avgCycleDays'),
          description: `${prefs.avgCycleDays} ${t('reports.stats.days')}`,
          value: prefs.avgCycleDays,
          min: 21,
          max: 35,
          step: 1,
          onValueChange: (value) => {
            dispatch(setPrefs({
              ...prefs,
              avgCycleDays: Math.round(value),
            }));
          },
        },
        {
          id: 'lastPeriodStart',
          type: 'date',
          label: t('settings.cycle.lastPeriodStart'),
          description: prefs.lastPeriodStart || t('settings.cycle.notSelected'),
          onPress: openDatePicker,
        },
      ],
    },
    {
      title: t('settings.sections.notifications'),
      items: [
        {
          id: 'notifications',
          type: 'toggle',
          label: t('settings.notifications.enable'),
          description: t('settings.notifications.enableDescription'),
          value: notifications,
          onValueChange: handleNotificationToggle,
        },
        {
          id: 'notificationFrequency',
          type: 'action',
          label: t('settings.notifications.frequency'),
          description: t(`settings.notifications.frequencyOptions.${notificationFrequency}` as any),
          onPress: () => {
            // Sıradaki moda geç
            const modes: Array<'low' | 'balanced' | 'high'> = ['low', 'balanced', 'high'];
            const currentIndex = modes.indexOf(notificationFrequency);
            const nextIndex = (currentIndex + 1) % modes.length;
            const nextMode = modes[nextIndex];
            
            handleFrequencyChange(nextMode);
            
            Alert.alert(t('common.success'), `${t('settings.notifications.frequency')}: ${t(`settings.notifications.frequencyOptions.${nextMode}` as any)}`);
          },
        },
        {
          id: 'reminderTime',
          type: 'action',
          label: t('settings.notifications.reminderTime'),
          description: reminderTime,
          onPress: openTimePicker,
        },
        {
          id: 'periodReminder',
          type: 'toggle',
          label: t('settings.notifications.periodReminder'),
          description: t('settings.notifications.periodReminderDescription'),
          value: periodReminder,
          onValueChange: handlePeriodReminderToggle,
        },
      ],
    },
    {
      title: t('settings.sections.appearance'),
      items: [
        {
          id: 'theme',
          type: 'action',
          label: t('settings.appearance.theme'),
          description: isDark ? t('settings.appearance.theme') : t('settings.appearance.themeLight'),
          onPress: handleThemeChange,
        },
        {
          id: 'language',
          type: 'action',
          label: t('settings.appearance.language'),
          description: i18n.language === 'tr' ? 'Türkçe' : 'English',
          onPress: handleLanguageChange,
        },
      ],
    },
    {
      title: t('settings.sections.privacy'),
      items: [
        {
          id: 'privacy',
          type: 'info',
          label: t('settings.privacy.dataSecurity'),
          description: t('settings.privacy.dataSecurityDescription'),
        },
        {
          id: 'pin',
          type: 'action',
          label: t('settings.privacy.pinLock'),
          description: t('settings.privacy.pinLockDescription'),
          onPress: () => {
            Alert.alert(t('common.info'), t('settings.privacy.pinLockDescription'));
          },
        },
      ],
    },
    {
      title: t('settings.sections.data'),
      items: [
        {
          id: 'export',
          type: 'action',
          label: t('settings.data.export'),
          description: t('settings.data.exportDescription'),
          onPress: handleExportData,
        },
        {
          id: 'import',
          type: 'action',
          label: t('settings.data.import'),
          description: t('settings.data.importDescription'),
          onPress: handleImportData,
        },
        {
          id: 'delete',
          type: 'action',
          label: t('settings.data.delete'),
          description: t('settings.data.deleteDescription'),
          onPress: handleDeleteAllData,
          danger: true,
        },
      ],
    },
    {
      title: t('settings.sections.about'),
      items: [
        {
          id: 'version',
          type: 'info',
          label: t('settings.about.version'),
          description: '1.0.0',
        },
        {
          id: 'medical',
          type: 'info',
          label: t('settings.about.medical'),
          description: t('settings.about.medicalDescription'),
        },
        {
          id: 'privacy-policy',
          type: 'action',
          label: t('settings.about.privacyPolicy'),
          description: t('settings.about.privacyPolicyDescription'),
          onPress: () => {
            Alert.alert(
              t('settings.about.privacyPolicy'),
              t('settings.about.privacyPolicyText'),
              [{ text: t('common.ok') }]
            );
          },
        },
        {
          id: 'contact',
          type: 'action',
          label: t('settings.about.contact'),
          description: t('settings.about.contactEmail'),
          onPress: () => {
            Alert.alert(t('settings.about.contact'), `E-mail: ${t('settings.about.contactEmail')}`);
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingsItem) => {
    const baseStyle = {
      backgroundColor: colors.bg,
      borderRadius: borderRadius.card,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      ...shadows.card,
    };

    const dangerStyle = item.danger ? {
      borderLeftWidth: 4,
      borderLeftColor: colors.danger,
    } : {};

    // Action ve Date tipindeki itemleri tıklanabilir yap
    if (item.type === 'action' || item.type === 'date') {
      return (
        <TouchableOpacity 
          key={item.id} 
          style={[baseStyle, dangerStyle]}
          onPress={item.onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityHint={item.description}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: item.danger ? colors.danger : colors.ink,
                marginBottom: spacing.xs 
              }}>
                {item.label}
              </Text>
              {item.description && (
                <Text style={{ fontSize: 14, color: colors.inkSoft }}>
                  {item.description}
                </Text>
              )}
            </View>
            <Text style={{ fontSize: 24, color: colors.inkLight, fontWeight: '300' }}>›</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Diğer tipler için normal View
    return (
      <View key={item.id} style={[baseStyle, dangerStyle]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: spacing.md }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: item.danger ? colors.danger : colors.ink,
              marginBottom: spacing.xs 
            }}>
              {item.label}
            </Text>
            {item.description && (
              <Text style={{ fontSize: 14, color: colors.inkSoft }}>
                {item.description}
              </Text>
            )}
          </View>

          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: colors.bgGray, true: colors.primary200 }}
              thumbColor={item.value ? colors.primary : colors.inkLight}
              accessibilityRole="switch"
              accessibilityLabel={item.label}
              accessibilityHint={item.description}
            />
          )}

          {item.type === 'slider' && (
            <View style={{ width: 120 }}>
              <Slider
                minimumValue={item.min}
                maximumValue={item.max}
                step={item.step}
                value={item.value}
                onValueChange={item.onValueChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.bgGray}
                thumbTintColor={colors.primary}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgSoft }}>
      <View style={{ padding: spacing.xl, paddingTop: spacing.xxl }}>
        <LinearGradient colors={[colors.bgSoft, colors.bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: borderRadius.card, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.card }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.ink }}>
            {t('settings.title')}
          </Text>
        </LinearGradient>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{ marginBottom: spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.sm }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, ...shadows.card }}>
                {section.title === t('settings.sections.cycle') && <Icon name="autorenew" size={18} color={colors.primary} />}
                {section.title === t('settings.sections.notifications') && <Icon name="notifications" size={18} color={colors.primary} />}
                {section.title === t('settings.sections.appearance') && <Icon name="palette" size={18} color={colors.primary} />}
                {section.title === t('settings.sections.privacy') && <Icon name="lock" size={18} color={colors.primary} />}
                {section.title === t('settings.sections.data') && <Icon name="backup" size={18} color={colors.primary} />}
                {section.title === t('settings.sections.about') && <Icon name="info" size={18} color={colors.primary} />}
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>
                {section.title}
              </Text>
            </View>
            
            {section.items.map(renderSettingItem)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}