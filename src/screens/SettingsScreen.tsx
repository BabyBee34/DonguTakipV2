import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { setPrefs } from '../store/slices/prefsSlice';
import { setNotificationSettings, setPermissionGranted } from '../store/slices/notificationSlice';
import { setSettings } from '../store/slices/settingsSlice';
import { useTheme } from '../theme/ThemeProvider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { 
  Gear, 
  Bell, 
  Moon, 
  Lock, 
  Download, 
  Upload, 
  Trash, 
  Info,
  Calendar,
  Clock,
  Palette,
  Globe,
  Shield,
} from 'phosphor-react-native';
import SettingSection from '../components/settings/SettingSection';
import SettingRow from '../components/settings/SettingRow';
import LabeledSlider from '../components/settings/LabeledSlider';
import DangerZoneCard from '../components/settings/DangerZoneCard';
import Toast from '../components/Toast';
import { 
  requestNotificationPermission, 
  scheduleNotifications, 
  cancelAllScheduledNotificationsAsync,
} from '../services/notificationService';
import { exportDataToJSON, importDataFromJSON, deleteAllData } from '../services/storage';

export default function SettingsScreen() {
  const { colors, spacing, borderRadius, shadows, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const prefs = useSelector((state: RootState) => state.prefs);
  const notificationSettings = useSelector((state: RootState) => state.notification);
  const settings = useSelector((state: RootState) => state.settings);
  
  // Local states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [showFrequencySheet, setShowFrequencySheet] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Handlers
  const handlePeriodLengthChange = useCallback((value: number) => {
    dispatch(setPrefs({ ...prefs, avgPeriodLengthDays: value }));
  }, [dispatch, prefs]);

  const handleCycleLengthChange = useCallback((value: number) => {
    dispatch(setPrefs({ ...prefs, avgCycleLengthDays: value }));
  }, [dispatch, prefs]);

  const handleLastPeriodDateChange = useCallback((date: Date) => {
    dispatch(setPrefs({ ...prefs, lastPeriodStartDate: date.toISOString() }));
    setShowDatePicker(false);
    setToast({ message: 'Son adet tarihi güncellendi', type: 'success' });
  }, [dispatch, prefs]);

  const handleNotificationToggle = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (granted) {
        dispatch(setNotificationSettings({ ...notificationSettings, enabled: true }));
        dispatch(setPermissionGranted(true));
        await scheduleNotifications();
        setToast({ message: 'Bildirimler açıldı', type: 'success' });
      } else {
        Alert.alert(
          'İzin Gerekli',
          'Bildirimleri açmak için uygulama ayarlarından izin vermelisiniz.',
          [{ text: 'Tamam' }]
        );
      }
          } else {
      dispatch(setNotificationSettings({ ...notificationSettings, enabled: false }));
      await cancelAllScheduledNotificationsAsync();
      setToast({ message: 'Bildirimler kapatıldı', type: 'info' });
    }
  }, [dispatch, notificationSettings]);

  const handleReminderTimeChange = useCallback((date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    dispatch(setNotificationSettings({ 
      ...notificationSettings, 
      reminderTime: { hour: hours, minute: minutes } 
    }));
    setShowTimePicker(false);
    setToast({ message: `Hatırlatma saati ${hours}:${minutes.toString().padStart(2, '0')} olarak ayarlandı`, type: 'success' });
  }, [dispatch, notificationSettings]);

  const handleUpcomingPeriodDaysChange = useCallback((days: number) => {
    dispatch(setNotificationSettings({ 
      ...notificationSettings, 
      upcomingPeriodDays: days 
    }));
    setShowDaysPicker(false);
    setToast({ message: `${days} gün önce bildirim gönderilecek`, type: 'success' });
  }, [dispatch, notificationSettings]);

  const handleThemeChange = useCallback(() => {
    toggleTheme();
    Haptics.selectionAsync();
    setToast({ message: `Tema: ${isDark ? 'Açık' : 'Koyu'}`, type: 'info' });
  }, [toggleTheme, isDark]);

  const handleExportData = useCallback(async () => {
    try {
      const fileUri = await exportDataToJSON();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        setToast({ message: 'Yedek kaydedildi', type: 'success' });
      } else {
        setToast({ message: 'Paylaşım özelliği desteklenmiyor', type: 'error' });
      }
            } catch (error) {
      setToast({ message: 'Dışa aktarım başarısız', type: 'error' });
    }
  }, []);

  const handleImportData = useCallback(async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });

      if (!result.canceled && result.assets && result.assets.length > 0) {
              const fileUri = result.assets[0].uri;
        const success = await importDataFromJSON(fileUri);
        if (success) {
          setToast({ message: 'Veriler başarıyla yüklendi', type: 'success' });
        } else {
          setToast({ message: 'Dosya formatı desteklenmiyor', type: 'error' });
        }
      }
            } catch (error) {
      setToast({ message: 'İçe aktarım başarısız', type: 'error' });
    }
  }, []);

  const handleDeleteAllData = useCallback(() => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Devam',
          style: 'destructive', 
          onPress: () => {
            Alert.prompt(
              'Onay',
              'Lütfen "SİL" yazarak onaylayın',
              [
                { text: 'İptal', style: 'cancel' },
                {
                  text: 'Sil',
                  style: 'destructive',
                  onPress: async (text) => {
                    if (text === 'SİL') {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      await deleteAllData();
                      setToast({ message: 'Tüm veriler silindi', type: 'success' });
                    } else {
                      setToast({ message: 'Onay metni hatalı', type: 'error' });
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  }, []);

  const formatReminderTime = () => {
    const { hour, minute } = notificationSettings.reminderTime || { hour: 9, minute: 0 };
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9FB' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
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
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF' }}>
            Ayarlar ⚙️
          </Text>
          <Text style={{ fontSize: 14, color: '#FFF', opacity: 0.9, marginTop: 8 }}>
            Döngü, bildirim ve görünüm tercihlerini yönet.
          </Text>
        </LinearGradient>

        {/* A) Döngü Tercihleri */}
        <SettingSection title="DÖNGÜ TERCİHLERİ">
          <LabeledSlider
            label="Ortalama Adet Süresi"
            description="Adet kanamalarının ortalama süresi"
            value={prefs.avgPeriodLengthDays}
            min={3}
            max={10}
            step={1}
            unit="gün"
            onValueChange={handlePeriodLengthChange}
            accessibilityLabel={`Ortalama Adet Süresi ${prefs.avgPeriodLengthDays} gün`}
          />
          
          <View style={{ height: 16 }} />
          
          <LabeledSlider
            label="Ortalama Döngü Süresi"
            description="Döngünün ortalama uzunluğu (adet başlangıcından sonrakine)"
            value={prefs.avgCycleLengthDays}
            min={21}
            max={40}
            step={1}
            unit="gün"
            onValueChange={handleCycleLengthChange}
            accessibilityLabel={`Ortalama Döngü Süresi ${prefs.avgCycleLengthDays} gün`}
          />
          
          <View style={{ height: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
          
          <SettingRow
            icon={<Calendar size={22} color="#E94FA1" />}
            title="Son Adet Başlangıcı"
            description="Tahmin doğruluğunu artırır."
            value={prefs.lastPeriodStartDate ? new Date(prefs.lastPeriodStartDate).toLocaleDateString('tr-TR') : 'Seçilmedi'}
            onPress={() => setShowDatePicker(true)}
            isLast
            accessibilityLabel="Son Adet Başlangıcı"
            accessibilityHint="Tarih seçici açmak için dokun"
          />
        </SettingSection>

        {/* B) Bildirimler */}
        <SettingSection title="BİLDİRİMLER">
          <SettingRow
            icon={<Bell size={22} color="#E94FA1" />}
            title="Bildirimleri Aç"
            description={notificationSettings.enabled ? 'Açık' : 'Kapalı'}
            switchValue={notificationSettings.enabled}
            onSwitchChange={handleNotificationToggle}
            accessibilityLabel="Bildirimleri Aç"
          />
          
          <SettingRow
            icon={<Clock size={22} color="#E94FA1" />}
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
            icon={<Info size={22} color="#E94FA1" />}
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
        </SettingSection>

        {/* C) Görünüm */}
        <SettingSection title="GÖRÜNÜM">
          <SettingRow
            icon={<Moon size={22} color="#E94FA1" />}
            title="Tema"
            description={isDark ? 'Koyu tema aktif' : 'Açık tema aktif'}
            value={isDark ? 'Koyu' : 'Açık'}
            onPress={handleThemeChange}
            accessibilityLabel="Tema"
            accessibilityHint="Tema değiştirmek için dokun"
          />
          
          <SettingRow
            icon={<Globe size={22} color="#E94FA1" />}
            title="Dil"
            description="Uygulama dili"
            value="Türkçe"
            disabled
            disabledText="Yakında eklenecek"
            isLast
            accessibilityLabel="Dil"
          />
        </SettingSection>

        {/* D) Gizlilik & Güvenlik */}
        <SettingSection title="GİZLİLİK & GÜVENLİK">
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
              Veriler cihazında, buluta gönderilmez. Tüm bilgileriniz yerel depolamada güvende.
            </Text>
          </View>
          
          <SettingRow
            icon={<Shield size={22} color="#E94FA1" />}
            title="PIN Kilidi"
            description="Uygulama açılışında PIN iste"
            disabled
            disabledText="Yakında eklenecek"
            isLast
            accessibilityLabel="PIN Kilidi"
          />
        </SettingSection>

        {/* E) Veri Yönetimi */}
        <SettingSection title="VERİ YÖNETİMİ">
          <SettingRow
            icon={<Download size={22} color="#E94FA1" />}
            title="Verileri Dışa Aktar"
            description="JSON yedeği oluştur"
            onPress={handleExportData}
            accessibilityLabel="Verileri Dışa Aktar"
            accessibilityHint="Yedek dosyası oluşturmak için dokun"
          />
          
          <SettingRow
            icon={<Upload size={22} color="#E94FA1" />}
            title="Verileri İçe Aktar"
            description="JSON'dan yükle"
            onPress={handleImportData}
            isLast
            accessibilityLabel="Verileri İçe Aktar"
            accessibilityHint="Yedek dosyası yüklemek için dokun"
          />
        </SettingSection>

        {/* Tehlikeli Bölge */}
        <View style={{ marginBottom: 12 }}>
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
          <DangerZoneCard
            title="Tüm Verileri Sil"
            description="Adet kayıtları, günlük girişleri ve tüm ayarlarınız silinecektir. Bu işlem geri alınamaz!"
            buttonText="Tüm Verileri Sil"
            onPress={handleDeleteAllData}
          />
        </View>

        {/* F) Hakkında */}
        <SettingSection title="HAKKINDA">
          <SettingRow
            title="Uygulama Versiyonu"
            value="1.0.0"
            accessibilityLabel="Uygulama Versiyonu 1.0.0"
          />
          
          <View style={{
            padding: 16,
            backgroundColor: '#FFF7ED',
            borderRadius: 12,
            borderLeftWidth: 3,
            borderLeftColor: '#F59E0B',
            marginTop: 16,
          }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#92400E', marginBottom: 4 }}>
              ⚕️ Tıbbi Uyarı
            </Text>
            <Text style={{ fontSize: 13, color: '#78350F', lineHeight: 18 }}>
              Bu uygulama tıbbi tavsiye yerine geçmez. Sağlık sorunlarınız için mutlaka bir doktora danışın.
              </Text>
          </View>
        </SettingSection>
      </ScrollView>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleLastPeriodDateChange}
        onCancel={() => setShowDatePicker(false)}
        date={prefs.lastPeriodStartDate ? new Date(prefs.lastPeriodStartDate) : new Date()}
        maximumDate={new Date()}
        locale="tr_TR"
      />

      {/* Time Picker */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={handleReminderTimeChange}
        onCancel={() => setShowTimePicker(false)}
        date={new Date(0, 0, 0, notificationSettings.reminderTime?.hour || 9, notificationSettings.reminderTime?.minute || 0)}
        is24Hour={true}
        locale="tr_TR"
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
            {[1, 2, 3, 4, 5].map((days) => (
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
                  {days} gün önce
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