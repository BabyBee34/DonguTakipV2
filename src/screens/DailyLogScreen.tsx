import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Keyboard,
  KeyboardEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addLog, updateLog } from '../store/slices/logsSlice';
import { getTodayISO } from '../utils/date';
import { useThemeColors } from '../theme';
import SectionCard from '../components/SectionCard';
import SegmentedMoodControl, { type MoodKey } from '../components/SegmentedMoodControl';
import SymptomChip from '../components/SymptomChip';
import SymptomInfoSheet from '../components/SymptomInfoSheet';
import QuickHabits, { type HabitKey } from '../components/QuickHabits';
import Toast from '../components/Toast';
import { SYMPTOM_CATEGORIES, getSymptomInfo } from '../data/symptomData';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

interface SymptomSelection {
  id: string;
  severity: number; // 0, 1, 2, 3
}

export default function DailyLogScreen({ route, navigation }: any) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const dispatch = useDispatch();
  const logs = useSelector((state: RootState) => state.logs);

  const selectedDate = route?.params?.date || getTodayISO();
  const existingLog = logs.find((l) => l.date === selectedDate);

  // State
  const [mood, setMood] = useState<MoodKey | undefined>(existingLog?.mood as MoodKey);
  const [symptoms, setSymptoms] = useState<SymptomSelection[]>([]);
  const [habits, setHabits] = useState<HabitKey[]>([]);
  const [note, setNote] = useState(existingLog?.note || '');
  const [infoSheet, setInfoSheet] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = mood || symptoms.length > 0 || habits.length > 0 || note.trim();
  
  // CTA dinamik bottom pozisyonu
  const CTA_HEIGHT = 60;
  const ctaBottom = insets.bottom + tabBarHeight + 12;
  
  // Klavye animasyonu için translateY
  const ctaTranslateY = useRef(new Animated.Value(0)).current;

  // Klavye listener'ları
  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        const keyboardHeight = e.endCoordinates.height;
        const targetBottom = insets.bottom + tabBarHeight + 12;
        const overlap = keyboardHeight - targetBottom;
        const translateValue = overlap > 0 ? -overlap : 0;

        Animated.timing(ctaTranslateY, {
          toValue: translateValue,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: true,
        }).start();
      }
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(ctaTranslateY, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [insets.bottom, tabBarHeight]);

  // Semptom toggle (şiddet döngüsü: 0 → 1 → 2 → 3 → 0)
  const toggleSymptom = useCallback((id: string) => {
    setSymptoms((prev) => {
      const existing = prev.find((s) => s.id === id);
      if (!existing) {
        return [...prev, { id, severity: 1 }];
      }
      const newSeverity = existing.severity >= 3 ? 0 : existing.severity + 1;
      if (newSeverity === 0) {
        return prev.filter((s) => s.id !== id);
      }
      return prev.map((s) => (s.id === id ? { ...s, severity: newSeverity } : s));
    });
  }, []);

  // Semptom uzun bas - bilgi göster
  const handleSymptomLongPress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const info = getSymptomInfo(id);
    if (info) {
      setInfoSheet(info);
    }
  }, []);

  // Alışkanlık toggle
  const toggleHabit = useCallback((habit: HabitKey) => {
    setHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  }, []);

  // Kaydet
  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      setToastMessage('Herhangi bir değişiklik yapmadın.');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    setIsSaving(true);
    Keyboard.dismiss();

    // Kısa loading animasyonu
    await new Promise((resolve) => setTimeout(resolve, 400));

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const logData: any = {
      id: existingLog?.id || uuidv4(),
      date: selectedDate,
      mood,
      symptoms: symptoms.map((s) => ({ id: s.id, severity: s.severity })),
      habits,
      note: note.trim(),
      createdAt: existingLog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingLog) {
      dispatch(updateLog(logData));
    } else {
      dispatch(addLog(logData));
    }

    setIsSaving(false);

    const moodText = mood ? MOODS.find(m => m.key === mood)?.label : null;
    const summary = `${moodText ? `Ruh hali: ${moodText}` : ''}${symptoms.length > 0 ? `${moodText ? ', ' : ''}${symptoms.length} semptom` : ''}`;
    setToastMessage(`✨ Kaydedildi! ${summary}`);
    setToastType('success');
    setShowToast(true);

    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  }, [hasChanges, mood, symptoms, habits, note, existingLog, selectedDate, dispatch, navigation]);

  // Mood tanımları (toast için)
  const MOODS = [
    { key: 'harika', label: 'Harika' },
    { key: 'iyi', label: 'İyi' },
    { key: 'sakin', label: 'Sakin' },
    { key: 'normal', label: 'Normal' },
    { key: 'yorgun', label: 'Yorgun' },
    { key: 'agrili', label: 'Ağrılı' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'height' : undefined}
        enabled={Platform.OS === 'ios'}
      >
        <LinearGradient
          colors={['#FFF6FB', '#FFE6F5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: insets.top + 10,
              paddingHorizontal: 16,
              paddingBottom: CTA_HEIGHT + ctaBottom + 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Üst hoşgeldin kartı */}
          <SectionCard style={{ padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>
                  Bugünkü Günlüğün 💕
                </Text>
                <Text style={{ fontSize: 14, color: c.textDim, marginTop: 4 }}>
                  Kendini nasıl hissediyorsun?
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#FFE1EE',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>💕</Text>
              </View>
            </View>
          </SectionCard>

          {/* Ruh Halim */}
          <SectionCard style={{ padding: 16, marginBottom: 16 }}>
            <SegmentedMoodControl selected={mood} onSelect={setMood} />
          </SectionCard>

          {/* Semptomlarım */}
          <SectionCard style={{ padding: 18, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 4 }}>
              Semptomlarım
            </Text>
            {symptoms.length === 0 && !mood && !note && (
              <Text style={{ fontSize: 13, color: '#B4B4B8', marginBottom: 12, fontStyle: 'italic' }}>
                Bugün nasıldı? Küçük bir notla başlayabilirsin 💫
              </Text>
            )}

            {SYMPTOM_CATEGORIES.map((category, catIndex) => (
              <View key={catIndex} style={{ marginBottom: catIndex < SYMPTOM_CATEGORIES.length - 1 ? 14 : 0, marginTop: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#3E3E41', marginBottom: 8 }}>
                  {category.title}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {category.data.map((symptom) => {
                    const selection = symptoms.find((s) => s.id === symptom.id);
                    return (
                      <SymptomChip
                        key={symptom.id}
                        label={symptom.name}
                        selected={!!selection}
                        severity={selection?.severity || 0}
                        onPress={() => toggleSymptom(symptom.id)}
                        onLongPress={() => handleSymptomLongPress(symptom.id)}
                      />
                    );
                  })}
                </View>
              </View>
            ))}

            <View
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: 'rgba(0,0,0,0.06)',
              }}
            >
              <Text style={{ fontSize: 12.5, color: '#6C6C6C', lineHeight: 18 }}>
                💡 İpucu: Bir kez tıkla = seç. Tekrar tıkla = şiddet artır (1-3). Uzun bas = bilgi.
              </Text>
            </View>
          </SectionCard>

          {/* Hızlı Alışkanlıklar */}
          <SectionCard style={{ padding: 16, marginBottom: 16 }}>
            <QuickHabits selected={habits} onToggle={toggleHabit} />
          </SectionCard>

          {/* Notlarım */}
          <SectionCard style={{ padding: 18, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 }}>
              Notlarım 📝
            </Text>
            <TextInput
              style={{
                minHeight: 120,
                borderWidth: 1,
                borderColor: '#FFB6D4',
                borderRadius: 16,
                padding: 14,
                fontSize: 14,
                color: c.text,
                backgroundColor: '#FAFAFA',
                textAlignVertical: 'top',
              }}
              placeholder="Bugün nasıldı? Kendine not bırak 💕"
              placeholderTextColor={c.textDim}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
            />
            <Text style={{ textAlign: 'right', fontSize: 11, color: c.textDim, marginTop: 6 }}>
              {note.length}/500
            </Text>
          </SectionCard>

          {/* AI Placeholder (Yakında) */}
          <SectionCard style={{ backgroundColor: '#FFF9E6', padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>
                Kişisel Öneriler
              </Text>
              <View
                style={{
                  backgroundColor: '#FFA726',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFF' }}>YAKINDA</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: c.text, lineHeight: 18 }}>
              Ruh halin ve semptomlarına göre kişisel öneriler burada görünecek. AI henüz bağlı değil.
            </Text>
          </SectionCard>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Sticky CTA - Alt barın üstünde, klavye ile animasyonlu */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: ctaBottom,
          zIndex: 100,
          transform: [{ translateY: ctaTranslateY }],
        }}
      >
        <Pressable
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
          accessibilityRole="button"
          accessibilityLabel={isSaving ? 'Kaydediliyor' : 'Günlüğünü Kaydet'}
          style={{
            opacity: hasChanges && !isSaving ? 1 : 0.6,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 16,
          }}
        >
          <LinearGradient
            colors={['#FF8BC2', '#FF5BA6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: CTA_HEIGHT,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '700' }}>
              {isSaving ? '⏳ Kaydediliyor...' : '✨ Günlüğünü Kaydet ✨'}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>

      {/* Semptom Bilgi Sheet */}
      {infoSheet && (
        <SymptomInfoSheet
          visible={!!infoSheet}
          onClose={() => setInfoSheet(null)}
          symptom={infoSheet}
        />
      )}

      {/* Toast */}
      {showToast && <Toast message={toastMessage} type={toastType} onHide={() => setShowToast(false)} />}
  );
}
