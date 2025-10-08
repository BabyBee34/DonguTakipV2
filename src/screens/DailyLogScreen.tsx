import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { RootState } from '../store';
import { addLog, updateLog } from '../store/slices/logsSlice';
import { getSuggestions } from '../services/tipsService';
import { toISO, getTodayISO } from '../utils/date';
import { useTheme } from '../theme/ThemeProvider';
import { Mood, Symptom, DailyLog } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../components/Toast';
import MoodSelector from '../components/MoodSelector';
import SymptomGrid from '../components/SymptomGrid';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

export default function DailyLogScreen({ route, navigation }: any) {
  const { width } = useWindowDimensions();
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const dispatch = useDispatch();
  const logs = useSelector((state: RootState) => state.logs);
  const confettiRef = useRef<any>(null);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const selectedDate = route?.params?.date || getTodayISO();
  const existingLog = logs.find(l => l.date === selectedDate);
  
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(existingLog?.mood);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>(existingLog?.symptoms || []);
  const [note, setNote] = useState(existingLog?.note || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (selectedSymptoms.length > 0) {
      getSuggestions(selectedSymptoms).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [selectedSymptoms]);

  const toggleSymptom = useCallback((symptom: Symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedMood && selectedSymptoms.length === 0 && !note.trim()) {
      setToastMessage(t('dailyLog.saveError'));
      setToastType('warning');
      setShowToast(true);
      return;
    }

    const logData: DailyLog = {
      id: existingLog?.id || uuidv4(),
      date: selectedDate,
      mood: selectedMood,
      symptoms: selectedSymptoms,
      note: note.trim(),
      createdAt: existingLog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingLog) {
      dispatch(updateLog(logData));
    } else {
      dispatch(addLog(logData));
    }

    // Trigger confetti animation
    setShowConfetti(true);
    if (confettiRef.current) {
      confettiRef.current.start();
    }

    // Hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    setToastMessage(t('dailyLog.saveSuccess'));
    setToastType('success');
    setShowToast(true);
  }, [existingLog, selectedDate, selectedMood, selectedSymptoms, note, dispatch]);

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xl }}>
          <LinearGradient colors={[colors.bgSoft, colors.bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: borderRadius.card, padding: spacing.lg, ...shadows.card }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.ink }}>
              {selectedDate === getTodayISO() ? t('dailyLog.todayTitle') : t('dailyLog.title', { date: selectedDate })}
            </Text>
            <Text style={{ color: colors.inkSoft, marginTop: spacing.xs }}>
              {t('dailyLog.subtitle')}
            </Text>
          </LinearGradient>
        </View>

      {/* Mood Seçimi */}
      <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>
        <MoodSelector
          selectedMood={selectedMood}
          onSelect={setSelectedMood}
        />
      </View>

      {/* Semptom Seçimi */}
      <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>
        <SymptomGrid
          selectedSymptoms={selectedSymptoms}
          onToggle={toggleSymptom}
        />
      </View>

      {/* Not Alanı */}
      <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: spacing.md, color: colors.ink }}>{t('dailyLog.notes.title')}</Text>
        <TextInput
          style={{
            borderWidth: 2,
            borderColor: colors.primary200,
            borderRadius: borderRadius.card,
            padding: spacing.lg,
            minHeight: 120,
            fontSize: 16,
            color: colors.ink,
            backgroundColor: colors.bg,
          }}
          placeholder={t('dailyLog.notes.placeholder')}
          placeholderTextColor={colors.inkLight}
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={{ textAlign: 'right', color: colors.inkLight, fontSize: 12, marginTop: spacing.xs }}>{t('dailyLog.notes.charCount', { count: note.length })}</Text>
      </View>

          {/* Öneriler */}
          {suggestions.length > 0 && (
            <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: spacing.md, color: colors.ink }}>{t('dailyLog.suggestions.title')}</Text>
              {suggestions.map((tip, idx) => (
                <Card key={idx} backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.md }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>{tip.title}</Text>
                  <Text style={{ fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: spacing.sm }}>{tip.content}</Text>
                  <Text style={{ fontSize: 12, color: colors.inkLight, fontStyle: 'italic' }}>Kaynak: {tip.source}</Text>
                </Card>
              ))}
            </View>
          )}
      </ScrollView>
      
      {/* Sticky Kaydet Butonu */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ 
          paddingHorizontal: spacing.xl, 
          paddingTop: spacing.md,
          paddingBottom: Math.max(80, insets.bottom + 80),
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.bgGray,
          ...shadows.card,
        }}>
          <Button
            title={t('dailyLog.saveButton')}
            onPress={handleSave}
            variant="primary"
            size="large"
            accessibilityLabel={t('dailyLog.saveButton')}
            accessibilityHint={t('dailyLog.subtitle')}
          />
        </View>
      </KeyboardAvoidingView>
      
      {/* Confetti Animation */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: width / 2, y: 0 }}
          fadeOut
          autoStart={false}
          colors={[colors.primary, colors.lilac, colors.mint, colors.confetti1, colors.confetti2]}
        />
      )}
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onHide={() => setShowToast(false)}
        />
      )}
    </>
  );
}

