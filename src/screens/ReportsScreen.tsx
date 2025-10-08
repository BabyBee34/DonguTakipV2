import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  calculateCycleStats,
  calculateSymptomFrequency,
  getMostFrequentMood,
  getAvgSymptomsPerCycle,
  getMinMaxCycleLengths,
} from '../services/statistics';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import ProgressBar from '../components/ProgressBar';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { mapSymptomLabelsTR, mapMoodLabelsTR } from '../utils/symptomLabels';
import { 
  TimeRange, 
  applyAllFilters, 
} from '../utils/reportsFilters';
import ReportsFilterModal from '../components/ReportsFilterModal';

const AI_ENABLED = false; // AI placeholder

// Ruh hali renkleri
const MOOD_COLORS: Record<string, string> = {
  'ecstatic': '#4ADE80', // yeşil
  'happy': '#34D399', // turkuaz-yeşil
  'calm': '#60A5FA', // mavi
  'neutral': '#9CA3AF', // gri
  'tired': '#F59E0B', // kehribar
  'sad': '#A78BFA', // mor
  'anxious': '#FB923C', // turuncu
  'irritable': '#F87171', // kırmızı
  'angry': '#EF4444', // koyu kırmızı
};

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

  // Aktif filtre kontrolü
  const hasActiveFilters = menstruationOnly || selectedPeriods.length > 0;

  // Tüm filtreleri uygula - memoized
  const { filteredLogs, filteredPeriods } = useMemo(() => {
    return applyAllFilters(logs, periods, timeFilter, menstruationOnly, selectedPeriods);
  }, [logs, periods, timeFilter, menstruationOnly, selectedPeriods]);

  const stats = useMemo(() => calculateCycleStats(filteredPeriods), [filteredPeriods]);
  const symptomFreq = useMemo(() => calculateSymptomFrequency(filteredLogs), [filteredLogs]);
  const minMaxCycles = useMemo(() => getMinMaxCycleLengths(filteredPeriods), [filteredPeriods]);
  const avgSymptoms = useMemo(() => getAvgSymptomsPerCycle(filteredLogs, filteredPeriods), [filteredLogs, filteredPeriods]);
  const mostFrequentMood = useMemo(() => getMostFrequentMood(filteredLogs), [filteredLogs]);

  // Semptom dağılımı (top 5) - Türkçe etiketlerle + ilerleme barı için
  const topSymptoms = useMemo(() => {
    const entries = Object.entries(symptomFreq);
    const totalCount = entries.reduce((sum, [, count]) => sum + count, 0);
    
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ 
        symptom,
        label: mapSymptomLabelsTR(symptom),
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }));
  }, [symptomFreq]);

  // Ruh hali dağılımı - liste için
  const moodDistribution = useMemo(() => {
    const moodCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      if (log.mood) {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      }
    });

    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    
    const moodArray = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([mood, count]) => ({
        mood,
        label: mapMoodLabelsTR(mood),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: MOOD_COLORS[mood] || '#9CA3AF',
      }));

    return { moods: moodArray, total };
  }, [filteredLogs]);

  // Döngü geçmişi listesi (detaylı) - Türkçe tarih formatıyla - memoized
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

  const handleFilterApply = useCallback((filters: { menstruationOnly: boolean; selectedPeriods: any[] }) => {
    setMenstruationOnly(filters.menstruationOnly);
    setSelectedPeriods(filters.selectedPeriods);
  }, []);

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

  // Render semptom satırı
  const renderSymptomItem = ({ item, index }: { item: any; index: number }) => (
    <View
      style={{
        paddingVertical: 12,
        borderBottomWidth: index < topSymptoms.length - 1 ? 1 : 0,
        borderBottomColor: '#E5E7EB',
      }}
      accessibilityLabel={`${item.label}, yüzde ${item.percentage}, ${item.count} kez`}
      accessibilityRole="text"
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', flex: 1 }}>
          {item.label}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#E94FA1', marginLeft: 8 }}>
          %{item.percentage} • {item.count} kez
        </Text>
      </View>
      <ProgressBar percentage={item.percentage} />
    </View>
  );

  // Render ruh hali satırı
  const renderMoodItem = ({ item, index }: { item: any; index: number }) => {
    const isTopMood = index === 0;
  return (
      <View
        style={{
          paddingVertical: 12,
          borderBottomWidth: index < moodDistribution.moods.length - 1 ? 1 : 0,
          borderBottomColor: '#E5E7EB',
        }}
        accessibilityLabel={`${item.label}, yüzde ${item.percentage}, ${item.count} kez${isTopMood ? ', en sık' : ''}`}
        accessibilityRole="text"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
              {item.label}
            </Text>
            {isTopMood && (
              <View
                style={{
                  backgroundColor: '#E94FA1',
                  borderRadius: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginLeft: 8,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#FFF' }}>En sık</Text>
            </View>
            )}
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginLeft: 8 }}>
            %{item.percentage} • {item.count} kez
          </Text>
            </View>
        <ProgressBar percentage={item.percentage} color={item.color} height={4} />
            </View>
    );
  };

  // Render döngü geçmişi satırı
  const renderCycleHistoryItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={{
        paddingVertical: 16,
        borderBottomWidth: index < cycleHistoryList.length - 1 ? 1 : 0,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      activeOpacity={0.7}
      accessibilityLabel={`Döngü ${item.start} ile ${item.end} arası, döngü ${item.cycleLength} gün, adet ${item.periodLength} gün, detay için dokun`}
      accessibilityRole="button"
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1F2937' }}>
          {item.start} – {item.end}
        </Text>
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
          Döngü: {item.cycleLength} gün • Adet: {item.periodLength} gün
        </Text>
          </View>
      <Text style={{ fontSize: 18, color: '#9CA3AF', marginLeft: 12 }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9FB' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
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
            borderRadius: 20,
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
                  accessibilityLabel={`${labels[option]} filtresi${isActive ? ', seçili' : ''}`}
                  accessibilityRole="button"
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
            
            {/* Filtre İkonu - Aktif Gösterge ile */}
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={`Filtreler${hasActiveFilters ? ', aktif filtreler var' : ''}`}
              accessibilityRole="button"
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
              {hasActiveFilters && (
                    <View 
                      style={{ 
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#E94FA1',
                  }}
                />
              )}
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
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
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
              
              {selectedPeriods.length > 0 && (
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
                    Seçili {selectedPeriods.length}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedPeriods([])}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
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
            {/* KPI Kartları (4+2 grid) */}
            <View style={{ marginBottom: 16 }}>
              {/* Row 1 */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 18, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                accessibilityLabel={`Ortalama Döngü: ${stats.avgCycleLength > 0 ? stats.avgCycleLength + ' gün' : 'veri yok'}`}
                accessibilityRole="text"
                >
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: stats.avgCycleLength > 0 ? '#E94FA1' : '#9CA3AF' }} numberOfLines={1}>
                    {stats.avgCycleLength > 0 ? stats.avgCycleLength : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>Ortalama Döngü</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>gün</Text>
                </View>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 18, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                accessibilityLabel={`Adet Süresi: ${stats.avgPeriodLength > 0 ? stats.avgPeriodLength + ' gün' : 'veri yok'}`}
                accessibilityRole="text"
                >
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: stats.avgPeriodLength > 0 ? '#E94FA1' : '#9CA3AF' }} numberOfLines={1}>
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
                  borderRadius: 18, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                accessibilityLabel={`Takip Edilen: ${stats.totalCycles > 0 ? stats.totalCycles + ' döngü' : 'veri yok'}`}
                accessibilityRole="text"
                >
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: stats.totalCycles > 0 ? '#E94FA1' : '#9CA3AF' }} numberOfLines={1}>
                    {stats.totalCycles > 0 ? stats.totalCycles : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>Takip Edilen</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>döngü</Text>
                </View>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 18, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                accessibilityLabel={`Son Döngü: ${stats.lastCycleLength ? stats.lastCycleLength + ' gün' : 'veri yok'}`}
                accessibilityRole="text"
                >
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: stats.lastCycleLength ? '#E94FA1' : '#9CA3AF' }} numberOfLines={1}>
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
                  borderRadius: 18, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                accessibilityLabel={`En Kısa Uzun: ${minMaxCycles.min > 0 ? minMaxCycles.min + ' ile ' + minMaxCycles.max + ' gün arası' : 'veri yok'}`}
                accessibilityRole="text"
                >
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: minMaxCycles.min > 0 ? '#E94FA1' : '#9CA3AF' }} numberOfLines={1}>
                    {minMaxCycles.min > 0 ? `${minMaxCycles.min}–${minMaxCycles.max}` : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>En Kısa/Uzun</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>gün</Text>
                </View>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#FFF', 
                  borderRadius: 18, 
                  padding: 16, 
                  minHeight: 95, 
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                accessibilityLabel={`Ortalama Semptom: ${avgSymptoms > 0 ? avgSymptoms + ' semptom döngü başına' : 'veri yok'}`}
                accessibilityRole="text"
                >
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: avgSymptoms > 0 ? '#E94FA1' : '#9CA3AF' }} numberOfLines={1}>
                    {avgSymptoms > 0 ? avgSymptoms : '—'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>Ort. Semptom</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>/ döngü</Text>
                </View>
              </View>
            </View>

            {/* Semptom Dağılımı - Liste + İlerleme Barı */}
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
              overflow: 'hidden',
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>
                Semptom Dağılımı ✨
              </Text>
              <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                En sık 5 semptom, yüzde ve adet
              </Text>
              
              {topSymptoms.length > 0 ? (
                <>
                  <FlatList
                    data={topSymptoms}
                    renderItem={renderSymptomItem}
                    keyExtractor={(item) => item.symptom}
                    scrollEnabled={false}
                    removeClippedSubviews={true}
                  />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 12, fontStyle: 'italic' }}>
                    En sık: {topSymptoms[0].label} (%{topSymptoms[0].percentage})
                  </Text>
                </>
              ) : (
                <View style={{
                  padding: 20,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                    Semptom kaydı bulunamadı. Günlükten semptom eklediğinde burada görünecek. 💡
                      </Text>
                </View>
              )}
          </View>

            {/* Ruh Hali Dağılımı - Liste + Mini Barlar */}
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
              overflow: 'hidden',
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>
                Ruh Hâli Dağılımı 🎨
        </Text>
              <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                Seçili aralıktaki ruh hâli kayıtları
              </Text>
              
              {moodDistribution.total === 0 ? (
                <View style={{
                  padding: 20,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                    Ruh hâli kaydı bulunamadı.
                  </Text>
                </View>
              ) : moodDistribution.total === 1 ? (
                <View style={{
                  padding: 16,
                  backgroundColor: '#F0FDF4',
                  borderRadius: 12,
                }}>
                  <Text style={{ fontSize: 14, color: '#1F2937', textAlign: 'center', marginBottom: 4 }}>
                    Bu aralıkta 1 kayıt var: <Text style={{ fontWeight: 'bold' }}>{moodDistribution.moods[0].label}</Text> 🎉
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                    Daha çok günlük girdisiyle dağılım netleşir.
                  </Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={moodDistribution.moods}
                    renderItem={renderMoodItem}
                    keyExtractor={(item) => item.mood}
                    scrollEnabled={false}
                    removeClippedSubviews={true}
                  />
                  <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 16, textAlign: 'center' }}>
                    ⚠️ Bu bilgiler geneldir; tıbbî tavsiye değildir.
                  </Text>
                </>
              )}
            </View>

            {/* Döngü Geçmişi 📅 */}
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
              overflow: 'hidden',
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
                Döngü Geçmişi 📅
              </Text>
              
              {cycleHistoryList.length > 0 ? (
                <FlatList
                  data={cycleHistoryList}
                  renderItem={renderCycleHistoryItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  removeClippedSubviews={true}
                />
              ) : (
                <View style={{
                  padding: 20,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 4 }}>
                    Bu aralık için veri yok.
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                    Farklı bir zaman aralığı seçebilirsin.
                  </Text>
                </View>
              )}
            </View>

            {/* Kişisel Öneriler 🌸 */}
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
                Döngülerinizi takip ettikçe doğruluk artacaktır. Daha fazla veri gerekiyor…
              </Text>
              {stats.totalCycles >= 3 ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#E94FA1', marginRight: 8 }}>
                      %{stats.predictionAccuracy}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <ProgressBar percentage={stats.predictionAccuracy} height={8} />
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
    </SafeAreaView>
  );
}