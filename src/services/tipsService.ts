import { CyclePhase, PhaseInfo, Symptom } from '../types';
import { getTips } from './knowledgeBase';
import { getTipModelScores, MODEL_WEIGHT as MODEL_SCORE_WEIGHT } from './aiModel';
import { TipRecord } from '../types/ai';

export interface TipSuggestion {
  title: string;
  content: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SuggestionOptions {
  limit?: number;
  phase?: CyclePhase | 'general';
  mood?: string | null;
  includeGeneralFallback?: boolean;
  features?: number[];
}

const DEFAULT_LIMIT = 3;

export async function getSuggestions(
  symptoms: Symptom[],
  options: SuggestionOptions = {}
): Promise<TipSuggestion[]> {
  // Offline: Direkt local suggestions kullan
  return Promise.resolve(getLocalSuggestions(symptoms, options));
}

const mapTipToSuggestion = (tip: TipRecord, tagMatches: number): TipSuggestion => {
  let priority: TipSuggestion['priority'] = 'low';
  if (tagMatches >= 2) {
    priority = 'high';
  } else if (tagMatches === 1) {
    priority = 'medium';
  }

  return {
    title: tip.title,
    content: tip.body,
    source: tip.source ?? 'knowledge-base',
    priority,
  };
};

const computeFeatureBonus = (tip: TipRecord, features: number[], tagMatches: number): number => {
  const moodFeature = features[0] ?? 0;
  const symptomFeature = features[1] ?? 0;
  const habitFeature = features[2] ?? 0;
  const daysToNext = features[3] ?? 0;
  const menstrualFlag = features[4] ?? 0;

  const lowerTags = tip.tags.map((tag) => tag.toLowerCase());

  let bonus = 0;

  if (tip.phase === 'menstrual') {
    bonus += menstrualFlag;
  }
  if (tip.phase === 'luteal') {
    bonus += (1 - daysToNext) * 0.3;
  }
  if (tip.phase === 'follicular') {
    bonus += moodFeature * 0.2;
  }
  if (tip.phase === 'ovulation') {
    bonus += moodFeature * 0.3;
  }

  if (lowerTags.includes('selfcare') || lowerTags.includes('rest') || lowerTags.includes('calm')) {
    bonus += (1 - habitFeature) * 0.2;
  }

  bonus += tagMatches * symptomFeature * 0.5;

  return bonus;
};

const getLocalSuggestions = async (symptoms: Symptom[], options: SuggestionOptions): Promise<TipSuggestion[]> => {
  const { limit = DEFAULT_LIMIT, phase, mood, includeGeneralFallback = true, features = [] } = options;
  const normalizedSymptoms = symptoms.map((symptom) => symptom.toLowerCase());
  const tipsList = getTips();

  let modelScores: number[] | null = null;
  if (features.length > 0) {
    modelScores = await getTipModelScores(features);
    if (modelScores && modelScores.length < tipsList.length) {
      modelScores = [...modelScores, ...new Array(tipsList.length - modelScores.length).fill(0)];
    }
  }

  const ranked = tipsList.map((tip, index) => {
    const tags = tip.tags.map((tag) => tag.toLowerCase());
    const tagMatches = normalizedSymptoms.filter((symptom) => tags.includes(symptom)).length;
    const phaseMatch = phase ? (tip.phase === phase || tip.phase === 'general' ? 1 : 0) : 0;
    const moodMatch = mood && tip.mood ? (tip.mood === mood ? 1 : 0) : 0;
    const generalBoost = tip.phase === 'general' ? 0.2 : 0;
    const featureBonus = computeFeatureBonus(tip, features, tagMatches);
    const modelScore = modelScores && modelScores[index] !== undefined ? modelScores[index] : 0;
    const score = tagMatches * 2 + phaseMatch + moodMatch + generalBoost + featureBonus + modelScore * MODEL_SCORE_WEIGHT;
    return { tip, score, tagMatches };
  });

  ranked.sort((a, b) => b.score - a.score);

  const selected: TipSuggestion[] = [];
  const used = new Set<string>();

  for (const entry of ranked) {
    if (selected.length >= limit) break;
    if (entry.score <= 0 && !includeGeneralFallback) continue;
    if (used.has(entry.tip.id)) continue;
    selected.push(mapTipToSuggestion(entry.tip, entry.tagMatches));
    used.add(entry.tip.id);
  }

  if (selected.length < limit && includeGeneralFallback) {
    const fallback = tipsList.filter((tip) => tip.phase === 'general' && !used.has(tip.id));
    for (const tip of fallback) {
      if (selected.length >= limit) break;
      selected.push(mapTipToSuggestion(tip, 0));
      used.add(tip.id);
    }
  }

  return selected.slice(0, limit);
};


export function getPhaseMotivation(phase: CyclePhase, cycleDay?: number): string {
  const motivations: Record<CyclePhase, string[]> = {
    menstrual: [
      'Bugun kendine nazik ol, dinlenmeye izin ver.',
      'Sicak icecekler ve yavas hareketler sana iyi gelir.',
      'Vucudun guncelleniyor, ritmine guven.',
      'Yumusak yogalar veya nefes egzersizleri dene.'
    ],
    follicular: [
      'Enerjin yukseliyor, yeni hedefler koymak icin guzel bir gun.',
      'Merak ettigin bir seyi ogrenmek icin kisa bir zaman ayir.',
      'Kendini iyi hissettiren bir hareket ekle, kisa bir yuruyus bile olur.',
      'Planlarini gozden gecir, yarataciligin yukseliyor.'
    ],
    ovulation: [
      'Parlamakta haklisin, sosyallesmek icin guzel firsatlar olabilir.',
      'Kendine guvenin yuksek, duygularini paylasmaktan cekinme.',
      'Kisa bir dans molasi veya sevilen bir parca ile enerji topla.',
      'Arkadaslarinla minik bir kutlama planla.'
    ],
    luteal: [
      'Tempoyu biraz dusur, nazik bir rutin olustur.',
      'Magnezyumlu atistirmaliklar ve sicak icecekler seni rahatlatir.',
      'Gerek duydugunda mola ver ve nefes calismasi yap.',
      'Erken uyku ve yumusak hareketler dengeni korur.'
    ],
  };

  const pool = motivations[phase];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getPhaseInfo(phase: CyclePhase): PhaseInfo {
  const data: Record<CyclePhase, PhaseInfo> = {
    menstrual: {
      phase: 'menstrual',
      title: 'Menstrual Faz (Adet Donemi)',
      description: 'Rahim duvari yenileniyor; hafif hareketler ve dinlenme onemli.',
      hormonInfo: 'Estrojen ve progesteron en dusuk seviyede.',
      commonSymptoms: ['cramp', 'headache', 'backPain', 'lowEnergy', 'tired'],
      tips: [
        'Demir iceren besinleri tercih et.',
        'Sicak kompres ile kaslarini rahatlat.',
        'Bol su ic ve yavas hareket et.',
        'Kisa nefes egzersizleri yap.'
      ],
      dayRange: 'Gun 1-5',
    },
    follicular: {
      phase: 'follicular',
      title: 'Folikuler Faz (Enerji Yukseliyor)',
      description: 'Folikuller gelisirken enerji ve yaraticilik artar.',
      hormonInfo: 'Estrojen yukselir, FSH aktif rol oynar.',
      commonSymptoms: [],
      tips: [
        'Yogun egzersizlere bu fazda basla.',
        'Yeni fikirler ve planlar icin beyin firtinasi yap.',
        'Sosyal aktivitelerden destek al.',
        'Bol su ic, guclu hissini koru.'
      ],
      dayRange: 'Gun 6-13',
    },
    ovulation: {
      phase: 'ovulation',
      title: 'Ovulasyon Faz (En Verimli Donem)',
      description: 'Yumurta serbest kalir, enerji ve iletisim gucu artar.',
      hormonInfo: 'LH yukselir, yumurta folikulu terk eder.',
      commonSymptoms: ['discharge', 'breastTenderness'],
      tips: [
        'Sosyal veya is etkinlikleri icin iyi bir zaman.',
        'Sudan zengin besinler tuket.',
        'Planlama yaparken enerjinden yararlan.',
        'Hedeflerini paylas, destek iste.'
      ],
      dayRange: 'Gun 14 (+/-2)',
    },
    luteal: {
      phase: 'luteal',
      title: 'Luteal Faz (Yavaslama Donemi)',
      description: 'Progesteron artar, PMS belirtileri gorulebilir.',
      hormonInfo: 'Progesteron yuksek kalir, sonra yavasca azalir.',
      commonSymptoms: ['bloating', 'breastTenderness', 'acne', 'appetite', 'irritable', 'anxious', 'lowEnergy'],
      tips: [
        'Yumusak hareketler veya yoga sec.',
        'Magnezyum ve B6 iceren besinler ekle.',
        'Tuz ve kafeini azalt.',
        'Erken uyumaya ozen goster.',
        'Self-care rutinleri planla.'
      ],
      dayRange: 'Gun 15-28',
    },
  };

  return data[phase];
}

