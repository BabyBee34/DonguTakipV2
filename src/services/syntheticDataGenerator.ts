/**
 * Sentetik Veri Üretici - AI Eğitimi İçin
 * 
 * @adet.md dosyasındaki bilimsel bilgileri kullanarak
 * gerçekçi adet döngüsü verileri üretir.
 */

import { DailyLog, PeriodSpan, CyclePrefs, Symptom, Mood } from '../types';

// Adet döngüsü fazları ve özellikleri
interface CyclePhase {
  name: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  duration: { min: number; max: number; avg: number };
  symptoms: Array<{ symptom: Symptom; probability: number; severity: { min: number; max: number } }>;
  moods: Array<{ mood: Mood; probability: number }>;
  energyLevel: { min: number; max: number };
}

// Faz tanımları (@adet.md'den)
const CYCLE_PHASES: CyclePhase[] = [
  {
    name: 'menstrual',
    duration: { min: 3, max: 7, avg: 5 },
    symptoms: [
      { symptom: 'cramp', probability: 0.8, severity: { min: 2, max: 3 } },
      { symptom: 'lowEnergy', probability: 0.7, severity: { min: 1, max: 3 } },
      { symptom: 'backPain', probability: 0.6, severity: { min: 1, max: 2 } },
      { symptom: 'bloating', probability: 0.5, severity: { min: 1, max: 2 } },
      { symptom: 'headache', probability: 0.4, severity: { min: 1, max: 2 } },
      { symptom: 'nausea', probability: 0.3, severity: { min: 1, max: 2 } },
    ],
    moods: [
      { mood: 'tired', probability: 0.6 },
      { mood: 'neutral', probability: 0.3 },
      { mood: 'sad', probability: 0.2 },
      { mood: 'anxious', probability: 0.1 },
    ],
    energyLevel: { min: 0.2, max: 0.5 }
  },
  {
    name: 'follicular',
    duration: { min: 10, max: 16, avg: 13 },
    symptoms: [
      { symptom: 'lowEnergy', probability: 0.2, severity: { min: 1, max: 2 } },
      { symptom: 'acne', probability: 0.3, severity: { min: 1, max: 2 } },
    ],
    moods: [
      { mood: 'happy', probability: 0.4 },
      { mood: 'calm', probability: 0.3 },
      { mood: 'neutral', probability: 0.2 },
      { mood: 'ecstatic', probability: 0.1 },
    ],
    energyLevel: { min: 0.6, max: 0.9 }
  },
  {
    name: 'ovulation',
    duration: { min: 1, max: 2, avg: 1 },
    symptoms: [
      { symptom: 'cramp', probability: 0.4, severity: { min: 1, max: 2 } },
      { symptom: 'discharge', probability: 0.7, severity: { min: 1, max: 2 } },
      { symptom: 'breastTenderness', probability: 0.5, severity: { min: 1, max: 2 } },
    ],
    moods: [
      { mood: 'happy', probability: 0.5 },
      { mood: 'ecstatic', probability: 0.3 },
      { mood: 'calm', probability: 0.2 },
    ],
    energyLevel: { min: 0.8, max: 1.0 }
  },
  {
    name: 'luteal',
    duration: { min: 9, max: 16, avg: 12 },
    symptoms: [
      { symptom: 'bloating', probability: 0.7, severity: { min: 1, max: 3 } },
      { symptom: 'breastTenderness', probability: 0.6, severity: { min: 1, max: 3 } },
      { symptom: 'mood', probability: 0.8, severity: { min: 1, max: 3 } },
      { symptom: 'cravings', probability: 0.6, severity: { min: 1, max: 2 } },
      { symptom: 'acne', probability: 0.5, severity: { min: 1, max: 2 } },
      { symptom: 'lowEnergy', probability: 0.4, severity: { min: 1, max: 2 } },
      { symptom: 'headache', probability: 0.3, severity: { min: 1, max: 2 } },
      { symptom: 'anxious', probability: 0.5, severity: { min: 1, max: 2 } },
      { symptom: 'irritable', probability: 0.4, severity: { min: 1, max: 2 } },
    ],
    moods: [
      { mood: 'anxious', probability: 0.3 },
      { mood: 'irritable', probability: 0.3 },
      { mood: 'tired', probability: 0.2 },
      { mood: 'neutral', probability: 0.1 },
      { mood: 'sad', probability: 0.1 },
    ],
    energyLevel: { min: 0.3, max: 0.7 }
  }
];

// Rastgele sayı üretici
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(choices: T[], probabilities: number[]): T {
  const rand = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < choices.length; i++) {
    cumulative += probabilities[i];
    if (rand <= cumulative) {
      return choices[i];
    }
  }
  
  return choices[choices.length - 1];
}

