import { FAQRecord } from '../types/ai';
import { getFaq } from './knowledgeBase';

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9ğüşöçıİ\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

export interface FAQSearchResult {
  item: FAQRecord;
  score: number;
  matchedTags: string[];
}

export const searchFaq = (query: string, limit = 3): FAQSearchResult[] => {
  if (!query.trim()) {
    return getFaq()
      .slice(0, limit)
      .map((item) => ({ item, score: 0, matchedTags: [] }));
  }

  const tokens = new Set(tokenize(query));
  const candidates = getFaq();

  const scored = candidates
    .map<FAQSearchResult>((item) => {
      const questionTokens = tokenize(item.question);
      const answerTokens = tokenize(item.answer);
      const tagTokens = item.tags.map((tag) => tag.toLowerCase());

      let score = 0;
      const matchedTags: string[] = [];

      questionTokens.forEach((token) => {
        if (tokens.has(token)) {
          score += 2;
        }
      });

      answerTokens.forEach((token) => {
        if (tokens.has(token)) {
          score += 1;
        }
      });

      tagTokens.forEach((tag) => {
        if (tokens.has(tag)) {
          score += 3;
          matchedTags.push(tag);
        }
      });

      return { item, score, matchedTags };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length < limit) {
    const fallback = candidates
      .filter((item) => !scored.some((entry) => entry.item.id === item.id))
      .slice(0, limit - scored.length)
      .map((item) => ({ item, score: 0, matchedTags: [] }));
    return [...scored, ...fallback].slice(0, limit);
  }

  return scored.slice(0, limit);
};
