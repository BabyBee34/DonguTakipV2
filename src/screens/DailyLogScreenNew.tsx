import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SectionList,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  const hasChanges = mood || symptoms.length > 0 || habits.length > 0 || note.trim();

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
  const handleSave = useCallback(() => {
    if (!hasChanges) {
      setToastMessage('Herhangi bir değişiklik yapmadın.');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const logData: any = {
      id: existingLog?.id || uuidv4(),
      date: selectedDate,
      mood,
      symptoms: symptoms.map((s) => s.id),
      note: note.trim(),
      createdAt: existingLog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingLog) {
      dispatch(updateLog(logData));
    } else {
      dispatch(addLog(logData));
    }

    const summary = `${symptoms.length} semptom${mood ? `, ruh hali: ${mood}` : ''} — kaydedildi.`;
    setToastMessage(`✨ Günlüğün kaydedildi! ${summary}`);
    setToastType('success');
    setShowToast(true);

    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  }, [hasChanges, mood, symptoms, note, existingLog, selectedDate, dispatch, navigation]);

  return (
    <>
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
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
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
          <SectionCard style={{ padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 }}>
              Semptomlarım
            </Text>

            {SYMPTOM_CATEGORIES.map((category, catIndex) => (
              <View key={catIndex} style={{ marginBottom: catIndex < SYMPTOM_CATEGORIES.length - 1 ? 16 : 0 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#3E3E41', marginBottom: 8 }}>
                  {category.title}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: 'rgba(0,0,0,0.06)',
              }}
            >
              <Text style={{ fontSize: 11, color: '#B4B4B8', lineHeight: 16 }}>
                💡 İpucu: Bir kez tıkla = seç. Tekrar tıkla = şiddet artır (1-3). Uzun bas = bilgi.
              </Text>
            </View>
          </SectionCard>

          {/* Hızlı Alışkanlıklar */}
          <SectionCard style={{ padding: 16, marginBottom: 16 }}>
            <QuickHabits selected={habits} onToggle={toggleHabit} />
          </SectionCard>

          {/* Notlarım */}
          <SectionCard style={{ padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 }}>
              Notlarım 📝
            </Text>
            <TextInput
              style={{
                minHeight: 120,
                borderWidth: 1,
                borderColor: '#FFB6D4',
                borderRadius: 14,
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

        {/* Sticky CTA */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Math.max(12, insets.bottom + 12),
              backgroundColor: c.bg,
              borderTopWidth: 1,
              borderTopColor: c.hair,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: -4 },
              elevation: 12,
            }}
          >
            <Pressable
              onPress={handleSave}
              disabled={!hasChanges}
              accessibilityRole="button"
              accessibilityLabel="Günlüğünü Kaydet"
              style={{ opacity: hasChanges ? 1 : 0.6 }}
            >
              <LinearGradient
                colors={['#FF8BC2', '#FF5BA6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 52,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                  ✨ Günlüğünü Kaydet ✨
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>

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
    </>
  );
}