// Faz belirleme
function determinePhase(dayInCycle: number, cycleLength: number): CyclePhase {
  const avgPeriodLength = 5;
  const avgLutealLength = 12;
  const avgOvulationDay = cycleLength - avgLutealLength;
  
  if (dayInCycle <= avgPeriodLength) {
    return CYCLE_PHASES.find(p => p.name === 'menstrual')!;
  } else if (dayInCycle <= avgOvulationDay - 1) {
    return CYCLE_PHASES.find(p => p.name === 'follicular')!;
  } else if (dayInCycle <= avgOvulationDay + 1) {
    return CYCLE_PHASES.find(p => p.name === 'ovulation')!;
  } else {
    return CYCLE_PHASES.find(p => p.name === 'luteal')!;
  }
}

// Tek günlük log üret
function generateDailyLog(
  date: string,
  dayInCycle: number,
  cycleLength: number,
  isActualPeriod: boolean = false
): DailyLog {
  const phase = determinePhase(dayInCycle, cycleLength);
  
  // Semptomlar üret
  const symptoms: Array<{ id: Symptom; severity: number }> = [];
  
  if (isActualPeriod) {
    // Gerçek adet günleri için zorunlu semptomlar
    symptoms.push({ id: 'cramp', severity: randomBetween(2, 3) });
    if (Math.random() < 0.7) {
      symptoms.push({ id: 'lowEnergy', severity: randomBetween(1, 3) });
    }
  } else {
    // Faz bazlı semptomlar
    phase.symptoms.forEach(({ symptom, probability, severity }) => {
      if (Math.random() < probability) {
        const severityLevel = Math.floor(randomBetween(severity.min, severity.max + 1));
        symptoms.push({ id: symptom, severity: severityLevel });
      }
    });
  }
  
  // Mood üret
  const moodChoices = phase.moods.map(m => m.mood);
  const moodProbabilities = phase.moods.map(m => m.probability);
  const mood = randomChoice(moodChoices, moodProbabilities);
  
  // Alışkanlıklar (rastgele)
  const allHabits = ['water', 'walk', 'rest', 'shower'];
  const habits = allHabits.filter(() => Math.random() < 0.4);
  
  // Akıntı (sadece adet günleri)
  let flow: 'light' | 'medium' | 'heavy' | null = null;
  if (isActualPeriod) {
    const flowRand = Math.random();
    if (flowRand < 0.3) flow = 'light';
    else if (flowRand < 0.7) flow = 'medium';
    else flow = 'heavy';
  }
  
  return {
    id: `synthetic-${date}`,
    date,
    symptoms,
    mood,
    habits,
    flow,
    note: ''
  };
}

// Döngü üret
export function generateSyntheticCycle(
  startDate: string,
  cycleLength: number,
  periodLength: number,
  userId: string = 'synthetic-user'
): { periods: PeriodSpan[], logs: DailyLog[] } {
  const periods: PeriodSpan[] = [];
  const logs: DailyLog[] = [];
  
  // Adet dönemi
  const periodStart = new Date(startDate);
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + periodLength - 1);
  
  periods.push({
    id: `period-${startDate}`,
    start: startDate,
    end: periodEnd.toISOString().split('T')[0],
    periodLengthDays: periodLength
  });
  
  // Tüm döngü için loglar üret
  for (let day = 0; day < cycleLength; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const isActualPeriod = day < periodLength;
    const dayInCycle = day + 1;
    
    const log = generateDailyLog(dateStr, dayInCycle, cycleLength, isActualPeriod);
    logs.push(log);
  }
  
  return { periods, logs };
}

// Çoklu kullanıcı için sentetik veri üret
export function generateMultipleUsers(
  userCount: number = 10000,
  cyclesPerUser: number = 6
): { users: Array<{ periods: PeriodSpan[], logs: DailyLog[], prefs: CyclePrefs }> } {
  const users = [];
  
  for (let i = 0; i < userCount; i++) {
    const userId = `synthetic-user-${i}`;
    const allPeriods: PeriodSpan[] = [];
    const allLogs: DailyLog[] = [];
    
    // Her kullanıcı için 6 döngü üret
    let currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - cyclesPerUser);
    
    for (let cycle = 0; cycle < cyclesPerUser; cycle++) {
      // Döngü uzunluğu varyasyonu (21-35 gün)
      const cycleLength = Math.floor(randomBetween(21, 36));
      const periodLength = Math.floor(randomBetween(3, 8));
      
      const startDate = currentDate.toISOString().split('T')[0];
      const { periods, logs } = generateSyntheticCycle(startDate, cycleLength, periodLength, userId);
      
      allPeriods.push(...periods);
      allLogs.push(...logs);
      
      // Sonraki döngü için tarih güncelle
      currentDate.setDate(currentDate.getDate() + cycleLength);
    }
    
    // Kullanıcı tercihleri
    const avgCycleLength = Math.round(allPeriods.reduce((sum, p) => sum + p.periodLengthDays!, 0) / allPeriods.length);
    const avgPeriodLength = Math.round(allPeriods.reduce((sum, p) => sum + (p.periodLengthDays || 5), 0) / allPeriods.length);
    
    const prefs: CyclePrefs = {
      avgCycleDays: avgCycleLength,
      avgPeriodDays: avgPeriodLength,
      lastPeriodStart: allPeriods[allPeriods.length - 1]?.start || startDate,
      notificationSettings: {
        upcomingPeriodDays: Math.floor(randomBetween(1, 4)),
        dailyLogReminderHour: Math.floor(randomBetween(18, 22)),
        waterReminderFrequency: randomChoice(['low', 'balanced', 'high'], [0.3, 0.5, 0.2])
      }
    };
    
    users.push({
      periods: allPeriods,
      logs: allLogs,
      prefs
    });
  }
  
  return { users };
}

