import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { CyclePhase, CyclePrefs, PeriodSpan, Symptom } from '../types';
import { addPeriod, updatePeriod } from '../store/slices/periodsSlice';
import { predictCycle } from '../services/prediction';
import { getPhaseMotivation, getPhaseInfo, getSuggestions, TipSuggestion } from '../services/tipsService';
import { toISO, getTodayISO, addDays, daysBetween } from '../utils/date';
import { useTheme } from '../theme/ThemeProvider';
import Modal from '../components/Modal';
import SectionCard from '../components/SectionCard';
import GradientButton from '../components/GradientButton';
import CalendarGrid from '../components/CalendarGrid';
import CycleLegendCard from '../components/CycleLegendCard';
import MoodPicker, { moodLine, type Mood } from '../components/MoodPicker';
import { getDailySmartTipPlaceholder, getInsightsPlaceholder, getMotivationPlaceholder } from '../services/aiPlaceholders';
import { trackMoodForAI } from '../services/aiHooks';
import { useConfirm } from '../utils/confirm';
import { themeColors, spacing as themeSpacing, brand } from '../theme';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { normalizeSymptomEntries } from '../services/symptomUtils';
import { buildTipFeatures } from '../services/featureBuilder';
import { getAIInsights, AIOutput } from '../services/aiModel';

const WEEKDAYS = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

