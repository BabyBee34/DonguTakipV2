import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { setPrefs } from '../store/slices/prefsSlice';
import { setNotificationSettings, setPermissionGranted } from '../store/slices/notificationSlice';
import { setSettings } from '../store/slices/settingsSlice';
import { clearLogs } from '../store/slices/logsSlice';
import { clearPeriods } from '../store/slices/periodsSlice';
import { useTheme } from '../theme/ThemeProvider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
// @ts-ignore - Fallback import
const DateTimePicker = DateTimePickerModal || require('react-native-modal-datetime-picker').default;
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as Application from 'expo-application';
import { 
  Bell, 
  Moon, 
  Sun,
  Smartphone,
  Lock, 
  Download, 
  Upload, 
  Info,
  Calendar,
  Clock,
  Globe,
  Shield,
} from 'phosphor-react-native';
import SettingRow from '../components/settings/SettingRow';
import LabeledSlider from '../components/settings/LabeledSlider';
import DangerZoneCard from '../components/settings/DangerZoneCard';
import NumericInputModal from '../components/settings/NumericInputModal';
import SegmentedControl from '../components/settings/SegmentedControl';
import PermissionBanner from '../components/settings/PermissionBanner';
import PINSetupModal from '../components/PINSetupModal';
import Toast from '../components/Toast';
import { hasPIN, savePIN, removePIN } from '../services/pinService';
import { 
  requestNotificationPermission, 
  scheduleNotifications, 
  cancelAllScheduledNotificationsAsync,
  checkNotificationPermission,
} from '../services/notificationService';
import { exportDataToFile, importDataFromFile, mergeImportedData } from '../services/backupService';
import * as Notifications from 'expo-notifications';

// DEBUG: Component import kontrolü
console.log('Component imports:', {
  SettingRow: typeof SettingRow,
  LabeledSlider: typeof LabeledSlider,
  DangerZoneCard: typeof DangerZoneCard,
  NumericInputModal: typeof NumericInputModal,
  SegmentedControl: typeof SegmentedControl,
  PermissionBanner: typeof PermissionBanner,
  PINSetupModal: typeof PINSetupModal,
  Toast: typeof Toast,
  DateTimePickerModal: typeof DateTimePickerModal,
});

