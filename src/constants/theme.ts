import { AccentTheme } from '@/types/theme';

export const THEME_STORAGE_KEY = 'finora_accent';

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id: 'orange',
    name: 'Finora Orange',
    primary: '#FF5C16',
    hover: '#E84D0A',
    light: '#FFF2EC',
    border: 'rgba(255, 92, 22, 0.25)',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    primary: '#8B5CF6',
    hover: '#7C3AED',
    light: '#F5F3FF',
    border: 'rgba(139, 92, 246, 0.25)',
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    primary: '#10B981',
    hover: '#059669',
    light: '#ECFDF5',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'ocean',
    name: 'Ocean Cyan',
    primary: '#0284C7',
    hover: '#0369A1',
    light: '#F0F9FF',
    border: 'rgba(2, 132, 199, 0.25)',
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    primary: '#F43F5E',
    hover: '#E11D48',
    light: '#FFF1F2',
    border: 'rgba(244, 63, 94, 0.25)',
  },
];

export const DEFAULT_THEME = ACCENT_THEMES[0];
