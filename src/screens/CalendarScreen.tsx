import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addPeriod, updatePeriod } from '../store/slices/periodsSlice';
import { predictCycle } from '../services/prediction';
import { getPhaseMotivation, getPhaseInfo } from '../services/tipsService';
import { toISO, getTodayISO } from '../utils/date';
import { useTheme } from '../theme/ThemeProvider';
import Modal from '../components/Modal';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

const WEEKDAYS = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

export default function CalendarScreen({ navigation }: any) {
  const { colors, spacing, borderRadius, shadows, gradients } = useTheme();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const prefs = useSelector((state: RootState) => state.prefs);
  const periods = useSelector((state: RootState) => state.periods);
  const logs = useSelector((state: RootState) => state.logs);
  const insets = useSafeAreaInsets();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [phaseModalVisible, setPhaseModalVisible] = useState(false);
  const { width } = useWindowDimensions();

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
  const handlePeriodToggle = () => {
    if (activePeriod) {
      // Adet bitir
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
      // Adet başlat
      const today = getTodayISO();
      dispatch(addPeriod({
        id: uuidv4(),
        start: today,
      }));
    }
  };

  // Motivasyon mesajı
  const todayPrediction = predictions.find(p => p.isToday);
  const motivationMessage = todayPrediction 
    ? getPhaseMotivation(todayPrediction.phase)
    : t('calendar.subtitle');

  // Ay adı (locale'e göre)
  const monthYear = currentDate.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.xl) }}>
      <LinearGradient
        colors={gradients.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}
      >
        {/* Header - Glassmorphism */}
        <View style={{ 
          borderRadius: 20, 
          padding: spacing.lg, 
          backgroundColor: colors.glassBackground,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.ink }}>Merhaba 🌸</Text>
              <Text style={{ color: colors.inkSoft, marginTop: 4, fontSize: 15 }}>Bugün nasılsın?</Text>
            </View>
            <View style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 24, 
              backgroundColor: colors.glassBackgroundStrong, 
              borderWidth: 2, 
              borderColor: colors.primary + '4D',
              ...shadows.card,
            }} />
          </View>
        </View>

        {/* Takvim - Modern Card */}
        <View style={{ 
          marginTop: spacing.lg, 
          borderRadius: 20, 
          backgroundColor: colors.glassBackground, 
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.glassBackgroundStrong,
          ...shadows.card,
        }}>
          {/* Ay navigasyonu */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xs }}>
            <TouchableOpacity 
              onPress={goToPrevMonth} 
              style={{ padding: spacing.sm, borderRadius: 9999 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.previous')}
            >
              <Text style={{ fontSize: 18, color: colors.inkSoft }}>‹</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: '600', fontSize: 16, color: colors.ink }}>{monthYear}</Text>
            <TouchableOpacity 
              onPress={goToNextMonth} 
              style={{ padding: spacing.sm, borderRadius: 9999 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.next')}
            >
              <Text style={{ fontSize: 18, color: colors.inkSoft }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Gün başlıkları */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
            {[t('calendar.weekdays.monday'), t('calendar.weekdays.tuesday'), t('calendar.weekdays.wednesday'), t('calendar.weekdays.thursday'), t('calendar.weekdays.friday'), t('calendar.weekdays.saturday'), t('calendar.weekdays.sunday')].map((k, idx) => (
              <Text key={idx} style={{ color: colors.inkSoft, fontSize: 11, width: (width - 32 - 24) / 7, textAlign: 'center' }}>{k}</Text>
            ))}
          </View>

          {/* Takvim günleri */}
          <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 8 }}>
            {calendarDays.map((day, idx) => {
              const dayISO = toISO(day);
              const prediction = predictions.find(p => p.date === dayISO);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              
              let bgColor = 'transparent';
              let textColor = isCurrentMonth ? colors.ink : colors.inkLight;
              let icon = '';
              
              if (prediction) {
                if (prediction.isMenstrual) {
                  bgColor = colors.menstrualRed;
                  textColor = colors.textOnDark;
                  icon = '🌸';
                } else if (prediction.isPredictedMenstrual) {
                  bgColor = colors.predictedPink;
                  icon = '🌷';
                } else if (prediction.isOvulation) {
                  bgColor = colors.ovulationPurple;
                  textColor = colors.textOnDark;
                  icon = '💜';
                } else if (prediction.isFertile) {
                  bgColor = colors.fertileGreen;
                  icon = '🌱';
                }
                
                // Bugün için özel işaretleme
                if (prediction.isToday) {
                  icon = '🌟';
                }
              }

              return (
                <View key={idx} style={{ width: (width - 32) / 7, paddingVertical: spacing.xs, alignItems: 'center' }}>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('DailyLog', { date: dayISO })}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: bgColor,
                      borderWidth: prediction?.isToday ? 2 : 0,
                      borderColor: prediction?.isToday ? colors.todayMint : 'transparent',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${day.getDate()} ${monthYear}${prediction ? `, ${prediction.isMenstrual ? t('calendar.legend.menstrual') : prediction.isPredictedMenstrual ? t('calendar.legend.predicted') : prediction.isOvulation ? t('calendar.legend.ovulation') : prediction.isFertile ? t('calendar.legend.fertile') : ''}` : ''}`}
                  >
                    <Text style={{ fontWeight: '600', color: textColor }}>{day.getDate()}</Text>
                    {icon && (
                      <Text style={{ position: 'absolute', top: 2, right: 4, fontSize: 12 }}>{icon}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing.md }} contentContainerStyle={{ paddingHorizontal: spacing.xs }}>
          {[
            { label: t('calendar.legend.menstrual'), bg: colors.menstrualRed, color: colors.textOnDark },
            { label: t('calendar.legend.predicted'), bg: colors.predictedPink, color: colors.ink },
            { label: t('calendar.legend.fertile'), bg: colors.fertileGreen, color: colors.ink },
            { label: t('calendar.legend.ovulation'), bg: colors.ovulationPurple, color: colors.textOnDark },
            { label: t('calendar.legend.today'), bg: colors.bg, color: colors.ink, ring: colors.todayMint },
          ].map((c, i) => (
            <View key={i} style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: c.bg, borderRadius: borderRadius.chip, marginRight: spacing.sm, borderWidth: c.ring ? 2 : 0, borderColor: c.ring || 'transparent' }}>
              <Text style={{ color: c.color, fontWeight: '600', fontSize: 12 }}>{c.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Hızlı Aksiyonlar - Modern Gradient Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
          <TouchableOpacity 
            onPress={handlePeriodToggle}
            activeOpacity={0.8}
            style={{ flex: 1 }}
            accessibilityRole="button"
            accessibilityLabel={activePeriod ? t('calendar.endPeriod') : t('calendar.startPeriod')}
          >
            <LinearGradient
              colors={activePeriod ? [colors.danger, colors.menstrualRed] : [colors.success, colors.fertileGreen]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ 
                height: 56, 
                borderRadius: 16, 
                alignItems: 'center', 
                justifyContent: 'center',
                ...shadows.button,
              }}
            >
              <Text style={{ color: colors.textOnDark, fontWeight: '700', fontSize: 15 }}>
                {activePeriod ? '⏹ ' + t('calendar.endPeriod') : '▶ ' + t('calendar.startPeriod')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('DailyLog')}
            activeOpacity={0.8}
            style={{ flex: 1 }}
            accessibilityRole="button"
            accessibilityLabel={t('calendar.addDaily')}
          >
            <LinearGradient
              colors={gradients.button2}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ 
                height: 56, 
                borderRadius: 16, 
                alignItems: 'center', 
                justifyContent: 'center',
                ...shadows.button,
              }}
            >
              <Text style={{ color: colors.textOnDark, fontWeight: '700', fontSize: 15 }}>✎ {t('calendar.addDaily')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Faz Bilgi Kartı - Gradient */}
        {todayPrediction && (
          <TouchableOpacity 
            onPress={() => setPhaseModalVisible(true)}
            style={{ borderRadius: borderRadius.card, marginBottom: spacing.md, ...shadows.card, overflow: 'hidden' }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.lilac]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: spacing.lg }}
            >
              <Text style={{ fontWeight: '700', marginBottom: spacing.sm, color: colors.textOnPrimary }}>
                {getPhaseInfo(todayPrediction.phase).title}
              </Text>
              <Text style={{ color: colors.textOnPrimary, fontSize: 14, opacity: 0.95 }}>
                {getPhaseInfo(todayPrediction.phase).description}
              </Text>
              <Text style={{ color: colors.textOnPrimary, fontSize: 12, marginTop: spacing.sm, fontWeight: '600', opacity: 0.9 }}>
                {t('calendar.phase.moreInfo')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Motivasyon Kartı */}
        <View style={{ borderRadius: borderRadius.card, padding: spacing.lg, backgroundColor: colors.bg, ...shadows.card }}>
          <Text style={{ textAlign: 'center', color: colors.ink, fontWeight: '500' }}>{motivationMessage}</Text>
        </View>
      </LinearGradient>

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
    </ScrollView>
  );
}
