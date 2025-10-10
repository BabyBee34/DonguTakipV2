import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
import { getTodayISO, daysBetween, addDays } from '../utils/date';
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
import { Symptom, CyclePhase, CyclePrefs, PeriodSpan } from '../types';
import { getSuggestions, TipSuggestion } from '../services/tipsService';
import { normalizeSymptomEntries, extractSymptomIds, NormalizedSymptom } from '../services/symptomUtils';
import { buildTipFeatures } from '../services/featureBuilder';

type SymptomSelection = NormalizedSymptom;

const areSymptomListsEqual = (a: SymptomSelection[], b: SymptomSelection[]) => {
  if (a.length !== b.length) return false;
  const sortById = (arr: SymptomSelection[]) =>
    [...arr].sort((x, y) => x.id.localeCompare(y.id));
  const sortedA = sortById(a);
  const sortedB = sortById(b);
  return sortedA.every(
    (item, idx) => item.id === sortedB[idx].id && item.severity === sortedB[idx].severity
  );
};

const areHabitListsEqual = (a: HabitKey[], b: HabitKey[]) => {
  if (a.length !== b.length) return false;
  const sort = (arr: HabitKey[]) => [...arr].sort();
  const sortedA = sort(a);
  const sortedB = sort(b);
  return sortedA.every((item, idx) => item === sortedB[idx]);
};

const inferPhaseForDate = (
  isoDate: string,
  prefs: CyclePrefs,
  periods: PeriodSpan[]
): CyclePhase | undefined => {
  const avgPeriodLength = Math.max(1, prefs?.avgPeriodDays ?? 5);

  const isWithinRecordedPeriod = periods.some((period) => {
    if (!period.start) return false;
    const end = period.end ?? addDays(period.start, avgPeriodLength - 1);
    return isoDate >= period.start && isoDate <= end;
  });

  if (isWithinRecordedPeriod) {
    return 'menstrual';
  }

  const cycleLength = prefs?.avgCycleDays ?? 0;
  if (!cycleLength) {
    return undefined;
  }

  let referenceStart = prefs?.lastPeriodStart;
  const historicalStarts = periods
    .map((period) => period.start)
    .filter((start): start is string => Boolean(start) && start <= isoDate)
    .sort((a, b) => (a > b ? -1 : 1));

  if (historicalStarts.length > 0) {
    referenceStart = historicalStarts[0];
  }

  if (!referenceStart) {
    return undefined;
  }

  const diff = daysBetween(referenceStart, isoDate);
  const normalizedDiff = ((diff % cycleLength) + cycleLength) % cycleLength;

  if (normalizedDiff < avgPeriodLength) return 'menstrual';
  if (normalizedDiff < 13) return 'follicular';
  if (normalizedDiff < 16) return 'ovulation';
  return 'luteal';
};

