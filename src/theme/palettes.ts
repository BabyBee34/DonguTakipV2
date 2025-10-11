/**
 * Tema Paletleri - Hazır Renk Şemaları
 * 
 * Kullanıcıların seçebileceği hazır tema paletleri ve özel renk tanımları.
 */

export const THEME_PALETTES = [
  {
    id: 'rose',
    name: 'Pembe Gül',
    description: 'Yumuşak pembe tonları',
    preview: ['#E94FA1', '#FFE8F5', '#FFFFFF', '#1F2937'],
    colors: {
      primary: '#E94FA1',
      background: '#FFF9FB',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      text: '#1F2937',
      mutedText: '#6B7280',
      border: '#E5E7EB',
      accent: '#E94FA1',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
  },
  {
    id: 'lavender',
    name: 'Lavanta',
    description: 'Mor lavanta tonları',
    preview: ['#9B8BFF', '#F2EEFF', '#FFFFFF', '#1E1B4B'],
    colors: {
      primary: '#9B8BFF',
      background: '#F8F7FF',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      text: '#1E1B4B',
      mutedText: '#6B7280',
      border: '#E5E7EB',
      accent: '#9B8BFF',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
  },
  {
    id: 'midnight',
    name: 'Gece',
    description: 'Koyu gece tonları',
    preview: ['#7C3AED', '#0B0B10', '#16161A', '#E5E7EB'],
    colors: {
      primary: '#7C3AED',
      background: '#0B0B10',
      surface: '#16161A',
      card: '#1F2937',
      text: '#E5E7EB',
      mutedText: '#9CA3AF',
      border: '#374151',
      accent: '#7C3AED',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
  },
  {
    id: 'mint',
    name: 'Nane Yeşili',
    description: 'Taze nane tonları',
    preview: ['#10B981', '#ECFDF5', '#FFFFFF', '#064E3B'],
    colors: {
      primary: '#10B981',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      text: '#064E3B',
      mutedText: '#6B7280',
      border: '#E5E7EB',
      accent: '#10B981',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
  },
  {
    id: 'sunset',
    name: 'Gün Batımı',
    description: 'Sıcak turuncu tonları',
    preview: ['#F97316', '#FEF3E2', '#FFFFFF', '#9A3412'],
    colors: {
      primary: '#F97316',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      text: '#9A3412',
      mutedText: '#6B7280',
      border: '#E5E7EB',
      accent: '#F97316',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
  },
  {
    id: 'ocean',
    name: 'Okyanus',
    description: 'Derin mavi tonları',
    preview: ['#0EA5E9', '#E0F2FE', '#FFFFFF', '#0C4A6E'],
    colors: {
      primary: '#0EA5E9',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      text: '#0C4A6E',
      mutedText: '#6B7280',
      border: '#E5E7EB',
      accent: '#0EA5E9',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
  },
] as const;

export type PaletteId = typeof THEME_PALETTES[number]['id'];

// Palette lookup helper
export function getPalette(id: PaletteId) {
  return THEME_PALETTES.find(p => p.id === id) || THEME_PALETTES[0];
}

// Default palette
export const DEFAULT_PALETTE = THEME_PALETTES[0]; // rose

