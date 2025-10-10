import { TipRecord, FAQRecord, KnowledgeBase } from '../types/ai';

const tipsData: { version?: string; lastUpdated?: string; tips: TipRecord[] } = require('../../assets/kb/tips.json');
const faqData: { version?: string; lastUpdated?: string; faq: FAQRecord[] } = require('../../assets/kb/faq.json');

let cachedKb: KnowledgeBase | null = null;
let currentVersion: { tips: string; faq: string } | null = null;

export const loadKnowledgeBase = (): KnowledgeBase => {
  if (cachedKb) {
    return cachedKb;
  }

  const tips = Array.isArray(tipsData?.tips) ? tipsData.tips : [];
  const faq = Array.isArray(faqData?.faq) ? faqData.faq : [];
  
  // Version bilgisini sakla
  currentVersion = {
    tips: tipsData?.version || '1.0.0',
    faq: faqData?.version || '1.0.0',
  };

  cachedKb = { tips, faq };
  return cachedKb;
};

/**
 * Bilgi bankası versiyonunu döndürür
 */
export const getKnowledgeBaseVersion = (): { tips: string; faq: string; lastUpdated: { tips?: string; faq?: string } } => {
  if (!currentVersion) {
    loadKnowledgeBase(); // İlk yükleme
  }
  return {
    tips: currentVersion?.tips || '1.0.0',
    faq: currentVersion?.faq || '1.0.0',
    lastUpdated: {
      tips: tipsData?.lastUpdated,
      faq: faqData?.lastUpdated,
    },
  };
};

export const getTips = (): TipRecord[] => loadKnowledgeBase().tips;

export const getFaq = (): FAQRecord[] => loadKnowledgeBase().faq;

export const findTipsByTags = (tags: string[]): TipRecord[] => {
  const normalized = tags.map((tag) => tag.toLowerCase());
  return getTips().filter((tip) =>
    tip.tags.some((tag) => normalized.includes(tag.toLowerCase()))
  );
};

export const getTipById = (id: string): TipRecord | undefined =>
  getTips().find((tip) => tip.id === id);
