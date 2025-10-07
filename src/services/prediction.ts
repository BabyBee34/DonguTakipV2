import { DayPrediction, CyclePhase, PeriodSpan } from '../types';
import { addDays, daysBetween, isSameDay, isToday } from '../utils/date';

export function calculateOvulationDay(lastPeriodStart: string, avgCycleDays: number): string { return addDays(lastPeriodStart, avgCycleDays - 14); }
function determinePhase(date: string, lastPeriodStart: string, avgCycleDays: number): CyclePhase {
  const daysSinceStart = daysBetween(lastPeriodStart, date);
  const cycleDay = (daysSinceStart % avgCycleDays) + 1;
  if (cycleDay >= 1 && cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}
function isActualPeriod(date: string, periods: PeriodSpan[], avgPeriodDays: number): boolean { 
  return periods.some(p => {
    if (p.end) {
      // Period bitmişse, başlangıç ve bitiş arasındaki günler
      return date >= p.start && date <= p.end;
    } else {
      // Period aktifse, başlangıçtan itibaren avgPeriodDays kadar gün
      const periodEnd = addDays(p.start, avgPeriodDays - 1);
      return date >= p.start && date <= periodEnd;
    }
  });
}
function isInRange(date: string, start: string, end: string): boolean { return date >= start && date <= end; }
function isPredictedPeriod(date: string, nextStart: string, avgPeriodDays: number): boolean { return isInRange(date, nextStart, addDays(nextStart, avgPeriodDays - 1)); }

export function predictCycle(
  input: { lastPeriodStart: string; avgCycleDays: number; avgPeriodDays: number; periods: PeriodSpan[]; logsDates?: string[]; },
  startDate: string,
  endDate: string,
): DayPrediction[] {
  const { lastPeriodStart, avgCycleDays, avgPeriodDays, periods, logsDates = [] } = input;
  const preds: DayPrediction[] = [];
  const ovulationDay = calculateOvulationDay(lastPeriodStart, avgCycleDays);
  const nextPeriodStart = addDays(lastPeriodStart, avgCycleDays);
  const fertileStart = addDays(ovulationDay, -5); const fertileEnd = addDays(ovulationDay, 1);
  let d = startDate;
  while (d <= endDate) {
    preds.push({
      date: d,
      phase: determinePhase(d, lastPeriodStart, avgCycleDays),
      isMenstrual: isActualPeriod(d, periods, avgPeriodDays),
      isPredictedMenstrual: isPredictedPeriod(d, nextPeriodStart, avgPeriodDays),
      isFertile: isInRange(d, fertileStart, fertileEnd),
      isOvulation: isSameDay(d, ovulationDay),
      isToday: isToday(d),
      hasLog: logsDates.includes(d),
    });
    d = addDays(d, 1);
  }
  return preds;
}