export default function SettingsScreen() {
  const { colors, spacing, borderRadius, shadows, isDark, toggleTheme, setThemeMode } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const prefs = useSelector((state: RootState) => state.prefs);
  const notificationSettings = useSelector((state: RootState) => state.notification);
  const settings = useSelector((state: RootState) => state.settings);
  const logs = useSelector((state: RootState) => state.logs);
  const periods = useSelector((state: RootState) => state.periods);

  // Local states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [showPeriodInputModal, setShowPeriodInputModal] = useState(false);
  const [showCycleInputModal, setShowCycleInputModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'setup' | 'change' | 'remove'>('setup');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // İzin kontrolü, planlanan bildirim sayısı ve PIN durumu
  useEffect(() => {
    checkPermissionStatus();
    updateScheduledCount();
    checkPINStatus();
  }, [notificationSettings.enabled]);

  const checkPINStatus = async () => {
    const hasPinEnabled = await hasPIN();
    setPinEnabled(hasPinEnabled);
  };

  const checkPermissionStatus = async () => {
    if (notificationSettings.enabled) {
      const hasPermission = await checkNotificationPermission();
      setPermissionDenied(!hasPermission);
    } else {
      setPermissionDenied(false);
    }
  };

  const updateScheduledCount = async () => {
    if (notificationSettings.enabled) {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(scheduledNotifications.length);
    } else {
      setScheduledCount(0);
    }
  };

  // Handlers
  const handlePeriodLengthChange = useCallback((value: number) => {
    dispatch(setPrefs({ ...prefs, avgPeriodDays: value }));
  }, [dispatch, prefs]);

  const handleCycleLengthChange = useCallback((value: number) => {
    dispatch(setPrefs({ ...prefs, avgCycleDays: value }));
  }, [dispatch, prefs]);

  const handleLastPeriodDateChange = useCallback((date: Date) => {
    dispatch(setPrefs({ ...prefs, lastPeriodStart: date.toISOString() }));
    setShowDatePicker(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToast({ message: 'Son adet tarihi güncellendi', type: 'success' });
  }, [dispatch, prefs]);

  const handleNotificationToggle = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (granted) {
        const newSettings = { ...notificationSettings, enabled: true };
        dispatch(setNotificationSettings(newSettings));
        dispatch(setPermissionGranted(true));
        
        // Bildirimleri planla
        await scheduleNotifications(newSettings as any);
        await updateScheduledCount();
        
        setPermissionDenied(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToast({ message: 'Bildirimler açıldı', type: 'success' });
      } else {
        setPermissionDenied(true);
        dispatch(setNotificationSettings({ ...notificationSettings, enabled: false }));
        Alert.alert(
          'İzin Gerekli',
          'Bildirimleri açmak için uygulama ayarlarından izin vermelisiniz.',
          [{ text: 'Tamam' }]
        );
      }
    } else {
      dispatch(setNotificationSettings({ ...notificationSettings, enabled: false }));
      await cancelAllScheduledNotificationsAsync();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setToast({ message: 'Bildirimler kapatıldı', type: 'info' });
    }
  }, [dispatch, notificationSettings]);

  const handleReminderTimeChange = useCallback(async (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Yeni ayarı kaydet
    const newSettings = { 
      ...notificationSettings, 
      reminderTime: { hour: hours, minute: minutes } 
    };
    dispatch(setNotificationSettings(newSettings));
    
    // Önce eski planları iptal et, sonra yeni planları oluştur
    if (notificationSettings.enabled) {
      await cancelAllScheduledNotificationsAsync();
      await scheduleNotifications(newSettings as any);
      await updateScheduledCount();
    }
    
    setShowTimePicker(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToast({ 
      message: `Hatırlatma saati ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} olarak ayarlandı`, 
      type: 'success' 
    });
  }, [dispatch, notificationSettings]);

  const handleUpcomingPeriodDaysChange = useCallback(async (days: number) => {
    // Yeni ayarı kaydet
    const newSettings = { 
      ...notificationSettings, 
      upcomingPeriodDays: days as 0 | 1 | 2 | 3 | 5 | 7
    };
    dispatch(setNotificationSettings(newSettings));
    
    // Önce eski planları iptal et, sonra yeni planları oluştur
    if (notificationSettings.enabled && days > 0) {
      await cancelAllScheduledNotificationsAsync();
      await scheduleNotifications(newSettings as any);
      await updateScheduledCount();
    }
    
    setShowDaysPicker(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToast({ message: days === 0 ? 'Adet bildirimi kapatıldı' : `${days} gün önce bildirim gönderilecek`, type: 'success' });
  }, [dispatch, notificationSettings]);

  const handleThemeChange = useCallback((value: string) => {
    const themeMode = value as 'system' | 'light' | 'dark';
    dispatch(setSettings({ ...settings, theme: themeMode }));
    setThemeMode(themeMode);
    Haptics.selectionAsync();
    
    const themeNames = { system: 'Sistem', light: 'Açık', dark: 'Koyu' };
    setToast({ message: `Tema: ${themeNames[themeMode]}`, type: 'info' });
  }, [dispatch, settings, setThemeMode]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const handleExportData = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const entireState: RootState = {
                prefs,
        notification: notificationSettings,
        settings,
        logs,
                periods,
        app: { isOnboardingComplete: true },
      };
      const fileUri = await exportDataToFile(entireState);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'CycleMate Verileri Dışa Aktar',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToast({ message: 'Yedek oluşturuldu', type: 'success' });
      } else {
        setToast({ message: 'Paylaşım özelliği desteklenmiyor', type: 'error' });
      }
            } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToast({ message: 'Dışa aktarım başarısız', type: 'error' });
    }
  }, [prefs, notificationSettings, settings, logs, periods]);

  const handleImportData = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const importResult = await importDataFromFile(fileUri);
        
        if (importResult.success && importResult.data) {
          // Verileri birleştir
          const currentState: RootState = {
            prefs,
            notification: notificationSettings,
            settings,
            logs,
            periods,
            app: { isOnboardingComplete: true },
          };
          const mergedData = mergeImportedData(currentState, importResult.data);
          
          // Store'u güncelle
          if (mergedData.prefs) dispatch(setPrefs(mergedData.prefs as any));
          if (mergedData.settings) dispatch(setSettings(mergedData.settings as any));
          if (mergedData.notification) dispatch(setNotificationSettings(mergedData.notification as any));
          // Logs ve periods için özel action'lar gerekebilir
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setToast({ 
            message: `Veriler başarıyla yüklendi\n${importResult.stats?.journals || 0} günlük, ${importResult.stats?.cycles || 0} döngü`, 
            type: 'success' 
          });
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setToast({ message: importResult.error || 'İçe aktarım başarısız', type: 'error' });
        }
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToast({ message: error.message || 'İçe aktarım başarısız', type: 'error' });
    }
  }, [prefs, notificationSettings, settings, logs, periods, dispatch]);

  const handleDeleteAllData = useCallback(() => {
    setShowDeleteConfirm(true);
    setDeleteConfirmText('');
  }, []);

  const confirmDeleteAllData = useCallback(async () => {
    if (deleteConfirmText === 'SİL') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      // Tüm bildirimleri iptal et
      await cancelAllScheduledNotificationsAsync();
      
      // Store'u temizle
      dispatch(clearLogs());
      dispatch(clearPeriods());
      dispatch(setPrefs({
        avgPeriodDays: 5,
        avgCycleDays: 28,
        lastPeriodStart: '',
      }));
      dispatch(setNotificationSettings({
        enabled: false,
        permissionGranted: false,
        reminderTime: { hour: 9, minute: 0 },
        upcomingPeriodDays: 2,
      }));
      
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToast({ message: 'Her şey temizlendi ✨', type: 'success' });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToast({ message: 'Onay metni hatalı', type: 'error' });
    }
  }, [deleteConfirmText, dispatch]);

  const formatReminderTime = () => {
    const { hour, minute } = notificationSettings.reminderTime || { hour: 9, minute: 0 };
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handlePINPress = () => {
    if (pinEnabled) {
      // PIN varsa değiştir veya kaldır seçenekleri
      Alert.alert(
        'PIN Kilidi',
        'Ne yapmak istersiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Değiştir', onPress: () => { setPinModalMode('change'); setShowPINModal(true); } },
          { text: 'Kaldır', style: 'destructive', onPress: () => { setPinModalMode('remove'); setShowPINModal(true); } },
        ]
      );
    } else {
      // PIN yoksa kur
      setPinModalMode('setup');
      setShowPINModal(true);
    }
  };

  const handlePINConfirm = async (pin: string) => {
    if (pinModalMode === 'setup' || pinModalMode === 'change') {
      const success = await savePIN(pin);
      if (success) {
        setPinEnabled(true);
        setShowPINModal(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToast({ message: pinModalMode === 'setup' ? 'PIN kuruldu' : 'PIN değiştirildi', type: 'success' });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setToast({ message: 'PIN kaydedilemedi', type: 'error' });
      }
    } else if (pinModalMode === 'remove') {
      const success = await removePIN();
      if (success) {
        setPinEnabled(false);
        setShowPINModal(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToast({ message: 'PIN kaldırıldı', type: 'success' });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setToast({ message: 'PIN kaldırılamadı', type: 'error' });
      }
    }
  };

  const getThemeIcon = () => {
    const theme = settings.theme || 'system';
    if (theme === 'light') return <Sun size={22} color="#E94FA1" weight="fill" />;
    if (theme === 'dark') return <Moon size={22} color="#E94FA1" weight="fill" />;
    return <Smartphone size={22} color="#E94FA1" />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9FB' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: tabBarHeight + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Başlık Kartı */}
        <LinearGradient
          colors={['#FFB6EC', '#D6A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF' }}>
            Ayarlar ⚙️
          </Text>
          <Text style={{ fontSize: 14, color: '#FFF', opacity: 0.9, marginTop: 8 }}>
            Döngü, bildirim ve görünüm tercihlerini yönet
          </Text>
        </LinearGradient>

        {/* DÖNGÜ TERCİHLERİ */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#6B7280',
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            DÖNGÜ TERCİHLERİ
          </Text>
        </View>

        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <LabeledSlider
            label="Ortalama Adet Süresi"
            description="Adet kanamalarının ortalama süresi"
            value={prefs.avgPeriodDays}
            min={3}
            max={10}
            step={1}
            unit="gün"
            onValueChange={handlePeriodLengthChange}
            onValuePress={() => setShowPeriodInputModal(true)}
            accessibilityLabel={`Ortalama Adet Süresi ${prefs.avgPeriodDays} gün`}
          />
          
          <View style={{ height: 16 }} />
          
          <LabeledSlider
            label="Ortalama Döngü Süresi"
            description="Döngünün ortalama uzunluğu"
            value={prefs.avgCycleDays}
            min={21}
            max={40}
            step={1}
            unit="gün"
            onValueChange={handleCycleLengthChange}
            onValuePress={() => setShowCycleInputModal(true)}
            accessibilityLabel={`Ortalama Döngü Süresi ${prefs.avgCycleDays} gün`}
          />
          
          <View style={{ height: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
          
          <SettingRow
            icon={<Calendar size={20} color="#E94FA1" />}
            title="Son Adet Başlangıcı"
            description="Tahmin doğruluğunu artırır"
            value={prefs.lastPeriodStart ? new Date(prefs.lastPeriodStart).toLocaleDateString('tr-TR') : 'Seçilmedi'}
            onPress={() => setShowDatePicker(true)}
            isLast
            accessibilityLabel="Son Adet Başlangıcı"
            accessibilityHint="Tarih seçici açmak için dokun"
          />
        </View>

        {/* BİLDİRİMLER */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#6B7280',
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            BİLDİRİMLER
          </Text>
        </View>

        {permissionDenied && (
          <PermissionBanner onOpenSettings={handleOpenSettings} />
        )}

        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <SettingRow
            icon={<Bell size={20} color="#E94FA1" />}
            title="Bildirimleri Aç"
            description={notificationSettings.enabled 
              ? `Açık${scheduledCount > 0 ? ` • ${scheduledCount} bildirim planlandı` : ''}` 
              : 'Kapalı'}
            switchValue={notificationSettings.enabled}
            onSwitchChange={handleNotificationToggle}
            accessibilityLabel="Bildirimleri Aç"
          />
          
          <SettingRow
            icon={<Clock size={20} color="#E94FA1" />}
            title="Hatırlatma Saati"
            description="Günlük hatırlatma saati"
            value={formatReminderTime()}
            onPress={() => setShowTimePicker(true)}
            disabled={!notificationSettings.enabled}
            disabledText={!notificationSettings.enabled ? 'Bildirimler kapalı' : undefined}
            accessibilityLabel="Hatırlatma Saati"
            accessibilityHint="Saat seçici açmak için dokun"
          />
          
          <SettingRow
            icon={<Info size={20} color="#E94FA1" />}
            title="Yaklaşan Adet Bildirimi"
            description={`Adet başlamadan ${notificationSettings.upcomingPeriodDays || 2} gün önce haber ver`}
            value={`${notificationSettings.upcomingPeriodDays || 2} gün`}
            onPress={() => setShowDaysPicker(true)}
            disabled={!notificationSettings.enabled}
            disabledText={!notificationSettings.enabled ? 'Bildirimler kapalı' : undefined}
            isLast
            accessibilityLabel="Yaklaşan Adet Bildirimi"
            accessibilityHint="Gün sayısı seçmek için dokun"
          />
        </View>

        {/* GÖRÜNÜM */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
              <Text style={{ 
            fontSize: 13,
                fontWeight: '600', 
            color: '#6B7280',
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            GÖRÜNÜM
          </Text>
        </View>

        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              {getThemeIcon()}
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#1F2937', marginLeft: 12 }}>
                Tema
              </Text>
            </View>
            <SegmentedControl
              options={[
                { value: 'system', label: 'Sistem' },
                { value: 'light', label: 'Açık' },
                { value: 'dark', label: 'Koyu' },
              ]}
              value={settings.theme || 'system'}
              onChange={handleThemeChange}
            />
          </View>
          
          <SettingRow
            icon={<Globe size={20} color="#E94FA1" />}
            title="Dil"
            description="Yakında daha fazla dil"
            value="Türkçe"
            disabled
            disabledText="Yakında"
            isLast
            accessibilityLabel="Dil"
          />
        </View>

        {/* GİZLİLİK & GÜVENLİK */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
            <Text style={{ 
            fontSize: 13,
              fontWeight: '600', 
            color: '#6B7280',
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            GİZLİLİK & GÜVENLİK
            </Text>
        </View>

        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <View style={{
            padding: 16,
            backgroundColor: '#F0FDF4',
            borderRadius: 12,
            borderLeftWidth: 3,
            borderLeftColor: '#10B981',
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Lock size={20} color="#10B981" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#047857', marginLeft: 8 }}>
                Veri Gizliliği
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: '#065F46', lineHeight: 18 }}>
              • Veriler cihazında tutulur{'\n'}
              • Buluta gönderilmez{'\n'}
              • Dışa aktarım senin kontrolünde
            </Text>
          </View>

          <SettingRow
            icon={<Shield size={20} color="#E94FA1" />}
            title="PIN Kilidi"
            description={pinEnabled ? 'Aktif • Uygulama açılışında PIN istenir' : 'Uygulama açılışında PIN iste'}
            value={pinEnabled ? 'Kur/Değiştir' : 'Kur'}
            onPress={handlePINPress}
            isLast
            accessibilityLabel="PIN Kilidi"
            accessibilityHint={pinEnabled ? 'PIN değiştir veya kaldır' : 'PIN kur'}
          />
        </View>

        {/* VERİ YÖNETİMİ */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#6B7280',
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            VERİ YÖNETİMİ
          </Text>
        </View>

        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <SettingRow
            icon={<Download size={20} color="#E94FA1" />}
            title="Verileri Dışa Aktar"
            description="JSON yedeği oluştur"
            onPress={handleExportData}
            accessibilityLabel="Verileri Dışa Aktar"
            accessibilityHint="Yedek dosyası oluşturmak için dokun"
          />
          
          <SettingRow
            icon={<Upload size={20} color="#E94FA1" />}
            title="Verileri İçe Aktar"
            description="JSON'dan yükle"
            onPress={handleImportData}
            isLast
            accessibilityLabel="Verileri İçe Aktar"
            accessibilityHint="Yedek dosyası yüklemek için dokun"
              />
            </View>

        {/* TEHLİKELİ BÖLGE */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#DC2626',
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            TEHLİKELİ BÖLGE
          </Text>
        </View>

        <DangerZoneCard
          title="Tüm Verileri Sil"
          description="Adet kayıtları, günlük girişleri ve tüm ayarlarınız silinecektir. Bu işlem geri alınamaz!"
          buttonText="Tüm Verileri Sil"
          onPress={handleDeleteAllData}
        />

        {/* HAKKINDA */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#6B7280',
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            HAKKINDA
          </Text>
        </View>

        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <SettingRow
            title="Uygulama Versiyonu"
            value={Application.nativeApplicationVersion || '1.0.0'}
            accessibilityLabel={`Uygulama Versiyonu ${Application.nativeApplicationVersion || '1.0.0'}`}
            isLast
          />
      </View>

        <View style={{
          padding: 16,
          backgroundColor: '#FFF7ED',
          borderRadius: 12,
          borderLeftWidth: 3,
          borderLeftColor: '#F59E0B',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#92400E', marginBottom: 4 }}>
            ⚕️ Tıbbi Uyarı
          </Text>
          <Text style={{ fontSize: 13, color: '#78350F', lineHeight: 18 }}>
            Bu uygulama tıbbi tavsiye yerine geçmez. Sağlık sorunlarınız için mutlaka bir doktora danışın.
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleLastPeriodDateChange}
        onCancel={() => setShowDatePicker(false)}
        date={prefs.lastPeriodStart ? new Date(prefs.lastPeriodStart) : new Date()}
        maximumDate={new Date()}
        locale="tr_TR"
      />

      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={handleReminderTimeChange}
        onCancel={() => setShowTimePicker(false)}
        date={new Date(0, 0, 0, notificationSettings.reminderTime?.hour || 9, notificationSettings.reminderTime?.minute || 0)}
        is24Hour={true}
        locale="tr_TR"
      />

      <NumericInputModal
        visible={showPeriodInputModal}
        title="Ortalama Adet Süresi"
        value={prefs.avgPeriodDays}
        min={3}
        max={10}
        unit="gün"
        onConfirm={(value) => {
          handlePeriodLengthChange(value);
          setShowPeriodInputModal(false);
        }}
        onCancel={() => setShowPeriodInputModal(false)}
      />

      <NumericInputModal
        visible={showCycleInputModal}
        title="Ortalama Döngü Süresi"
        value={prefs.avgCycleDays}
        min={21}
        max={40}
        unit="gün"
        onConfirm={(value) => {
          handleCycleLengthChange(value);
          setShowCycleInputModal(false);
        }}
        onCancel={() => setShowCycleInputModal(false)}
      />

      {/* Days Picker Modal */}
      {showDaysPicker && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 20,
            padding: 24,
            width: '80%',
            maxWidth: 300,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, textAlign: 'center' }}>
              Kaç gün önce bildirim?
            </Text>
            {[0, 1, 2, 3, 5, 7].map((days) => (
              <TouchableOpacity
                key={days}
                onPress={() => handleUpcomingPeriodDaysChange(days)}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  backgroundColor: (notificationSettings.upcomingPeriodDays || 2) === days ? '#FFE8F5' : '#F9FAFB',
                  marginBottom: 8,
                }}
              >
                <Text style={{
                  fontSize: 15,
                  fontWeight: (notificationSettings.upcomingPeriodDays || 2) === days ? '600' : '500',
                  color: (notificationSettings.upcomingPeriodDays || 2) === days ? '#E94FA1' : '#6B7280',
                  textAlign: 'center',
                }}>
                  {days === 0 ? 'Kapalı' : `${days} gün önce`}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowDaysPicker(false)}
              style={{
                paddingVertical: 12,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
                İptal
              </Text>
            </TouchableOpacity>
          </View>
              </View>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 20,
            padding: 24,
            width: '85%',
            maxWidth: 340,
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#DC2626', marginBottom: 12, textAlign: 'center' }}>
              ⚠️ Dikkat
            </Text>
            <Text style={{ fontSize: 15, color: '#1F2937', marginBottom: 20, textAlign: 'center', lineHeight: 22 }}>
              Tüm verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz!
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16, textAlign: 'center' }}>
              Onaylamak için <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>SİL</Text> yazın:
            </Text>
            
            <View style={{
              borderWidth: 2,
              borderColor: deleteConfirmText === 'SİL' ? '#10B981' : '#E5E7EB',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: deleteConfirmText === 'SİL' ? '#10B981' : '#1F2937',
                textAlign: 'center',
              }}>
                {deleteConfirmText || '...'}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#6B7280' }}>
                  İptal
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={confirmDeleteAllData}
                onLongPress={() => {
                  // Uzun basma alternatifi
                  if (deleteConfirmText !== 'SİL') {
                    setDeleteConfirmText('SİL');
                  }
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: deleteConfirmText === 'SİL' ? '#DC2626' : '#E5E7EB',
                  alignItems: 'center',
                }}
                disabled={deleteConfirmText !== 'SİL'}
              >
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: deleteConfirmText === 'SİL' ? '#FFF' : '#9CA3AF' 
                }}>
                  Sil
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setDeleteConfirmText(deleteConfirmText === 'SİL' ? '' : 'SİL')}
              style={{
                marginTop: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                Dokunarak "SİL" yazabilirsiniz
              </Text>
            </TouchableOpacity>
          </View>
      </View>
      )}

      {/* PIN Setup Modal */}
      <PINSetupModal
        visible={showPINModal}
        mode={pinModalMode}
        onConfirm={handlePINConfirm}
        onCancel={() => setShowPINModal(false)}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </SafeAreaView>
  );
}