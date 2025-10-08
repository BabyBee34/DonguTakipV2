import { DailyLog, PeriodSpan } from '../types';
import { format, subDays, isAfter, isBefore, parseISO, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

export type TimeRange = '7days' | '1month' | '3months' | 'all';

// Zaman aralığına göre logları filtrele
export function filterByTimeRange(logs: DailyLog[], range: TimeRange): DailyLog[] {
  const now = new Date();
  let startDate: Date;

  switch (range) {
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
}

// Sadece adet günlerini filtrele
export function filterByMenstruationOnly(logs: DailyLog[], isOn: boolean): DailyLog[] {
  if (!isOn) return logs;
  
  return logs.filter(log => {
    // Adet günü kontrolü - flow değerine göre
    return log.flow === 'heavy' || log.flow === 'medium' || log.flow === 'light';
  });
}

// Seçili dönemlere göre logları filtrele
export function filterBySelectedPeriods(logs: DailyLog[], periods: PeriodSpan[]): DailyLog[] {
  if (periods.length === 0) return logs;

  return logs.filter(log => {
    const logDate = parseISO(log.date);
    
    return periods.some(period => {
      const startDate = parseISO(period.start);
      const endDate = period.end ? parseISO(period.end) : new Date();
      
      return isWithinInterval(logDate, { start: startDate, end: endDate });
    });
  });
}

// Zaman aralığına göre dönemleri filtrele
export function filterPeriodsByTimeRange(periods: PeriodSpan[], range: TimeRange): PeriodSpan[] {
  const now = new Date();
  let startDate: Date;

  switch (range) {
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
}

// Seçili dönemlere göre dönemleri filtrele
export function filterPeriodsBySelectedPeriods(periods: PeriodSpan[], selectedPeriods: PeriodSpan[]): PeriodSpan[] {
  if (selectedPeriods.length === 0) return periods;

  return periods.filter(period => {
    return selectedPeriods.some(selectedPeriod => {
      return selectedPeriod.id === period.id;
    });
  });
}

// Tüm filtreleri uygula
export function applyAllFilters(
  logs: DailyLog[],
  periods: PeriodSpan[],
  timeRange: TimeRange,
  menstruationOnly: boolean,
  selectedPeriods: PeriodSpan[]
): { filteredLogs: DailyLog[]; filteredPeriods: PeriodSpan[] } {
  // Önce zaman aralığına göre filtrele
  let filteredLogs = filterByTimeRange(logs, timeRange);
  let filteredPeriods = filterPeriodsByTimeRange(periods, timeRange);

  // Sadece adet günleri filtresi
  if (menstruationOnly) {
    filteredLogs = filterByMenstruationOnly(filteredLogs, true);
  }

  // Seçili dönemler filtresi
  if (selectedPeriods.length > 0) {
    filteredLogs = filterBySelectedPeriods(filteredLogs, selectedPeriods);
    filteredPeriods = filterPeriodsBySelectedPeriods(filteredPeriods, selectedPeriods);
  }

  return { filteredLogs, filteredPeriods };
}

// Dönem listesi için formatlanmış veri oluştur
export function formatPeriodsForSelection(periods: PeriodSpan[]) {
  return periods
    .filter(p => p.start)
    .sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime())
    .map(p => ({
      id: p.id,
      start: p.start,
      end: p.end || '',
      label: `${format(parseISO(p.start), 'd MMM yyyy', { locale: tr })} – ${p.end ? format(parseISO(p.end), 'd MMM yyyy', { locale: tr }) : 'Devam ediyor'}`,
      cycleLength: p.cycleLengthDays || 0,
      periodLength: p.periodLengthDays || 0,
    }));
}