export default function DailyLogScreen({ route, navigation }: any) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const dispatch = useDispatch();
  const logs = useSelector((state: RootState) => state.logs);
  const prefs = useSelector((state: RootState) => state.prefs);
  const periods = useSelector((state: RootState) => state.periods);

  const selectedDate = route?.params?.date || getTodayISO();
  const existingLog = logs.find((l) => l.date === selectedDate);

  const initialMood = useMemo(() => existingLog?.mood as MoodKey | undefined, [existingLog]);
  const initialSymptoms = useMemo(
    () => normalizeSymptomEntries(existingLog?.symptoms),
    [existingLog]
  );
  const initialHabits = useMemo(
    () => (Array.isArray(existingLog?.habits) ? (existingLog?.habits as HabitKey[]) : []),
    [existingLog]
  );
  const initialNote = useMemo(() => (existingLog?.note || '').trim(), [existingLog]);

  const [mood, setMood] = useState<MoodKey | undefined>(initialMood);
  const [symptoms, setSymptoms] = useState<SymptomSelection[]>(initialSymptoms);
  const [habits, setHabits] = useState<HabitKey[]>(initialHabits);
  const [note, setNote] = useState(existingLog?.note || '');
  const [infoSheet, setInfoSheet] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TipSuggestion[]>([]);

  useEffect(() => {
    setMood(initialMood);
    setSymptoms(initialSymptoms);
    setHabits(initialHabits);
    setNote(existingLog?.note || '');
  }, [initialMood, initialSymptoms, initialHabits, existingLog?.id]);

  const symptomIdsForSuggestions = useMemo(
    () => extractSymptomIds(symptoms).map((id) => id as Symptom),
    [symptoms]
  );

  const previewLog = useMemo(
    () => ({
      id: existingLog?.id ?? 'preview',
      date: selectedDate,
      mood: mood ?? existingLog?.mood,
      symptoms: symptoms.map((item) => ({ id: item.id, severity: item.severity })),
      habits,
      note: note.trim(),
      createdAt: existingLog?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [existingLog?.id, existingLog?.mood, existingLog?.createdAt, selectedDate, mood, symptoms, habits, note]
  );

  const featureVector = useMemo(
    () =>
      buildTipFeatures({
        log: previewLog,
        prefs,
        periods,
        today: selectedDate,
      }),
    [previewLog, prefs, periods, selectedDate]
  );

  const phaseHint = useMemo(
    () => inferPhaseForDate(selectedDate, prefs, periods),
    [selectedDate, prefs, periods]
  );

  const hasChanges = useMemo(() => {
    const trimmedNote = note.trim();
    if (!existingLog) {
      return Boolean(mood || symptoms.length > 0 || habits.length > 0 || trimmedNote);
    }

    const moodChanged = (mood ?? undefined) !== (initialMood ?? undefined);
    const symptomsChanged = !areSymptomListsEqual(symptoms, initialSymptoms);
    const habitsChanged = !areHabitListsEqual(habits, initialHabits);
    const noteChanged = trimmedNote !== initialNote;

    return moodChanged || symptomsChanged || habitsChanged || noteChanged;
  }, [existingLog, mood, symptoms, habits, note, initialMood, initialSymptoms, initialHabits, initialNote]);

  useEffect(() => {
    let cancelled = false;

    if (symptomIdsForSuggestions.length === 0 && !mood) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoadingSuggestions(true);

    getSuggestions(symptomIdsForSuggestions, {
      mood: mood ?? null,
      phase: phaseHint,
      includeGeneralFallback: true,
      limit: 3,
      features: featureVector,
    })
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSuggestions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [symptomIdsForSuggestions, mood, phaseHint, featureVector]);

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

  // Footer CTA component
  const FooterCTA = () => (
    <View
      style={{
        marginTop: 16,
        marginBottom: tabBarHeight + insets.bottom + 12,
        paddingHorizontal: 0,
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
            height: 60,
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
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
              paddingBottom: 24,
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

          {/* Kisisel oneriler */}
          <SectionCard style={{ backgroundColor: '#FFF9E6', padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>
                Kisisel Oneriler
              </Text>
              {isLoadingSuggestions && (
                <Text style={{ fontSize: 11, color: c.textDim }}>Hazirlaniyor...</Text>
              )}
            </View>

            {suggestions.length === 0 && !isLoadingSuggestions ? (
              <Text style={{ fontSize: 13, color: c.text, lineHeight: 18 }}>
                Ruh halini veya semptomlarini ekledikce ozel oneriler burada gorunecek.
              </Text>
            ) : (
              suggestions.map((item, index) => (
                <View
                  key={`${item.title}-${index}`}
                  style={{
                    marginBottom: index === suggestions.length - 1 ? 0 : 12,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 6 }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 18 }}>
                    {item.content}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
                    Kaynak: {item.source}
                  </Text>
                </View>
              ))
            )}
          </SectionCard>

          {/* Footer CTA - Inline, sayfanın en sonunda */}
          <FooterCTA />
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

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
    </View>
  );
}

