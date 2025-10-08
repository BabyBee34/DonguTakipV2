import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { calculateCycleStats, calculateSymptomFrequency } from '../services/statistics';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTranslation } from 'react-i18next';

export default function ReportsScreen({ navigation }: any) {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const { t } = useTranslation();
  const periods = useSelector((state: RootState) => state.periods);
  const logs = useSelector((state: RootState) => state.logs);
  const [isLoading, setIsLoading] = useState(true);

  const stats = useMemo(() => calculateCycleStats(periods), [periods]);
  const symptomFreq = useMemo(() => calculateSymptomFrequency(logs), [logs]);

  const topSymptoms = useMemo(() => {
    const entries = Object.entries(symptomFreq);
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, freq]) => ({ symptom, freq }));
  }, [symptomFreq]);

  const cycleLengths = useMemo(() => {
    return periods
      .filter(p => p.cycleLengthDays)
      .slice(-6)
      .map((p, idx) => ({
        x: `D${idx + 1}`,
        y: p.cycleLengthDays || 0,
      }));
  }, [periods]);

  const hasSufficientData = periods.filter(p => p.end).length >= 2;

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [periods, logs]);

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
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}>
      <LinearGradient colors={[colors.bgSoft, colors.bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: borderRadius.card, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.card }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.ink }}>{t('reports.title')}</Text>
      </LinearGradient>

      {isLoading ? (
        /* Loading Skeletons */
        <>
          {/* Özet Kartları Skeleton */}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
            <View style={{ flex: 1 }}>
              <SkeletonLoader type="rect" width="100%" height={120} />
            </View>
            <View style={{ flex: 1 }}>
              <SkeletonLoader type="rect" width="100%" height={120} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ flex: 1 }}>
              <SkeletonLoader type="rect" width="100%" height={120} />
            </View>
            <View style={{ flex: 1 }}>
              <SkeletonLoader type="rect" width="100%" height={120} />
            </View>
          </View>

          {/* Grafik Skeleton */}
          <View style={{ marginBottom: spacing.lg }}>
            <SkeletonLoader type="rect" width="100%" height={250} />
          </View>

          {/* Semptom Skeleton */}
          <View style={{ marginBottom: spacing.lg }}>
            <SkeletonLoader type="rect" width="100%" height={200} />
          </View>
        </>
      ) : (
        <>
          {/* Özet Kartları - Subtle Gradients */}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
            <Card 
              style={{ flex: 1, alignItems: 'center' }} 
              gradient={[colors.bg, colors.bgSoft]}
              gradientDirection={{ start: { x: 0, y: 0 }, end: { x: 0, y: 1 } }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary }}>{stats.avgCycleLength}</Text>
              <Text style={{ fontSize: 14, color: colors.inkSoft, marginTop: spacing.xs }}>{t('reports.stats.avgCycle')}</Text>
              <Text style={{ fontSize: 12, color: colors.inkLight }}>{t('reports.stats.days')}</Text>
            </Card>
            <Card 
              style={{ flex: 1, alignItems: 'center' }} 
              gradient={[colors.bg, colors.bgSoft]}
              gradientDirection={{ start: { x: 0, y: 0 }, end: { x: 0, y: 1 } }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary }}>{stats.avgPeriodLength}</Text>
              <Text style={{ fontSize: 14, color: colors.inkSoft, marginTop: spacing.xs }}>{t('reports.stats.avgPeriod')}</Text>
              <Text style={{ fontSize: 12, color: colors.inkLight }}>{t('reports.stats.days')}</Text>
            </Card>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
            <Card 
              style={{ flex: 1, alignItems: 'center' }} 
              gradient={[colors.bg, colors.bgSoft]}
              gradientDirection={{ start: { x: 0, y: 0 }, end: { x: 0, y: 1 } }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary }}>{stats.totalCycles}</Text>
              <Text style={{ fontSize: 14, color: colors.inkSoft, marginTop: spacing.xs }}>{t('reports.stats.totalCycles')}</Text>
              <Text style={{ fontSize: 12, color: colors.inkLight }}>{t('reports.stats.records')}</Text>
            </Card>
            <Card 
              style={{ flex: 1, alignItems: 'center' }} 
              gradient={[colors.bg, colors.bgSoft]}
              gradientDirection={{ start: { x: 0, y: 0 }, end: { x: 0, y: 1 } }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary }}>{stats.lastCycleLength || '-'}</Text>
              <Text style={{ fontSize: 14, color: colors.inkSoft, marginTop: spacing.xs }}>{t('reports.stats.lastCycle')}</Text>
              <Text style={{ fontSize: 12, color: colors.inkLight }}>{t('reports.stats.days')}</Text>
            </Card>
          </View>

      {/* Döngü Geçmişi Grafiği */}
      {cycleLengths.length > 0 && (
        <Card backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.md }}>{t('reports.charts.cycleHistory')}</Text>
          <View style={{ height: 220, justifyContent: 'flex-end', paddingTop: spacing.lg }} accessibilityRole="summary" accessibilityLabel={t('reports.charts.cycleHistory')}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 180 }}>
              {cycleLengths.map((item, idx) => {
                const maxValue = Math.max(...cycleLengths.map(c => c.y), 35);
                const heightPercent = (item.y / maxValue) * 100;
                return (
                  <View key={idx} style={{ flex: 1, alignItems: 'center', marginHorizontal: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink, marginBottom: 4 }}>{item.y}</Text>
                    <View 
                      style={{ 
                        width: '100%', 
                        maxWidth: 40,
                        height: `${heightPercent}%`, 
                        backgroundColor: colors.primary, 
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        minHeight: 20
                      }} 
                    />
                    <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 6 }}>{item.x}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Card>
      )}

      {/* En Sık Semptomlar */}
      {topSymptoms.length > 0 && (
        <Card backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.md }}>{t('reports.charts.topSymptoms')}</Text>
          {topSymptoms.map((item, idx) => (
            <View key={idx} style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: 14, color: colors.ink, marginBottom: spacing.xs }}>{item.symptom}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{ flex: 1, height: 24, backgroundColor: colors.bgGray, borderRadius: 12 }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${item.freq}%`,
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                    }}
                    accessibilityRole="progressbar"
                    accessibilityLabel={`${item.symptom}`}
                    accessibilityValue={{ now: item.freq, min: 0, max: 100 } as any}
                  />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft, minWidth: 40 }}>{item.freq}%</Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Ruh Hali Trendi */}
      {logs.filter(l => l.mood).length >= 5 && (
        <Card backgroundColor={colors.bgSoft} style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.md }}>{t('reports.charts.moodTrend')}</Text>
          <View style={{ height: 200, paddingTop: spacing.md }}>
            {(() => {
              const moodData = logs
                .filter(l => l.mood)
                .slice(-7)
                .map((l, idx) => ({ x: idx + 1, y: getMoodScore(l.mood!) }));
              
              const maxScore = 10;
              const minScore = 0;
              const range = maxScore - minScore;
              
              return (
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingHorizontal: spacing.sm }}>
                    {moodData.map((point, idx) => {
                      const heightPercent = ((point.y - minScore) / range) * 100;
                      return (
                        <View key={idx} style={{ flex: 1, alignItems: 'center', position: 'relative', height: '100%', justifyContent: 'flex-end' }}>
                          <View 
                            style={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: 6, 
                              backgroundColor: colors.lilac,
                              position: 'absolute',
                              bottom: `${heightPercent}%`,
                              zIndex: 2
                            }} 
                          />
                          {idx < moodData.length - 1 && (
                            <View 
                              style={{
                                position: 'absolute',
                                bottom: `${heightPercent}%`,
                                left: '50%',
                                width: '100%',
                                height: 2,
                                backgroundColor: colors.lilac,
                                transform: [
                                  { 
                                    rotate: `${Math.atan2(
                                      (moodData[idx + 1].y - point.y) * 1.5,
                                      100 / moodData.length
                                    )}rad` 
                                  }
                                ],
                                zIndex: 1
                              }}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md }}>
                    {moodData.map((point, idx) => (
                      <Text key={idx} style={{ fontSize: 10, color: colors.inkSoft, flex: 1, textAlign: 'center' }}>
                        {point.x}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })()}
          </View>
        </Card>
      )}

      {/* Tahmin Doğruluğu */}
      <Card backgroundColor={colors.primary200}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>{t('reports.prediction.title')}</Text>
        <Text style={{ fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: spacing.sm }}>
          {t('reports.prediction.description')}
        </Text>
        {stats.totalCycles >= 3 ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary, marginRight: spacing.sm }}>
                %{stats.predictionAccuracy}
              </Text>
              <Text style={{ fontSize: 14, color: colors.inkSoft }}>
                %
              </Text>
            </View>
            <View style={{ marginTop: spacing.md, height: 8, backgroundColor: colors.bgGray, borderRadius: 4, overflow: 'hidden' }}>
              <View 
                style={{ 
                  height: '100%', 
                  width: `${stats.predictionAccuracy}%`, 
                  backgroundColor: colors.primary 
                }} 
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.inkLight, marginTop: spacing.xs }}>
              {t('reports.prediction.calculating', { count: 3 })}
            </Text>
            
            {/* Açıklama - İnfo Box */}
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
  );
}

// Mood'u sayısal skora çevir
function getMoodScore(mood: string): number {
  const scores: Record<string, number> = {
    ecstatic: 9,
    happy: 7,
    calm: 6,
    neutral: 5,
    tired: 4,
    sad: 3,
    anxious: 3,
    irritable: 2,
    angry: 1,
  };
  return scores[mood] || 5;
}

