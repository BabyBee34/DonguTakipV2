import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  calculateCycleStats,
  calculateSymptomFrequency,
  getMostFrequentMood,
  getAvgSymptomsPerCycle,
  getMinMaxCycleLengths,
  generatePersonalInsights,
} from '../services/statistics';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

type FilterOption = '7days' | '1month' | '3months' | 'all';

const AI_ENABLED = false; // AI placeholder

export default function ReportsScreen({ navigation }: any) {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();

  const periods = useSelector((state: RootState) => state.periods);
  const logs = useSelector((state: RootState) => state.logs);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');

  // Filtreleme - SADECE GEÇMİŞ
  const filteredLogs = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '1month':
        startDate = subDays(now, 30);
        break;
      case '3months':
        startDate = subDays(now, 90);
        break;
      default:
        return logs.filter(log => isBefore(parseISO(log.date), now));
    }

    return logs.filter(log => {
      const logDate = parseISO(log.date);
      return isAfter(logDate, startDate) && isBefore(logDate, now);
    });
  }, [logs, filter]);

  const filteredPeriods = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '1month':
        startDate = subDays(now, 30);
        break;
      case '3months':
        startDate = subDays(now, 90);
        break;
      default:
        return periods.filter(period => isBefore(parseISO(period.start), now));
    }

    return periods.filter(period => {
      const periodDate = parseISO(period.start);
      return isAfter(periodDate, startDate) && isBefore(periodDate, now);
    });
  }, [periods, filter]);

  const stats = useMemo(() => calculateCycleStats(filteredPeriods), [filteredPeriods]);
  const symptomFreq = useMemo(() => calculateSymptomFrequency(filteredLogs), [filteredLogs]);
  const minMaxCycles = useMemo(() => getMinMaxCycleLengths(filteredPeriods), [filteredPeriods]);
  const avgSymptoms = useMemo(() => getAvgSymptomsPerCycle(filteredLogs, filteredPeriods), [filteredLogs, filteredPeriods]);
  const mostFrequentMood = useMemo(() => getMostFrequentMood(filteredLogs), [filteredLogs]);
  const insights = useMemo(() => generatePersonalInsights(filteredLogs, filteredPeriods), [filteredLogs, filteredPeriods]);

  // Semptom dağılımı (top 5)
  const topSymptoms = useMemo(() => {
    const entries = Object.entries(symptomFreq);
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, freq]) => ({ 
        value: freq, 
        label: symptom.length > 12 ? symptom.slice(0, 10) + '...' : symptom,
        frontColor: '#E94FA1' // KPI rengi
      }));
  }, [symptomFreq]);

  // Ruh hali dağılımı (pie chart)
  const moodDistribution = useMemo(() => {
    const moodCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      if (log.mood) {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      }
    });

    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    
    // 3 pastel ton geçişli renk paleti
    const pastelColors = ['#FFB6EC', '#D6A3FF', '#CFF8EE'];
    
    return Object.entries(moodCounts).map(([mood, count], idx) => ({
      value: count,
      color: pastelColors[idx % pastelColors.length],
      text: `${Math.round((count / total) * 100)}%`,
    }));
  }, [filteredLogs]);

  // Döngü geçmişi (line chart)
  const cycleHistoryData = useMemo(() => {
    return filteredPeriods
      .filter(p => p.cycleLengthDays && p.periodLengthDays)
      .slice(-8)
      .map((p, idx) => ({
        value: p.cycleLengthDays!,
        label: `D${idx + 1}`,
        dataPointText: p.cycleLengthDays!.toString(),
      }));
  }, [filteredPeriods]);

  // Döngü geçmişi listesi (detaylı)
  const cycleHistoryList = useMemo(() => {
    return filteredPeriods
      .filter(p => p.start)
      .sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime())
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        start: format(parseISO(p.start), 'd MMMM yyyy', { locale: tr }),
        end: p.end ? format(parseISO(p.end), 'd MMMM yyyy', { locale: tr }) : '—',
        cycleLength: p.cycleLengthDays || '—',
        periodLength: p.periodLengthDays || '—',
      }));
  }, [filteredPeriods]);

  const hasSufficientData = periods.filter(p => p.end).length >= 2;

  // Loading simulation
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [filteredPeriods, filteredLogs]);

  if (!hasSufficientData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9FB' }} edges={['top']}>
        <EmptyState
          emoji="📊"
          title={t('reports.emptyState.title')}
          description={t('reports.emptyState.description')}
          actionTitle={t('reports.emptyState.action')}
          onActionPress={() => navigation.navigate('Calendar')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9FB' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#FFB6EC', '#D6A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            minHeight: 120,
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginTop: 10 }}>
            İstatistiklerim 📊
          </Text>
          <Text style={{ fontSize: 14, color: '#FFF', opacity: 0.9, marginTop: 8 }}>
            Adet döngüsü, ruh hali ve semptomların analizi
          </Text>
        </LinearGradient>

        {/* Zaman Filtresi */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: 16 }}
        >
          {(['7days', '1month', '3months', 'all'] as FilterOption[]).map(option => {
            const labels = { '7days': 'Son 7 gün', '1month': '1 ay', '3months': '3 ay', 'all': 'Tümü' };
            const isActive = filter === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setFilter(option)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  minHeight: 44,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: isActive ? '#E94FA1' : '#FFF',
                  borderWidth: isActive ? 0 : 1,
                  borderColor: '#E5E7EB',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#FFB6EC', '#D6A3FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      borderRadius: 20,
                    }}
                  />
                ) : null}
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? '#FFF' : '#6B7280',
                    zIndex: 1,
                  }}
                >
                  📅 {labels[option]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          /* Loading Skeletons */
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1 }}><SkeletonLoader type="rect" width="100%" height={95} /></View>
              <View style={{ flex: 1 }}><SkeletonLoader type="rect" width="100%" height={95} /></View>
            </View>
            <View style={{ marginBottom: 16 }}><SkeletonLoader type="rect" width="100%" height={250} /></View>
          </>
        ) : (
          <>
            {/* KPI Kartları - 2 Sütun Grid */}
            <View style={{ marginBottom: 16 }}>
              {/* Row 1 */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 20, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: stats.avgCycleLength > 0 ? '#E94FA1' : '#9CA3AF' }}>
                    {stats.avgCycleLength > 0 ? stats.avgCycleLength : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>Ortalama Döngü</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>gün</Text>
                </View>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 20, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: stats.avgPeriodLength > 0 ? '#E94FA1' : '#9CA3AF' }}>
                    {stats.avgPeriodLength > 0 ? stats.avgPeriodLength : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>Adet Süresi</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>gün</Text>
                </View>
              </View>

              {/* Row 2 */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 20, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: stats.totalCycles > 0 ? '#E94FA1' : '#9CA3AF' }}>
                    {stats.totalCycles > 0 ? stats.totalCycles : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>Takip Edilen</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>döngü</Text>
                </View>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 20, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: stats.lastCycleLength ? '#E94FA1' : '#9CA3AF' }}>
                    {stats.lastCycleLength || '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>Son Döngü</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>gün</Text>
                </View>
              </View>

              {/* Row 3 */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 20, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: minMaxCycles.min > 0 ? '#E94FA1' : '#9CA3AF' }}>
                    {minMaxCycles.min > 0 ? `${minMaxCycles.min}–${minMaxCycles.max}` : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>En Kısa/Uzun</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>gün</Text>
                </View>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 20, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: avgSymptoms > 0 ? '#E94FA1' : '#9CA3AF' }}>
                    {avgSymptoms > 0 ? avgSymptoms : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>Ort. Semptom</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>/ döngü</Text>
                </View>
              </View>
            </View>

            {/* En Sık Ruh Hali Kartı */}
            <View style={{ 
              backgroundColor: '#FCE7F3', 
              borderRadius: 20, 
              padding: 16, 
              marginBottom: 16, 
              height: 70,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 20, marginBottom: 8 }}>🥰</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#E94FA1', textAlign: 'center' }}>
                En Sık Ruh Hali: {mostFrequentMood}
              </Text>
            </View>

            {/* Semptom Dağılımı - Bar Chart */}
            {topSymptoms.length > 0 && (
              <View style={{ 
                backgroundColor: '#FFF', 
                borderRadius: 20, 
                padding: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 }}>
                  Semptom Dağılımı
                </Text>
                <BarChart
                  data={topSymptoms}
                  width={width - 80}
                  height={200}
                  barWidth={width * 0.6 / topSymptoms.length}
                  noOfSections={4}
                  barBorderRadius={8}
                  frontColor="#E94FA1"
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor="#E5E7EB"
                  hideRules
                  showValuesAsTopLabel
                  topLabelTextStyle={{ fontSize: 11, fontWeight: '600', color: '#1F2937' }}
                  xAxisLabelTextStyle={{ fontSize: 10, color: '#6B7280', rotation: -15 }}
                  maxValue={100}
                />
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
                  En sık görülen: <Text style={{ fontWeight: '600', color: '#1F2937' }}>
                    {topSymptoms[0].label} ({topSymptoms[0].value}%)
                  </Text>
                </Text>
              </View>
            )}

            {/* Ruh Hali Dağılımı - Pie Chart */}
            {moodDistribution.length > 0 && (
              <View style={{ 
                backgroundColor: '#FFF', 
                borderRadius: 20, 
                padding: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 }}>
                  Ruh Hali Dağılımı
                </Text>
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <PieChart
                    data={moodDistribution}
                    donut
                    radius={80}
                    innerRadius={50}
                    centerLabelComponent={() => (
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
                        {moodDistribution.reduce((sum, d) => sum + d.value, 0)}
                      </Text>
                    )}
                  />
                </View>
                <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 10, textAlign: 'center' }}>
                  ⚠️ Bu bilgiler geneldir; tıbbi tavsiye değildir.
                </Text>
              </View>
            )}

            {/* Döngü Geçmişi Listesi */}
            {cycleHistoryList.length > 0 ? (
              <View style={{ 
                backgroundColor: '#FFF', 
                borderRadius: 20, 
                padding: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
                  Döngü Geçmişi
                </Text>
                {cycleHistoryList.map((item, idx) => (
                  <View
                    key={item.id}
                    style={{
                      paddingVertical: 16,
                      borderBottomWidth: idx < cycleHistoryList.length - 1 ? 1 : 0,
                      borderBottomColor: '#E5E7EB',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1F2937' }}>
                      {item.start} – {item.end}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                      Döngü: {item.cycleLength} gün • Adet: {item.periodLength} gün
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ 
                backgroundColor: '#FCE7F3', 
                borderRadius: 20, 
                padding: 32, 
                marginBottom: 16, 
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>💭</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
                  Henüz döngü verisi yok.
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                  Günlük kayıt ekleyerek istatistik oluşturabilirsin.
                </Text>
              </View>
            )}

            {/* Kişisel Öneriler */}
            <View style={{ 
              backgroundColor: '#FFEAF7', 
              borderRadius: 20, 
              padding: 16, 
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937' }}>
                  Kişisel Öneriler
                </Text>
                <View
                  style={{
                    backgroundColor: '#E94FA1',
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFF' }}>YAKINDA</Text>
                </View>
              </View>
              <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 20 }}>
                Ruh halin ve semptomlarına göre kişisel öneriler burada görünecek.
              </Text>
            </View>

            {/* Tahmin Sistemi */}
            <View style={{ 
              backgroundColor: '#F3E8FF', 
              borderRadius: 20, 
              padding: 16, 
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
                🎯 Tahmin Sistemi
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12 }}>
                {t('reports.prediction.description')}
              </Text>
              {stats.totalCycles >= 3 ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#E94FA1', marginRight: 8 }}>
                      %{stats.predictionAccuracy}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${stats.predictionAccuracy}%`,
                        backgroundColor: '#E94FA1',
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
                    {t('reports.prediction.calculating', { count: 3 })}
                  </Text>

                  <View
                    style={{
                      padding: 12,
                      backgroundColor: '#E0E7FF',
                      borderLeftWidth: 3,
                      borderLeftColor: '#3B82F6',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#1F2937', lineHeight: 18 }}>
                      ℹ️ {t('reports.prediction.explanation')}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B7280' }}>
                  Daha fazla veri gerekiyor…
                </Text>
              )}
            </View>

            {/* Döngü Değişkenliği */}
            {stats.totalCycles >= 2 && (
              <View style={{ 
                backgroundColor: '#FFF', 
                borderRadius: 20, 
                padding: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
                  📊 Döngü Düzenliliği
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 }}>
                  Döngü değişkenliği: <Text style={{ fontWeight: '600', color: '#1F2937' }}>±{stats.cycleVariability} gün</Text>
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  {stats.cycleVariability < 3
                    ? 'Çok düzenli döngüleriniz var! 🌟'
                    : stats.cycleVariability < 5
                    ? 'Döngüleriniz oldukça düzenli 👍'
                    : 'Döngülerinizde değişkenlik var, bu normal olabilir'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}