const inferPhaseForDate = (
  isoDate: string,
  prefs: CyclePrefs,
  periods: PeriodSpan[]
): CyclePhase | undefined => {
  const avgPeriodLength = Math.max(1, prefs?.avgPeriodDays ?? 5);

  const withinRecordedPeriod = periods.some((period) => {
    if (!period.start) return false;
    const end = period.end ?? addDays(period.start, avgPeriodLength - 1);
    return isoDate >= period.start && isoDate <= end;
  });

  if (withinRecordedPeriod) {
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
export default function CalendarScreen({ navigation }: any) {
  const { colors, spacing, borderRadius, shadows, gradients } = useTheme();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const prefs = useSelector((state: RootState) => state.prefs);
  const periods = useSelector((state: RootState) => state.periods);
  const logs = useSelector((state: RootState) => state.logs);
  const insets = useSafeAreaInsets();
  const { confirm, ConfirmPortal } = useConfirm();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [phaseModalVisible, setPhaseModalVisible] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [mood, setMood] = useState<Mood | null>(null);
  const [calendarSuggestions, setCalendarSuggestions] = useState<TipSuggestion[]>([]);
  const [isLoadingCalendarSuggestions, setIsLoadingCalendarSuggestions] = useState(false);
  
  // AI Insights state
  const [aiInsights, setAIInsights] = useState<AIOutput | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { width } = useWindowDimensions();
  const compact = width < 370; // Küçük ekranlar için kompakt mod
  
  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Ekran yüklenirken fade-in + slide-up animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Aktif adet kontrolü
  const activePeriod = periods.find(p => !p.end);

  // Takvim günlerini hesapla
  const { monthStart, monthEnd, calendarDays, predictions, cellSize } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    // Takvim başlangıcı (ayın ilk gününün haftanın hangi günü olduğuna göre)
    const startDay = monthStart.getDay();
    const daysFromPrevMonth = startDay === 0 ? 6 : startDay - 1;
    
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(calendarStart.getDate() - daysFromPrevMonth);
    
    // 42 günlük takvim (6 hafta) - son günlerin görünmesi için
    const calendarDays: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(calendarStart);
      day.setDate(day.getDate() + i);
      calendarDays.push(day);
    }
    
    // Dinamik hücre boyutu hesaplama
    const containerWidth = width - 32; // padding
    const gapTotal = 6 * 4; // 6 gap @ 4px each
    const cellSize = Math.floor((containerWidth - gapTotal) / 7);
    cellSize; // Minimum 40, maksimum 56
    const finalCellSize = Math.max(40, Math.min(56, cellSize));
    
    // Tahminleri hesapla
    const predictions = prefs.lastPeriodStart ? predictCycle(
      {
        lastPeriodStart: prefs.lastPeriodStart,
        avgCycleDays: prefs.avgCycleDays,
        avgPeriodDays: prefs.avgPeriodDays,
        periods,
        logsDates: logs.map(l => l.date),
      },
      toISO(calendarStart),
      toISO(calendarDays[calendarDays.length - 1])
    ) : [];
    
    return { monthStart, monthEnd, calendarDays, predictions, cellSize: finalCellSize };
  }, [currentDate, prefs, periods, logs, width]);

  // Ay değiştirme
  const goToPrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Adet başlat/bitir
  const handlePeriodToggle = async () => {
    if (activePeriod) {
      // Adet bitir - onay iste
      const ok = await confirm(
        'Adet Bitirilsin mi? 🌸',
        'Bugünü adet bitişi olarak kaydedeceksin.'
      );
      if (!ok) return;

      const today = getTodayISO();
      const start = new Date(activePeriod.start + 'T12:00:00');
      const end = new Date(today + 'T12:00:00');
      const periodLengthDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      dispatch(updatePeriod({
        ...activePeriod,
        end: today,
        periodLengthDays,
      }));
    } else {
      // Adet başlat - onay iste
      const ok = await confirm(
        'Adet Başlatılsın mı? 🌸',
        'Bugünü adet başlangıcı olarak işaretleyeceksin.'
      );
      if (!ok) return;

      const today = getTodayISO();
      dispatch(addPeriod({
        id: uuidv4(),
        start: today,
      }));
    }
  };

  // Motivasyon mesajı & AI placeholders
  const todayPrediction = predictions.find(p => p.isToday);
  const todayIso = useMemo(() => getTodayISO(), []);
  const todayLog = useMemo(() => logs.find((log) => log.date === todayIso), [logs, todayIso]);
  const todaySymptoms = useMemo(() => normalizeSymptomEntries(todayLog?.symptoms), [todayLog]);
  const todaySymptomIds = useMemo(() => todaySymptoms.map((item) => item.id as Symptom), [todaySymptoms]);
  const todayFeatureVector = useMemo(() => buildTipFeatures({ log: todayLog, prefs, periods, today: todayIso }), [todayLog, prefs, periods, todayIso]);
  const phaseHint = todayPrediction?.phase ?? inferPhaseForDate(todayIso, prefs, periods);
  const moodHint = mood ?? todayLog?.mood ?? null;

  const motivationMessage = getMotivationPlaceholder();
  useEffect(() => {
    let cancelled = false;

    if (todaySymptomIds.length === 0 && !moodHint) {
      setCalendarSuggestions([]);
      setIsLoadingCalendarSuggestions(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoadingCalendarSuggestions(true);

    getSuggestions(todaySymptomIds, {
      mood: moodHint ?? null,
      phase: phaseHint,
      includeGeneralFallback: true,
      limit: 2,
      features: todayFeatureVector,
    })
      .then((results) => {
        if (!cancelled) {
          setCalendarSuggestions(results);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCalendarSuggestions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCalendarSuggestions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [todaySymptomIds, moodHint, phaseHint, todayFeatureVector]);

  // AI Insights yükleme
  useEffect(() => {
    let cancelled = false;

    setIsLoadingAI(true);

    getAIInsights(logs, periods, prefs, todayIso)
      .then((insights) => {
        if (!cancelled && insights) {
          setAIInsights(insights);
        }
      })
      .catch((error) => {
        console.warn('AI insights yüklenemedi:', error);
        if (!cancelled) {
          setAIInsights(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingAI(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [logs, periods, prefs, todayIso]);

  const insights = useMemo(() => getInsightsPlaceholder(), []);
  const smartTip = getDailySmartTipPlaceholder();

  // Mood-based öneri metni
  // Calendar Grid formatına dönüştür - AI tahminleriyle
  const gridDays = useMemo(() => {
    return calendarDays.map((day, idx) => {
      const dayISO = toISO(day);
      const prediction = predictions.find(p => p.date === dayISO);
      
      let kind: 'adet' | 'fertil' | 'ovu' | 'tahmini' | 'today' | 'none' = 'none';
      let aiConfidence = 0;
      
      if (prediction) {
        if (prediction.isMenstrual) {
          kind = 'adet';
        } else if (prediction.isPredictedMenstrual) {
          kind = 'tahmini';
          // AI güven skoru ekle
          if (aiInsights) {
            aiConfidence = aiInsights.predictions.nextPeriod.confidence;
          }
        } else if (prediction.isOvulation) {
          kind = 'ovu';
          // AI güven skoru ekle
          if (aiInsights) {
            aiConfidence = aiInsights.predictions.ovulation.confidence;
          }
        } else if (prediction.isFertile) {
          kind = 'fertil';
          // AI güven skoru ekle
          if (aiInsights) {
            aiConfidence = aiInsights.predictions.fertileWindow.confidence;
          }
        }
        
        if (prediction.isToday) {
          kind = 'today';
        }
      }
      
      return {
        key: `day-${idx}`,
        label: day.getDate().toString(),
        kind,
        aiConfidence, // AI güven skoru
        onPress: () => navigation.navigate('DailyLog', { date: dayISO }),
      };
    });
  }, [calendarDays, predictions, navigation, aiInsights]);

  // Ay adı (locale'e göre)
  const monthYear = currentDate.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Animated.View style={{ 
        flex: 1, 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}>
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
            paddingBottom: Math.max(80, insets.bottom + 80),
            paddingHorizontal: 20
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Karşılama Alanı */}
          <SectionCard style={{ padding: compact ? themeSpacing(1.5) : themeSpacing(2) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => setMoodOpen(true)}
                accessibilityLabel="Bugün nasılsın?"
                accessibilityRole="button"
              >
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#333' }}>
                  Merhaba 🌸
                </Text>
                <Text style={{ color: '#6B7280', marginTop: 4, fontSize: 16 }}>
                  {mood ? moodLine(mood) : 'Tatlı bir gün olsun!'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                accessibilityLabel="Profil"
                accessibilityRole="button"
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: themeColors.rose, 
                  borderWidth: 2, 
                  borderColor: themeColors.pink,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18 }}>👤</Text>
              </TouchableOpacity>
            </View>
          </SectionCard>

          {/* Özet Widget'ları */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
            {insights.map((item, idx) => (
              <SectionCard 
                key={idx}
                variant="compact"
                style={{ 
                  flex: 1, 
                  paddingVertical: 10,
                  paddingHorizontal: compact ? themeSpacing(1) : themeSpacing(1.5),
                  marginBottom: 0 
                }}
              >
                <Text style={{ 
                  fontSize: compact ? 10 : 11, 
                  color: themeColors.sub, 
                  marginBottom: 4 
                }}>
                  {item.label}
                </Text>
                <Text style={{ 
                  fontSize: compact ? 15 : 16, 
                  fontWeight: '700', 
                  color: themeColors.text 
                }}>
                  {item.value}
                </Text>
                <Text style={{ 
                  fontSize: compact ? 9 : 10, 
                  color: themeColors.sub, 
                  marginTop: 2 
                }}>
                  {item.sub}
                </Text>
              </SectionCard>
            ))}
          </View>

          {/* Takvim Kartı */}
          <SectionCard style={{ paddingVertical: themeSpacing(1.5), paddingHorizontal: 12, paddingBottom: 12, marginBottom: 8 }}>
            <CalendarGrid 
              days={gridDays}
              header={{
                monthLabel: monthYear,
                onPrev: goToPrevMonth,
                onNext: goToNextMonth,
              }}
            />
          </SectionCard>

          {/* Cycle Legend Card (3+2 simetrik grid) */}
          <CycleLegendCard />

          {/* Hızlı İşlemler */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: themeSpacing(2), gap: 12 }}>
            <GradientButton 
              title={activePeriod ? t('calendar.endPeriod') : t('calendar.startPeriod')}
              left={<Text style={{ fontSize: 16 }}>🌸</Text>}
              onPress={handlePeriodToggle}
              colorsPair={activePeriod ? ['#FFB3B3', '#FF8A8A'] : [brand.pinkFrom, brand.pinkTo]}
              textColor={activePeriod ? '#8B0000' : brand.pinkText}
              style={{ width: '48%' }}
            />
            <GradientButton 
              title={t('calendar.addDaily')}
              left={<Text style={{ fontSize: 16 }}>📝</Text>}
              onPress={() => navigation.navigate('DailyLog')}
              colorsPair={[brand.lilacFrom, brand.lilacTo]}
              textColor="#fff"
              style={{ width: '48%' }}
            />
          </View>

          {/* AI Öneriler */}
          <SectionCard style={{ backgroundColor: themeColors.rose, padding: themeSpacing(2) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpacing(1) }}>
              <Text style={{ fontWeight: '700', color: themeColors.text, fontSize: 15 }}>
                {aiInsights ? '🤖 AI Önerileri' : 'Bugün için öneri'}
              </Text>
              {isLoadingAI && (
                <Text style={{ fontSize: 11, color: themeColors.sub }}>AI analiz ediyor...</Text>
              )}
              {!aiInsights && isLoadingCalendarSuggestions && (
                <Text style={{ fontSize: 11, color: themeColors.sub }}>Hazırlanıyor...</Text>
              )}
            </View>
            
            {aiInsights ? (
              <View>
                {/* AI Tahminleri */}
                <View style={{ marginBottom: themeSpacing(1) }}>
                  <Text style={{ fontWeight: '600', color: themeColors.text, fontSize: 13, marginBottom: 4 }}>
                    📅 Döngü Durumu
                  </Text>
                  <Text style={{ color: themeColors.text, fontSize: 12, lineHeight: 18 }}>
                    {aiInsights.predictions.phase.name === 'menstrual' && '🌸 Adet dönemindesin'}
                    {aiInsights.predictions.phase.name === 'follicular' && '🌱 Foliküler faz - enerji yükseliyor'}
                    {aiInsights.predictions.phase.name === 'ovulation' && '💜 Ovulasyon dönemi - en doğurgan zaman'}
                    {aiInsights.predictions.phase.name === 'luteal' && '🍂 Luteal faz - dinlenme zamanı'}
                    {' '}({aiInsights.predictions.phase.dayInCycle}. gün)
                  </Text>
                </View>

                {/* Semptom Tahminleri */}
                {aiInsights.symptoms.predictedSymptoms.length > 0 && (
                  <View style={{ marginBottom: themeSpacing(1) }}>
                    <Text style={{ fontWeight: '600', color: themeColors.text, fontSize: 13, marginBottom: 4 }}>
                      🔮 Beklenen Semptomlar
                    </Text>
                    <Text style={{ color: themeColors.text, fontSize: 12, lineHeight: 18 }}>
                      {aiInsights.symptoms.predictedSymptoms.slice(0, 3).map(s => s.id).join(', ')}
                    </Text>
                  </View>
                )}

                {/* AI Önerileri */}
                {aiInsights.recommendations.tips.length > 0 && (
                  <View>
                    <Text style={{ fontWeight: '600', color: themeColors.text, fontSize: 13, marginBottom: 4 }}>
                      💡 AI Önerisi
                    </Text>
                    <Text style={{ color: themeColors.text, fontSize: 12, lineHeight: 18 }}>
                      {aiInsights.recommendations.tips[0].reason}
                    </Text>
                  </View>
                )}

                {/* Güven Skoru */}
                <View style={{ marginTop: themeSpacing(1), flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: themeColors.sub, fontSize: 11 }}>
                    AI Güveni: %{Math.round(aiInsights.confidence * 100)}
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={{ color: themeColors.text, fontSize: 14, lineHeight: 20 }}>
                  {calendarSuggestions.length > 0 ? calendarSuggestions[0].content : smartTip.body}
                </Text>
                {calendarSuggestions.length > 0 && (
                  <Text style={{ color: themeColors.sub, fontSize: 12, marginTop: themeSpacing(1) }}>
                    Kaynak: {calendarSuggestions[0].source}
                  </Text>
                )}
              </View>
            )}
          </SectionCard>

          {/* Faz Bilgi Kartı */}
          {todayPrediction && (
            <TouchableOpacity 
              onPress={() => setPhaseModalVisible(true)}
              style={{ 
                borderRadius: 20, 
                marginBottom: themeSpacing(2), 
                overflow: 'hidden',
                shadowColor: '#FFB6C1',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFB6F2', '#CBA6FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: themeSpacing(2) }}
              >
                <Text style={{ fontWeight: '700', marginBottom: 8, color: '#FFF', fontSize: 18 }}>
                  {getPhaseInfo(todayPrediction.phase).title}
                </Text>
                <Text style={{ color: '#FFF', fontSize: 14, opacity: 0.9, lineHeight: 20 }}>
                  {getPhaseInfo(todayPrediction.phase).description}
                </Text>
                <Text style={{ color: '#FFF', fontSize: 12, marginTop: themeSpacing(1), fontWeight: '600', opacity: 0.9, textDecorationLine: 'underline' }}>
                  Detaylı bilgi için tıkla →
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Hatırlatıcı CTA */}
          <SectionCard style={{ alignItems: 'center', padding: compact ? themeSpacing(1.5) : themeSpacing(2) }}>
            <Text style={{ 
              fontWeight: '600', 
              color: themeColors.text, 
              textAlign: 'center', 
              fontSize: compact ? 14 : 15,
              marginBottom: themeSpacing(1.5),
              lineHeight: 22,
              paddingHorizontal: 16
            }}>
              {motivationMessage}
            </Text>
            <GradientButton 
              title="🔔 Hatırlatıcıları Ayarla" 
              onPress={() => navigation.navigate('Settings')}
              style={{ width: '100%', maxWidth: 280 }}
            />
          </SectionCard>

          {/* AI Durum Rozeti */}
          <View style={{ alignSelf: 'center', marginTop: themeSpacing(1), marginBottom: themeSpacing(2) }}>
            {isLoadingAI ? (
              <Text style={{ color: themeColors.sub, fontSize: 11, textAlign: 'center' }}>
                🧠 AI analiz ediyor...
              </Text>
            ) : aiInsights ? (
              <Text style={{ color: themeColors.sub, fontSize: 11, textAlign: 'center' }}>
                🤖 AI Aktif • Güven: %{Math.round(aiInsights.confidence * 100)} • Güncelleme: {aiInsights.lastUpdated}
              </Text>
            ) : (
              <Text style={{ color: themeColors.sub, fontSize: 11, textAlign: 'center' }}>
                🔒 Verilerin sadece cihazında • AI bağlantısı yok
              </Text>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </Animated.View>

      {/* Mood Picker */}
      <MoodPicker
        visible={moodOpen}
        onClose={() => setMoodOpen(false)}
        onSelect={(m) => {
          setMood(m);
          trackMoodForAI(m); // AI hook - şimdilik log
        }}
      />

      {/* Confirm Modal Portal */}
      {ConfirmPortal}

      {/* Faz Detay Modal */}
      {todayPrediction && (
        <Modal
          visible={phaseModalVisible}
          onClose={() => setPhaseModalVisible(false)}
          title={t('calendar.phaseInfoTitle')}
        >
          {(() => {
            const phaseInfo = getPhaseInfo(todayPrediction.phase);
            return (
              <View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: spacing.md }}>
                  {phaseInfo.title}
                </Text>
                
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft, marginBottom: spacing.xs }}>
                    {t('calendar.phase.labels.duration')}
                  </Text>
                  <Text style={{ fontSize: 16, color: colors.ink }}>
                    {phaseInfo.dayRange}
                  </Text>
                </View>

                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft, marginBottom: spacing.xs }}>
                    {t('calendar.phase.labels.description')}
                  </Text>
                  <Text style={{ fontSize: 16, color: colors.ink, lineHeight: 24 }}>
                    {phaseInfo.description}
                  </Text>
                </View>

                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft, marginBottom: spacing.xs }}>
                    {t('calendar.phase.labels.hormones')}
                  </Text>
                  <Text style={{ fontSize: 16, color: colors.ink, lineHeight: 24 }}>
                    {phaseInfo.hormonInfo}
                  </Text>
                </View>

                {phaseInfo.commonSymptoms.length > 0 && (
                  <View style={{ marginBottom: spacing.lg }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft, marginBottom: spacing.xs }}>
                      {t('calendar.phase.labels.commonSymptoms')}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                      {phaseInfo.commonSymptoms.map((symptom, idx) => (
                        <View
                          key={idx}
                          style={{
                            paddingVertical: spacing.xs,
                            paddingHorizontal: spacing.md,
                            backgroundColor: colors.primary200,
                            borderRadius: borderRadius.chip,
                          }}
                        >
                          <Text style={{ color: colors.ink, fontSize: 12 }}>
                            {symptom}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft, marginBottom: spacing.xs }}>
                    {t('calendar.phase.labels.tips')}
                  </Text>
                  {phaseInfo.tips.map((tip, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
                      <Text style={{ color: colors.primary, marginRight: spacing.xs }}>•</Text>
                      <Text style={{ fontSize: 15, color: colors.ink, flex: 1, lineHeight: 22 }}>
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })()}
        </Modal>
      )}
    </>
  );
}