// Eğitim için veri formatına dönüştür
export function formatForTraining(users: Array<{ periods: PeriodSpan[], logs: DailyLog[], prefs: CyclePrefs }>): {
  features: number[][];
  targets: {
    nextPeriod: string[];
    ovulation: string[];
    fertileWindow: { start: string[], end: string[] };
    phase: string[];
  };
} {
  const features: number[][] = [];
  const targets = {
    nextPeriod: [] as string[],
    ovulation: [] as string[],
    fertileWindow: { start: [] as string[], end: [] as string[] },
    phase: [] as string[]
  };
  
  users.forEach(user => {
    const { periods, logs, prefs } = user;
    
    // Her gün için feature vector oluştur
    logs.forEach((log, index) => {
      const logDate = new Date(log.date);
      
      // Basit feature extraction (aiModel.ts'deki gibi)
      const dayInCycle = (index % prefs.avgCycleDays) + 1;
      const phase = determinePhase(dayInCycle, prefs.avgCycleDays);
      
      const featureVector = [
        dayInCycle / prefs.avgCycleDays, // Normalized day
        phase.name === 'menstrual' ? 1 : 0,
        phase.name === 'follicular' ? 1 : 0,
        phase.name === 'ovulation' ? 1 : 0,
        phase.name === 'luteal' ? 1 : 0,
        // Semptom features
        ...(['cramp', 'headache', 'backPain', 'jointPain', 'bloating', 'nausea', 
             'constipation', 'diarrhea', 'acne', 'breastTenderness', 'discharge',
             'lowEnergy', 'sleepy', 'insomnia', 'appetite', 'cravings', 
             'anxious', 'irritable', 'focusIssues'] as Symptom[]).map(symptom => 
          log.symptoms.some(s => s.id === symptom) ? 1 : 0
        ),
        // Mood features
        ...(['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry'] as Mood[]).map(mood => 
          log.mood === mood ? 1 : 0
        ),
        // Flow features
        log.flow === 'light' ? 1 : 0,
        log.flow === 'medium' ? 1 : 0,
        log.flow === 'heavy' ? 1 : 0,
        // Cycle stats
        prefs.avgCycleDays / 35.0,
        prefs.avgPeriodDays / 7.0
      ];
      
      features.push(featureVector);
      
      // Target hesaplama (basit)
      const nextPeriodDate = new Date(logDate);
      nextPeriodDate.setDate(nextPeriodDate.getDate() + (prefs.avgCycleDays - dayInCycle));
      
      const ovulationDate = new Date(nextPeriodDate);
      ovulationDate.setDate(ovulationDate.getDate() - 14);
      
      targets.nextPeriod.push(nextPeriodDate.toISOString().split('T')[0]);
      targets.ovulation.push(ovulationDate.toISOString().split('T')[0]);
      
      const fertileStart = new Date(ovulationDate);
      fertileStart.setDate(fertileStart.getDate() - 5);
      const fertileEnd = new Date(ovulationDate);
      fertileEnd.setDate(fertileEnd.getDate() + 1);
      
      targets.fertileWindow.start.push(fertileStart.toISOString().split('T')[0]);
      targets.fertileWindow.end.push(fertileEnd.toISOString().split('T')[0]);
      targets.phase.push(phase.name);
    });
  });
  
  return { features, targets };
}

// Ana export fonksiyonu
export function generateTrainingData(
  userCount: number = 10000,
  cyclesPerUser: number = 6
): {
  users: Array<{ periods: PeriodSpan[], logs: DailyLog[], prefs: CyclePrefs }>;
  trainingData: { features: number[][], targets: any };
} {
  const { users } = generateMultipleUsers(userCount, cyclesPerUser);
  const trainingData = formatForTraining(users);
  
  return { users, trainingData };
}
