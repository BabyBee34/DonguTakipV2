import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  calculateCycleStats,
  calculateSymptomFrequency,
  getMoodScore,
  calculateEnergyLevels,
  calculateSleepTrend,
  getMostFrequentMood,
  getAvgSymptomsPerCycle,
  getMinMaxCycleLengths,
  getMoodSymptomIntersection,
  generatePersonalInsights,
} from '../services/statistics';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { format, subDays, isAfter, isBefore } from 'date-fns';

type FilterOption = '7days' | '1month' | '3months' | 'all';

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
  const [energySleepTab, setEnergySleepTab] = useState<'energy' | 'sleep'>('energy');

  // Filtreleme
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
        return logs;
    }

    return logs.filter(log => {
      const logDate = new Date(log.date);
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
        return periods;
    }

    return periods.filter(period => {
      const periodDate = new Date(period.start);
      return isAfter(periodDate, startDate) && isBefore(periodDate, now);
    });
  }, [periods, filter]);

  const stats = useMemo(() => calculateCycleStats(filteredPeriods), [filteredPeriods]);
  const symptomFreq = useMemo(() => calculateSymptomFrequency(filteredLogs), [filteredLogs]);
  const minMaxCycles = useMemo(() => getMinMaxCycleLengths(filteredPeriods), [filteredPeriods]);
  const avgSymptoms = useMemo(() => getAvgSymptomsPerCycle(filteredLogs, filteredPeriods), [filteredLogs, filteredPeriods]);
  const mostFrequentMood = useMemo(() => getMostFrequentMood(filteredLogs), [filteredLogs]);
  const insights = useMemo(() => generatePersonalInsights(filteredLogs, filteredPeriods), [filteredLogs, filteredPeriods]);

  const topSymptoms = useMemo(() => {
    const entries = Object.entries(symptomFreq);
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, freq]) => ({ label: symptom, value: freq }));
  }, [symptomFreq]);

  // Ruh Hali Trendi
  const moodTrendData = useMemo(() => {
    return filteredLogs
      .filter(l => l.mood)
      .slice(-10)
      .map((log, idx) => ({
        value: getMoodScore(log.mood!),
        label: (idx + 1).toString(),
        dataPointText: getMoodScore(log.mood!).toString(),
      }));
  }, [filteredLogs]);

  // Enerji & Uyku
  const energyData = useMemo(() => {
    const data = calculateEnergyLevels(filteredLogs);
    return data.map(d => ({
      value: d.value,
      label: d.index.toString(),
      dataPointText: d.value.toString(),
    }));
  }, [filteredLogs]);

  const sleepData = useMemo(() => {
    const data = calculateSleepTrend(filteredLogs);
    return data.map(d => ({
      value: d.value,
      label: d.index.toString(),
      dataPointText: d.value.toString(),
    }));
  }, [filteredLogs]);

  // Döngü Geçmişi (Stacked Bar)
  const cycleLengthsData = useMemo(() => {
    return filteredPeriods
      .filter(p => p.cycleLengthDays && p.periodLengthDays)
      .slice(-6)
      .map((p, idx) => ({
        label: `D${idx + 1}`,
        stacks: [
          { value: p.periodLengthDays!, color: colors.primary },
          { value: (p.cycleLengthDays! - p.periodLengthDays!), color: colors.bgGray },
        ],
      }));
  }, [filteredPeriods, colors]);

  // Ruh Hali & Semptom Kesişimi (Pie)
  const moodSymptomPieData = useMemo(() => {
    const intersection = getMoodSymptomIntersection(filteredLogs);
    const colorMap: Record<string, string> = {
      ecstatic: '#FFD86B',
      happy: '#FFB6EC',
      calm: '#CFF8EE',
      neutral: '#E6D5FF',
      tired: '#FFDCE7',
      sad: '#B3B3FF',
      anxious: '#FFC7DB',
      irritable: '#FFB3CC',
      angry: '#FF9999',
    };
    
    return intersection.slice(0, 5).map(item => ({
      value: item.count,
      color: colorMap[item.mood] || colors.primary,
      text: item.count.toString(),
    }));
  }, [filteredLogs, colors]);

  const hasSufficientData = periods.filter(p => p.end).length >= 2;

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [filteredPeriods, filteredLogs]);

  if (!hasSufficientData) {
    return (
      <EmptyState
        emoji="📊"
        title={t('reports.emptyState.title')}
        description={t('reports.emptyState.description')}
        actionTitle={t('reports.emptyState.action')}
        onActionPress={() => navigation.navigate('Calendar')}
      />
    );
  }

  return (
    <LinearGradient 
      colors={['#FFF6FB', '#FFE6F5']} 
      start={{ x: 0, y: 0 }} 
      end={{ x: 0, y: 1 }} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ 
          padding: spacing.lg, 
          paddingBottom: tabBarHeight + insets.bottom + 20 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient 
          colors={['#FFB6EC', '#D6A3FF']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={{ 
            borderRadius: borderRadius.card, 
            padding: spacing.xl, 
            marginBottom: spacing.lg, 
            ...shadows.card 
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFF' }}>
            İstatistiklerim 📊
          </Text>
          <Text style={{ fontSize: 14, color: '#FFF', opacity: 0.9, marginTop: spacing.xs }}>
            Adet döngüsü, ruh hali ve semptomlarının analizi
          </Text>
        </LinearGradient>

        {/* Tarih Filtresi */}
        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.sm, 
          marginBottom: spacing.lg,
          flexWrap: 'wrap',
        }}>
          {(['7days', '1month', '3months', 'all'] as FilterOption[]).map(option => {
            const labels = { '7days': 'Son 7 gün', '1month': '1 ay', '3months': '3 ay', 'all': 'Tümü' };
            const isActive = filter === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setFilter(option)}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: 20,
                  backgroundColor: isActive ? colors.primary : colors.bg,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.bgGray,
                }}
              >
                <Text style={{ 
                  fontSize: 13, 
                  fontWeight: isActive ? '700' : '600', 
                  color: isActive ? '#FFF' : colors.inkSoft 
                }}>
                  📅 {labels[option]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          /* Loading Skeletons */
          <>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
              <View style={{ flex: 1 }}><SkeletonLoader type="rect" width="100%" height={100} /></View>
              <View style={{ flex: 1 }}><SkeletonLoader type="rect" width="100%" height={100} /></View>
            </View>
            <View style={{ marginBottom: spacing.lg }}><SkeletonLoader type="rect" width="100%" height={250} /></View>
          </>
        ) : (
          <>
            {/* Özet Kartları - 2x3 Grid */}
            <View style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>{stats.avgCycleLength}</Text>
                  <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Ortalama Döngü</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>gün</Text>
                </Card>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>{stats.avgPeriodLength}</Text>
                  <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Adet Süresi</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>gün</Text>
                </Card>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>{stats.totalCycles}</Text>
                  <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Takip Edilen</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>döngü</Text>
                </Card>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>{stats.lastCycleLength || '-'}</Text>
                  <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Son Döngü</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>gün</Text>
                </Card>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary }}>
                    {minMaxCycles.min}-{minMaxCycles.max}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>En Kısa/Uzun</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>gün</Text>
                </Card>
                <Card style={{ flex: 1, alignItems: 'center', padding: spacing.md }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>{avgSymptoms}</Text>
                  <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>Ort. Semptom</Text>
                  <Text style={{ fontSize: 11, color: colors.inkLight }}>/ döngü</Text>
                </Card>
              </View>
            </View>

            {/* En Sık Ruh Hali */}
            <Card backgroundColor={colors.primary200} style={{ marginBottom: spacing.md, padding: spacing.md }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>En Sık Ruh Hali 💭</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary, marginTop: spacing.xs }}>
                {mostFrequentMood}
              </Text>
            </Card>

            {/* Semptom Dağılımı - Yatay Bar Chart */}
            {topSymptoms.length > 0 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.md }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                  Semptom Dağılımı 💫
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
                  En sık 5 semptom, yüzde oranlı
                </Text>
                <BarChart
                  data={topSymptoms}
                  barWidth={width * 0.7 / topSymptoms.length}
                  noOfSections={4}
                  barBorderRadius={8}
                  frontColor={colors.primary}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={colors.bgGray}
                  hideRules
                  showValuesAsTopLabel
                  topLabelTextStyle={{ fontSize: 12, fontWeight: '600', color: colors.ink }}
                  xAxisLabelTextStyle={{ fontSize: 11, color: colors.inkSoft }}
                  maxValue={100}
                />
                {topSymptoms.length > 0 && (
                  <Text style={{ fontSize: 12, color: colors.inkLight, marginTop: spacing.sm, textAlign: 'center' }}>
                    En sık görülen: <Text style={{ fontWeight: '700', color: colors.ink }}>
                      {topSymptoms[0].label} ({topSymptoms[0].value}%)
                    </Text>
                  </Text>
                )}
              </Card>
            )}

            {/* Ruh Hali Zaman Çizelgesi - Line Chart */}
            {moodTrendData.length >= 3 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.md }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                  Ruh Hali Trendi 💕
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
                  Ruh halindeki değişimleri dönem boyunca izleyebilirsin
                </Text>
                <LineChart
                  data={moodTrendData}
                  width={width - 80}
                  height={200}
                  color={colors.lilac}
                  thickness={3}
                  dataPointsColor={colors.lilac}
                  dataPointsRadius={6}
                  startFillColor={colors.lilac}
                  endFillColor={colors.lilac}
                  startOpacity={0.3}
                  endOpacity={0.05}
                  areaChart
                  curved
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={colors.bgGray}
                  xAxisLabelTextStyle={{ fontSize: 10, color: colors.inkSoft }}
                  yAxisTextStyle={{ fontSize: 10, color: colors.inkSoft }}
                  maxValue={10}
                  noOfSections={5}
                />
              </Card>
            )}

            {/* Enerji & Uyku - Sekmeli Area Chart */}
            {(energyData.length >= 3 || sleepData.length >= 3) && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                    {energySleepTab === 'energy' ? 'Enerji Seviyesi ⚡' : 'Uyku Eğilimi 😴'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                    <TouchableOpacity
                      onPress={() => setEnergySleepTab('energy')}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 16,
                        backgroundColor: energySleepTab === 'energy' ? colors.primary : colors.bgGray,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: energySleepTab === 'energy' ? '#FFF' : colors.inkSoft }}>
                        Enerji
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setEnergySleepTab('sleep')}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 16,
                        backgroundColor: energySleepTab === 'sleep' ? colors.primary : colors.bgGray,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: energySleepTab === 'sleep' ? '#FFF' : colors.inkSoft }}>
                        Uyku
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <LineChart
                  data={energySleepTab === 'energy' ? energyData : sleepData}
                  width={width - 80}
                  height={180}
                  color={energySleepTab === 'energy' ? '#FFB6EC' : '#D6A3FF'}
                  thickness={3}
                  dataPointsColor={energySleepTab === 'energy' ? '#FFB6EC' : '#D6A3FF'}
                  dataPointsRadius={5}
                  startFillColor={energySleepTab === 'energy' ? '#FFB6EC' : '#D6A3FF'}
                  endFillColor={energySleepTab === 'energy' ? '#FFB6EC' : '#D6A3FF'}
                  startOpacity={0.4}
                  endOpacity={0.1}
                  areaChart
                  curved
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={colors.bgGray}
                  xAxisLabelTextStyle={{ fontSize: 10, color: colors.inkSoft }}
                  maxValue={10}
                  noOfSections={5}
                />
              </Card>
            )}

            {/* Döngü Geçmişi - Stacked Bar (Adet + Ara Faz) */}
            {cycleLengthsData.length > 0 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.md }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                  Döngü Sıklığı 🌷
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
                  Her döngü ortalama {stats.avgCycleLength} gün, adet süresi ortalama {stats.avgPeriodLength} gün
                </Text>
                <View style={{ height: 200, paddingTop: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 180 }}>
                    {cycleLengthsData.map((item, idx) => {
                      const totalHeight = item.stacks.reduce((sum, s) => sum + s.value, 0);
                      const maxHeight = 40; // max cycle length
                      const heightPercent = (totalHeight / maxHeight) * 100;

                      return (
                        <View key={idx} style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.ink, marginBottom: 4 }}>
                            {totalHeight}
                          </Text>
                          <View style={{ width: '80%', maxWidth: 36, height: `${heightPercent}%`, borderRadius: 8, overflow: 'hidden' }}>
                            {item.stacks.map((stack, sIdx) => (
                              <View
                                key={sIdx}
                                style={{
                                  width: '100%',
                                  height: `${(stack.value / totalHeight) * 100}%`,
                                  backgroundColor: stack.color,
                                }}
                              />
                            ))}
                          </View>
                          <Text style={{ fontSize: 10, color: colors.inkSoft, marginTop: 6 }}>{item.label}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: colors.primary }} />
                    <Text style={{ fontSize: 11, color: colors.inkSoft }}>Adet</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: colors.bgGray }} />
                    <Text style={{ fontSize: 11, color: colors.inkSoft }}>Ara Faz</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Ruh Hali & Semptom Kesişimi - Pie Chart */}
            {moodSymptomPieData.length > 0 && (
              <Card backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.md }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
                  Ruh Hali Dağılımı 🎨
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
                  Ruh hali kategorilerine göre kayıt sayısı
                </Text>
                <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
                  <PieChart
                    data={moodSymptomPieData}
                    donut
                    radius={80}
                    innerRadius={50}
                    centerLabelComponent={() => (
                      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>
                        {moodSymptomPieData.reduce((sum, d) => sum + d.value, 0)}
                      </Text>
                    )}
                  />
                </View>
                <Text style={{ fontSize: 11, color: colors.inkLight, textAlign: 'center', marginTop: spacing.xs }}>
                  ⚠️ Bu bilgiler geneldir; tıbbi tavsiye değildir.
                </Text>
              </Card>
            )}

            {/* Kişisel İçgörüler */}
            <Card backgroundColor="#FFE8F5" style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.md }}>
                Kişisel Öneriler 🌸
              </Text>
              {insights.map((insight, idx) => (
                <View key={idx} style={{ 
                  flexDirection: 'row', 
                  marginBottom: spacing.sm,
                  backgroundColor: colors.bg,
                  padding: spacing.md,
                  borderRadius: borderRadius.card / 2,
                }}>
                  <Text style={{ fontSize: 18, marginRight: spacing.sm }}>💡</Text>
                  <Text style={{ 
                    flex: 1, 
                    fontSize: 14, 
                    color: colors.ink, 
                    lineHeight: 20,
                  }}>
                    {insight}
                  </Text>
                </View>
              ))}
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

                  <View style={{
                    marginTop: spacing.md,
                    padding: spacing.md,
                    backgroundColor: colors.info + '20',
                    borderLeftWidth: 3,
                    borderLeftColor: colors.info,
                    borderRadius: borderRadius.card / 2,
                  }}>
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
    </LinearGradient>
  );
}