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
import { mapSymptomLabelsTR, mapMoodLabelsTR } from '../utils/symptomLabels';
import { 
  TimeRange, 
  applyAllFilters, 
  formatPeriodsForSelection 
} from '../utils/reportsFilters';
import ReportsFilterModal from '../components/ReportsFilterModal';

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
  const [timeFilter, setTimeFilter] = useState<TimeRange>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [menstruationOnly, setMenstruationOnly] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState<any[]>([]);

  // Tüm filtreleri uygula
  const { filteredLogs, filteredPeriods } = useMemo(() => {
    return applyAllFilters(logs, periods, timeFilter, menstruationOnly, selectedPeriods);
  }, [logs, periods, timeFilter, menstruationOnly, selectedPeriods]);

  const stats = useMemo(() => calculateCycleStats(filteredPeriods), [filteredPeriods]);
  const symptomFreq = useMemo(() => calculateSymptomFrequency(filteredLogs), [filteredLogs]);
  const minMaxCycles = useMemo(() => getMinMaxCycleLengths(filteredPeriods), [filteredPeriods]);
  const avgSymptoms = useMemo(() => getAvgSymptomsPerCycle(filteredLogs, filteredPeriods), [filteredLogs, filteredPeriods]);
  const mostFrequentMood = useMemo(() => getMostFrequentMood(filteredLogs), [filteredLogs]);
  const insights = useMemo(() => generatePersonalInsights(filteredLogs, filteredPeriods), [filteredLogs, filteredPeriods]);

  // Semptom dağılımı (top 5) - Türkçe etiketlerle
  const topSymptoms = useMemo(() => {
    const entries = Object.entries(symptomFreq);
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, freq]) => ({ 
        value: freq, 
        label: mapSymptomLabelsTR(symptom).length > 12 
          ? mapSymptomLabelsTR(symptom).slice(0, 10) + '...' 
          : mapSymptomLabelsTR(symptom),
        frontColor: '#E94FA1'
      }));
  }, [symptomFreq]);

  // Ruh hali dağılımı (pie chart) - Türkçe etiketlerle
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
      label: mapMoodLabelsTR(mood),
    }));
  }, [filteredLogs]);

  // Döngü geçmişi listesi (detaylı) - Türkçe tarih formatıyla
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

  const handleFilterApply = (filters: { menstruationOnly: boolean; selectedPeriods: any[] }) => {
    setMenstruationOnly(filters.menstruationOnly);
    setSelectedPeriods(filters.selectedPeriods);
  };

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
          paddingTop: insets.top + 24,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {/* Başlık Kartı */}
        <LinearGradient
          colors={['#FFB6EC', '#D6A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
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
            İstatistiklerim 📊
          </Text>
          <Text style={{ fontSize: 14, color: '#FFF', opacity: 0.9, marginTop: 8 }}>
            Adet döngüsü, ruh hali ve semptomların analizi
          </Text>
        </LinearGradient>

        {/* Zaman Filtreleri */}
        <View style={{ marginBottom: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {(['7days', '1month', '3months', 'all'] as TimeRange[]).map(option => {
              const labels = { '7days': 'Son 7 gün', '1month': '1 ay', '3months': '3 ay', 'all': 'Tümü' };
              const isActive = timeFilter === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setTimeFilter(option)}
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
            
            {/* Filtre İkonu */}
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                minHeight: 44,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: '#FFF',
                borderWidth: 1,
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
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280' }}>
                🔍 Filtre
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Seçili Filtre Rozetleri */}
          {(menstruationOnly || selectedPeriods.length > 0) && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 8 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {menstruationOnly && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFE8F5',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#E94FA1',
                }}>
                  <Text style={{ fontSize: 12, color: '#E94FA1', fontWeight: '600', marginRight: 4 }}>
                    Sadece Adet Günleri
                  </Text>
                  <TouchableOpacity
                    onPress={() => setMenstruationOnly(false)}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: '#E94FA1',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {selectedPeriods.map((period, idx) => (
                <View key={period.id} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFE8F5',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#E94FA1',
                }}>
                  <Text style={{ fontSize: 12, color: '#E94FA1', fontWeight: '600', marginRight: 4 }}>
                    Dönem {idx + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedPeriods(prev => prev.filter(p => p.id !== period.id))}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: '#E94FA1',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

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
            {/* Özet Kartları (4+2 grid) */}
            <View style={{ marginBottom: 16 }}>
              {/* Row 1 */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 14, 
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
                  borderRadius: 14, 
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
                  borderRadius: 14, 
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
                  borderRadius: 14, 
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
                  borderRadius: 14, 
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
                  borderRadius: 14, 
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

            {/* En Sık Ruh Hâli Kartı */}
            <View style={{ 
              backgroundColor: '#FCE7F3', 
              borderRadius: 14, 
              padding: 16, 
              marginBottom: 16, 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
                En Sık Ruh Hâli ☁️
              </Text>
              <Text style={{ fontSize: 16, color: '#E94FA1', fontWeight: '600' }}>
                {mostFrequentMood || 'Ruh hâli verisi bulunamadı.'}
              </Text>
            </View>

            {/* Semptom Dağılımı - Bar Chart */}
            {topSymptoms.length > 0 ? (
              <View style={{ 
                backgroundColor: '#FFF', 
                borderRadius: 14, 
                padding: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
                  Semptom Dağılımı ✨
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                  En sık 5 semptom, yüzde oranlı
                </Text>
                
                {/* Grafik Container - Overflow Hidden */}
                <View style={{ 
                  overflow: 'hidden', 
                  borderRadius: 8,
                  paddingTop: 12,
                  paddingBottom: 8,
                  paddingLeft: 12,
                  paddingRight: 12,
                }}>
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
                </View>
                
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 12, textAlign: 'center', fontStyle: 'italic' }}>
                  En sık görülen: <Text style={{ fontWeight: '600', color: '#1F2937' }}>
                    {topSymptoms[0].label} ({topSymptoms[0].value}%)
                  </Text>
                </Text>
              </View>
            ) : (
              <View style={{ 
                backgroundColor: '#F9FAFB', 
                borderRadius: 14, 
                padding: 32, 
                marginBottom: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                  Semptom kaydı bulunamadı.
                </Text>
              </View>
            )}

            {/* Ruh Hâli Dağılımı - Donut Chart */}
            {moodDistribution.length > 0 ? (
              <View style={{ 
                backgroundColor: '#FFF', 
                borderRadius: 14, 
                padding: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
                  Ruh Hâli Dağılımı 🎨
                </Text>
                
                {/* Grafik Container - Overflow Hidden */}
                <View style={{ 
                  overflow: 'hidden', 
                  borderRadius: 8,
                  alignItems: 'center', 
                  marginVertical: 16,
                }}>
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
                
                <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 16, textAlign: 'center' }}>
                  ⚠️ Bu bilgiler geneldir; tıbbî tavsiye değildir.
                </Text>
              </View>
            ) : (
              <View style={{ 
                backgroundColor: '#F9FAFB', 
                borderRadius: 14, 
                padding: 32, 
                marginBottom: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                  Ruh hâli kaydı bulunamadı.
                </Text>
              </View>
            )}

            {/* Döngü Geçmişi 📅 */}
            {cycleHistoryList.length > 0 ? (
              <View style={{ 
                backgroundColor: '#FFF', 
                borderRadius: 14, 
                padding: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
                  Döngü Geçmişi 📅
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
                borderRadius: 14, 
                padding: 32, 
                marginBottom: 16, 
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
                  Bu aralık için veri yok.
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                  Farklı bir zaman aralığı seçebilirsin.
                </Text>
              </View>
            )}

            {/* Kişisel Öneriler 🌸 */}
            <View style={{ 
              backgroundColor: '#FFEAF7', 
              borderRadius: 14, 
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
                  Kişisel Öneriler 🌸
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

            {/* Tahmin Sistemi 🎯 */}
            <View style={{ 
              backgroundColor: '#F3E8FF', 
              borderRadius: 14, 
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
                Döngülerinizi takip ettikçe doğruluk artacaktır. Daha fazla veri gerekiyor…
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
                borderRadius: 14, 
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

        {/* Filter Modal */}
        <ReportsFilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleFilterApply}
          periods={periods}
          initialFilters={{
            menstruationOnly,
            selectedPeriods,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}