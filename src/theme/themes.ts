/**
 * Theme definitions for BusyApp.
 * Each theme has a base palette + busy/available status colors.
 */

export type ThemeKey =
  | 'dark'
  | 'light'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'rose'
  | 'midnight'
  | 'candy';

export type AccentKey =
  | 'violet'
  | 'blue'
  | 'teal'
  | 'green'
  | 'orange'
  | 'pink'
  | 'red'
  | 'gold';

export interface ThemePalette {
  // Surfaces
  background: string;
  card: string;
  border: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Status
  busy: string;
  available: string;
  // Nav
  tabBackground: string;
}

export const THEMES: Record<ThemeKey, ThemePalette & { label: string; emoji: string }> = {
  dark: {
    label: 'Dark',
    emoji: '🌙',
    background: '#0F0F14',
    card: '#1C1C28',
    border: '#2A2A3D',
    textPrimary: '#F1F1F5',
    textSecondary: '#9393A8',
    textMuted: '#5C5C78',
    busy: '#EF4444',
    available: '#22C55E',
    tabBackground: '#1C1C28',
  },
  light: {
    label: 'Light',
    emoji: '☀️',
    background: '#F4F4F8',
    card: '#FFFFFF',
    border: '#E2E2EC',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B6B80',
    textMuted: '#9999AA',
    busy: '#EF4444',
    available: '#16A34A',
    tabBackground: '#FFFFFF',
  },
  ocean: {
    label: 'Ocean',
    emoji: '🌊',
    background: '#040D21',
    card: '#0A1A3A',
    border: '#1A3060',
    textPrimary: '#E0EEFF',
    textSecondary: '#7AA4D4',
    textMuted: '#3A6090',
    busy: '#EF4444',
    available: '#22D3EE',
    tabBackground: '#0A1A3A',
  },
  sunset: {
    label: 'Sunset',
    emoji: '🌅',
    background: '#1A0A0F',
    card: '#2A1020',
    border: '#4A1A30',
    textPrimary: '#FFE4D4',
    textSecondary: '#E8947A',
    textMuted: '#804040',
    busy: '#F97316',
    available: '#22C55E',
    tabBackground: '#2A1020',
  },
  forest: {
    label: 'Forest',
    emoji: '🌲',
    background: '#071410',
    card: '#0D2018',
    border: '#1A3828',
    textPrimary: '#DAFAE6',
    textSecondary: '#7AC89A',
    textMuted: '#3A7050',
    busy: '#EF4444',
    available: '#4ADE80',
    tabBackground: '#0D2018',
  },
  rose: {
    label: 'Rose',
    emoji: '🌸',
    background: '#1A0A12',
    card: '#2A1022',
    border: '#4A1A3A',
    textPrimary: '#FFE4F4',
    textSecondary: '#E895C0',
    textMuted: '#904070',
    busy: '#EF4444',
    available: '#F472B6',
    tabBackground: '#2A1022',
  },
  midnight: {
    label: 'Midnight',
    emoji: '🌌',
    background: '#06060F',
    card: '#10102A',
    border: '#1E1E44',
    textPrimary: '#D4D4FF',
    textSecondary: '#8080C0',
    textMuted: '#404080',
    busy: '#EF4444',
    available: '#818CF8',
    tabBackground: '#10102A',
  },
  candy: {
    label: 'Candy',
    emoji: '🍬',
    background: '#1A0A20',
    card: '#2A1040',
    border: '#5A2080',
    textPrimary: '#FFF0FF',
    textSecondary: '#D080E0',
    textMuted: '#804090',
    busy: '#F472B6',
    available: '#4ADE80',
    tabBackground: '#2A1040',
  },
};

export const ACCENTS: Record<AccentKey, { label: string; color: string }> = {
  violet: { label: 'Violet', color: '#6C63FF' },
  blue:   { label: 'Blue',   color: '#3B82F6' },
  teal:   { label: 'Teal',   color: '#14B8A6' },
  green:  { label: 'Green',  color: '#22C55E' },
  orange: { label: 'Orange', color: '#F97316' },
  pink:   { label: 'Pink',   color: '#EC4899' },
  red:    { label: 'Red',    color: '#EF4444' },
  gold:   { label: 'Gold',   color: '#EAB308' },
};

export const DEFAULT_THEME: ThemeKey = 'dark';
export const DEFAULT_ACCENT: AccentKey = 'violet';
