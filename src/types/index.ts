export type Mood =
  | 'ecstatic'
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'sad'
  | 'angry'
  | 'anxious'
  | 'tired'
  | 'irritable';

export type Symptom =
  | 'cramp'
  | 'headache'
  | 'backPain'
  | 'jointPain'
  | 'bloating'
  | 'nausea'
  | 'constipation'
  | 'diarrhea'
  | 'acne'
  | 'breastTenderness'
  | 'discharge'
  | 'lowEnergy'
  | 'sleepy'
  | 'insomnia'
  | 'appetite'
  | 'cravings'
  | 'anxious'
  | 'irritable'
  | 'focusIssues';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

// Habit keys (alışkanlıklar)
export type HabitKey = 'water' | 'walk' | 'rest' | 'shower';

export interface CyclePrefs {
  avgPeriodDays: number;
  avgCycleDays: number;
  lastPeriodStart: string;
}

export interface DailyLog {
  id: string;
  date: string;
  mood?: Mood;
  symptoms: { id: string; severity: number }[];
  habits?: string[];
  flow?: 'light' | 'medium' | 'heavy';
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PeriodSpan {
  id: string;
  start: string;
  end?: string;
  cycleLengthDays?: number;
  periodLengthDays?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  frequency?: 'low' | 'balanced' | 'high';
  reminderTime: { hour: number; minute: number };
  upcomingPeriodDays: 0 | 1 | 2 | 3 | 5 | 7;
  periodReminder?: boolean;
  waterReminder?: boolean;
  dailyLogReminder?: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  pinLock: boolean;
  pinCode?: string;
  biometricEnabled: boolean;
}

export interface AppState {
  prefs: CyclePrefs;
  logs: DailyLog[];
  periods: PeriodSpan[];
  notifications: NotificationSettings;
  settings: AppSettings;
  onboardingCompleted: boolean;
  setupCompleted: boolean;
}

export interface DayPrediction {
  date: string;
  phase: CyclePhase;
  isMenstrual: boolean;
  isPredictedMenstrual: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isToday: boolean;
  hasLog: boolean;
}

export interface TipCard {
  id: string;
  symptom: Symptom;
  title: string;
  content: string;
  source?: string;
}

export interface PhaseInfo {
  phase: CyclePhase;
  title: string;
  description: string;
  hormonInfo: string;
  commonSymptoms: Symptom[];
  tips: string[];
  dayRange: string;
}

// Prediction & Statistics Types
export interface PredictionInput {
  lastPeriodStart: string;
  avgCycleDays: number;
  avgPeriodDays: number;
  periods: PeriodSpan[];
}

export interface CycleStats {
  avgCycleLength: number;
  avgPeriodLength: number;
  totalCycles: number;
  predictionAccuracy: number;
  lastCycleLength?: number;
  cycleVariability: number;
}

export interface TipSuggestion {
  title: string;
  content: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MoodTrend {
  date: string;
  mood: Mood;
  moodScore: number;
}

