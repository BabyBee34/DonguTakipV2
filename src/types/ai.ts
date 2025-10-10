export interface TipRecord {
  id: string;
  title: string;
  body: string;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'general';
  tags: string[];
  source?: string;
  mood?: string | null;
}

export interface FAQRecord {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  source?: string;
}

export interface KnowledgeBase {
  tips: TipRecord[];
  faq: FAQRecord[];
}
