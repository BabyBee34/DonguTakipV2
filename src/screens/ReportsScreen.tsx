﻿import React, { useMemo, useState, useEffect } from 'react';
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
import { VictoryBar, VictoryChart, VictoryAxis, VictoryPie, VictoryLine, VictoryScatter, VictoryTheme, VictoryLabel } from 'victory-native';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

type FilterOption = '7days' | '1month' | '3months' | 'all';

const TABBAR_HEIGHT = 84;
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
      .map(([symptom, freq]) => ({ x: symptom.length > 12 ? symptom.slice(0, 10) + '...' : symptom, y: freq }));
  }, [symptomFreq]);

  // Ruh hali dağılımı (donut)
  const moodDistribution = useMemo(() => {
    const moodCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      if (log.mood) {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      }
    });

    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    const moodMap: Record<string, string> = {
      ecstatic: '🤩 Harika',
      happy: '😊 Mutlu',
      calm: '😌 Sakin',
      neutral: '😐 Normal',
      tired: '😴 Yorgun',
      sad: '😢 Üzgün',
      anxious: '😰 Endişeli',
      irritable: '😠 Sinirli',
      angry: '😡 Kızgın',
    };

    return Object.entries(moodCounts).map(([mood, count]) => ({
      x: moodMap[mood] || mood,
      y: count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [filteredLogs]);

  // Döngü geçmişi (çizgi grafik)
  const cycleHistoryData = useMemo(() => {
    return filteredPeriods
      .filter(p => p.cycleLengthDays && p.periodLengthDays)
      .slice(-8)
      .map((p, idx) => ({
        x: idx + 1,
        cycleLength: p.cycleLengthDays,
        periodLength: p.periodLengthDays,
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF6FB' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: spacing.lg,
          paddingBottom: TABBAR_HEIGHT + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#FFB6EC', '#D6A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: spacing.xl,
            marginBottom: 16,
            minHeight: 120,
            justifyContent: 'center',
            ...shadows.card,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFF' }}>
            İstatistiklerim 📊
          </Text>
          <Text style={{ fontSize: 14, color: '#FFF', opacity: 0.9, marginTop: spacing.xs }}>
            Adet döngüsü, ruh hali ve semptomların analizi
          </Text>
        </LinearGradient>

        {/* Tarih Filtresi */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, marginBottom: 12 }}
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
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: 20,
                  backgroundColor: isActive ? colors.primary : colors.bg,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: '#EAEAEA',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? '#FFF' : '#6B7280',
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
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
              <View style={{ flex: 1 }}><SkeletonLoader type="rect" width="100%" height={110} /></View>
              <View style={{ flex: 1 }}><SkeletonLoader type="rect" width="100%" height={110} /></View>
            </View>
            <View style={{ marginBottom: spacing.lg }}><SkeletonLoader type="rect" width="100%" height={250} /></View>
          </>
        ) : (
          <>
            {/* KPI Kartları - 2×N Grid */}
            <View style={{ marginBottom: 16 }}>
              {/* Row 1 */}
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md, minHeight: 110, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '600', color: stats.avgCycleLength > 0 ? colors.primary : '#9CA3AF' }}>
                    {stats.avgCycleLength > 0 ? stats.avgCycleLength : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Ortalama Döngü</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>gün</Text>
                </Card>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md, minHeight: 110, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '600', color: stats.avgPeriodLength > 0 ? colors.primary : '#9CA3AF' }}>
                    {stats.avgPeriodLength > 0 ? stats.avgPeriodLength : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Adet Süresi</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>gün</Text>
                </Card>
              </View>

              {/* Row 2 */}
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md, minHeight: 110, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '600', color: stats.totalCycles > 0 ? colors.primary : '#9CA3AF' }}>
                    {stats.totalCycles > 0 ? stats.totalCycles : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Takip Edilen</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>döngü</Text>
                </Card>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md, minHeight: 110, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '600', color: stats.lastCycleLength ? colors.primary : '#9CA3AF' }}>
                    {stats.lastCycleLength || '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Son Döngü</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>gün</Text>
                </Card>
              </View>

              {/* Row 3 */}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md, minHeight: 110, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '600', color: minMaxCycles.min > 0 ? colors.primary : '#9CA3AF' }}>
                    {minMaxCycles.min > 0 ? `${minMaxCycles.min}–${minMaxCycles.max}` : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>En Kısa/Uzun</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>gün</Text>
                </Card>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md, minHeight: 110, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '600', color: avgSymptoms > 0 ? colors.primary : '#9CA3AF' }}>
                    {avgSymptoms > 0 ? avgSymptoms : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Ort. Semptom</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>/ döngü</Text>
                </Card>
              </View>
            </View>

            {/* En Sık Ruh Hali */}
            <Card backgroundColor={colors.primary200} style={{ marginBottom: 16, padding: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>En Sık Ruh Hali 💭</Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary, marginTop: 4 }}>
                    {mostFrequentMood}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Semptom Dağılımı - Bar Chart */}
            {topSymptoms.length > 0 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                  Semptom Dağılımı 💫
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
                  En sık 5 semptom, yüzde oranlı
                </Text>
                <VictoryChart
                  width={width - 64}
                  height={220}
                  domainPadding={{ x: 20, y: 10 }}
                  padding={{ top: 30, bottom: 50, left: 50, right: 20 }}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: '#EAEAEA' },
                      tickLabels: { fontSize: 10, fill: '#6B7280', angle: -15, textAnchor: 'end' },
                      grid: { stroke: 'none' },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: 'none' },
                      tickLabels: { fontSize: 10, fill: '#9CA3AF' },
                      grid: { stroke: '#F3F4F6', strokeDasharray: '4' },
                    }}
                  />
                  <VictoryBar
                    data={topSymptoms}
                    style={{ data: { fill: colors.primary } }}
                    cornerRadius={{ top: 8 }}
                    barWidth={30}
                    labels={({ datum }) => `${datum.y}%`}
                    labelComponent={<VictoryLabel dy={-8} style={{ fontSize: 11, fill: colors.ink, fontWeight: '600' }} />}
                  />
                </VictoryChart>
                {topSymptoms.length > 0 && (
                  <Text style={{ fontSize: 12, color: colors.inkLight, marginTop: spacing.xs, textAlign: 'center' }}>
                    En sık görülen: <Text style={{ fontWeight: '700', color: colors.ink }}>
                      {topSymptoms[0].x} ({topSymptoms[0].y}%)
                    </Text>
                  </Text>
                )}
              </Card>
            )}

            {/* Ruh Hali Dağılımı - Donut */}
            {moodDistribution.length > 0 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                  Ruh Hali Dağılımı 🎨
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
                  Ruh hali kategorilerine göre kayıt sayısı
                </Text>
                <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
                  <VictoryPie
                    data={moodDistribution}
                    width={280}
                    height={280}
                    innerRadius={80}
                    labelRadius={100}
                    labels={({ datum }) => `${datum.percent}%`}
                    style={{
                      labels: { fontSize: 11, fill: '#FFF', fontWeight: '700' },
                      data: {
                        fill: ({ index }) => {
                          const colors = ['#FFB6EC', '#D6A3FF', '#CFF8EE', '#FFD86B', '#FFDCE7', '#B3B3FF', '#FFC7DB', '#FFB3CC', '#FF9999'];
                          return colors[index % colors.length];
                        },
                      },
                    }}
                  />
                  <Text style={{ position: 'absolute', fontSize: 24, fontWeight: '700', color: colors.ink, top: '45%' }}>
                    {moodDistribution.reduce((sum, d) => sum + d.y, 0)}
                  </Text>
                </View>
                {/* Legend */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
                  {moodDistribution.slice(0, 6).map((item, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm }}>
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: ['#FFB6EC', '#D6A3FF', '#CFF8EE', '#FFD86B', '#FFDCE7', '#B3B3FF'][idx],
                          marginRight: 6,
                        }}
                      />
                      <Text style={{ fontSize: 11, color: colors.inkSoft }}>
                        {item.x} ({item.percent}%)
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 11, color: colors.inkLight, marginTop: spacing.md, textAlign: 'center' }}>
                  ⚠️ Bu bilgiler geneldir; tıbbi tavsiye değildir.
                </Text>
              </Card>
            )}

            {/* Döngü Uzunluğu Geçmişi - Line Chart */}
            {cycleHistoryData.length > 0 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                  Adet Süresi ve Döngü Uzunluğu Geçmişi 📈
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
                  Son döngülerdeki değişimler (sadece geçmiş)
                </Text>
                <VictoryChart
                  width={width - 64}
                  height={220}
                  padding={{ top: 30, bottom: 40, left: 50, right: 20 }}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: '#EAEAEA' },
                      tickLabels: { fontSize: 10, fill: '#6B7280' },
                      grid: { stroke: 'none' },
                    }}
                    tickFormat={(t) => `D${t}`}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: 'none' },
                      tickLabels: { fontSize: 10, fill: '#9CA3AF' },
                      grid: { stroke: '#F3F4F6', strokeDasharray: '4' },
                    }}
                  />
                  <VictoryLine
                    data={cycleHistoryData.map(d => ({ x: d.x, y: d.cycleLength }))}
                    style={{ data: { stroke: colors.primary, strokeWidth: 3 } }}
                  />
                  <VictoryScatter
                    data={cycleHistoryData.map(d => ({ x: d.x, y: d.cycleLength }))}
                    size={5}
                    style={{ data: { fill: colors.primary } }}
                  />
                  <VictoryLine
                    data={cycleHistoryData.map(d => ({ x: d.x, y: d.periodLength }))}
                    style={{ data: { stroke: colors.lilac, strokeWidth: 3 } }}
                  />
                  <VictoryScatter
                    data={cycleHistoryData.map(d => ({ x: d.x, y: d.periodLength }))}
                    size={5}
                    style={{ data: { fill: colors.lilac } }}
                  />
                </VictoryChart>
                {/* Legend */}
                <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary }} />
                    <Text style={{ fontSize: 11, color: colors.inkSoft }}>Döngü Uzunluğu</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.lilac }} />
                    <Text style={{ fontSize: 11, color: colors.inkSoft }}>Adet Süresi</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Döngü Geçmişi Listesi */}
            {cycleHistoryList.length > 0 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                    Döngü Geçmişi 📅
                  </Text>
                </View>
                {cycleHistoryList.map((item, idx) => (
                  <View
                    key={item.id}
                    style={{
                      paddingVertical: spacing.md,
                      borderTopWidth: idx > 0 ? 1 : 0,
                      borderTopColor: colors.bgGray,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>
                      {item.start} — {item.end}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4 }}>
                      Döngü: {item.cycleLength} gün • Adet: {item.periodLength} gün
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {cycleHistoryList.length === 0 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: 16, alignItems: 'center', padding: spacing.xl }}>
                <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>📅</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft, textAlign: 'center' }}>
                  Henüz veri yok
                </Text>
                <Text style={{ fontSize: 12, color: colors.inkLight, textAlign: 'center', marginTop: 4 }}>
                  Günlükten kayıt ekle
                </Text>
              </Card>
            )}

            {/* Kişisel Öneriler - AI Placeholder */}
            <Card backgroundColor="#FFE8F5" style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                  Kişisel Öneriler 🌸
                </Text>
                {!AI_ENABLED && (
                  <View
                    style={{
                      backgroundColor: colors.rose,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.ink }}>YAKINDA</Text>
                  </View>
                )}
              </View>
              {AI_ENABLED ? (
                <>
                  {insights.map((insight, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: 'row',
                        marginBottom: spacing.sm,
                        backgroundColor: colors.bg,
                        padding: spacing.md,
                        borderRadius: borderRadius.card / 2,
                      }}
                    >
                      <Text style={{ fontSize: 18, marginRight: spacing.sm }}>💡</Text>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color: colors.ink,
                          lineHeight: 20,
                        }}
                      >
                        {insight}
                      </Text>
                    </View>
                  ))}
                  <Text style={{ fontSize: 11, color: colors.inkLight, marginTop: spacing.sm, textAlign: 'center' }}>
                    ⚠️ Bu bilgiler geneldir; tıbbi tavsiye değildir.
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 14, color: colors.inkSoft, lineHeight: 20 }}>
                  Ruh halin ve semptomlarına göre kişisel öneriler burada görünecek.
                </Text>
              )}
            </Card>

            {/* Tahmin Doğruluğu */}
            <Card backgroundColor={colors.primary200}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                {t('reports.prediction.title')}
              </Text>
              <Text style={{ fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: spacing.sm }}>
                {t('reports.prediction.description')}
              </Text>
              {stats.totalCycles >= 3 ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
                    <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary, marginRight: spacing.sm }}>
                      %{stats.predictionAccuracy}
                    </Text>
                  </View>
                  <View style={{ marginTop: spacing.md, height: 8, backgroundColor: colors.bgGray, borderRadius: 4, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${stats.predictionAccuracy}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 12, color: colors.inkLight, marginTop: spacing.xs }}>
                    {t('reports.prediction.calculating', { count: 3 })}
                  </Text>

                  <View
                    style={{
                      marginTop: spacing.md,
                      padding: spacing.md,
                      backgroundColor: colors.info + '20',
                      borderLeftWidth: 3,
                      borderLeftColor: colors.info,
                      borderRadius: borderRadius.card / 2,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.ink, lineHeight: 18 }}>
                      ℹ️ {t('reports.prediction.explanation')}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft }}>
                  {t('reports.prediction.insufficient')}
                </Text>
              )}
            </Card>

            {/* Döngü Değişkenliği */}
            {stats.totalCycles >= 2 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginTop: spacing.md }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                  📊 Döngü Düzenliliği
                </Text>
                <Text style={{ fontSize: 14, color: colors.inkSoft, lineHeight: 20 }}>
                  Döngü değişkenliği: <Text style={{ fontWeight: '600', color: colors.ink }}>±{stats.cycleVariability} gün</Text>
                </Text>
                <Text style={{ fontSize: 12, color: colors.inkLight, marginTop: spacing.xs }}>
                  {stats.cycleVariability < 3
                    ? 'Çok düzenli döngüleriniz var! 🌟'
                    : stats.cycleVariability < 5
                    ? 'Döngüleriniz oldukça düzenli 👍'
                    : 'Döngülerinizde değişkenlik var, bu normal olabilir'}
                </Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}