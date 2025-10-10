export interface NormalizedSymptom {
  id: string;
  severity: number;
}

const clampSeverity = (value: number | undefined): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 1;
  }
  if (value < 0) return 0;
  if (value > 3) return 3;
  return value;
};

export const normalizeSymptomEntries = (raw: any): NormalizedSymptom[] => {
  if (!Array.isArray(raw)) return [];

  return raw.reduce<NormalizedSymptom[]>((acc, entry) => {
    if (!entry) {
      return acc;
    }

    if (typeof entry === 'string') {
      acc.push({ id: entry, severity: 1 });
      return acc;
    }

    if (typeof entry === 'object' && typeof entry.id === 'string') {
      acc.push({
        id: entry.id,
        severity: clampSeverity(entry.severity),
      });
    }

    return acc;
  }, []);
};

export const extractSymptomIds = (raw: any): string[] =>
  normalizeSymptomEntries(raw).map((item) => item.id);

export const sumSymptomSeverity = (raw: any): number =>
  normalizeSymptomEntries(raw).reduce((sum, item) => sum + item.severity, 0);
