import { complement, textOn } from './colors';

// Colores de cada fondo; el de acento lo pone el color de la app (ACCENTS).
export const THEMES = {
  light: {
    label: 'Claro',
    bg: '#ffffff',
    subtle: '#f3f4f6',
    text: '#1f2328',
    muted: '#6b7280',
    surface: 'rgba(255,255,255,0.96)',
    border: '#e5e7eb',
    statusBar: 'dark',
  },
  sepia: {
    label: 'Sepia',
    bg: '#f4ecd8',
    subtle: '#e9dfc6',
    text: '#433422',
    muted: '#8a7458',
    surface: 'rgba(244,236,216,0.97)',
    border: '#dccfb0',
    statusBar: 'dark',
  },
  dark: {
    label: 'Oscuro',
    dark: true,
    bg: '#121212',
    subtle: '#1c1c1c',
    text: '#dcdcdc',
    muted: '#9a9a9a',
    surface: 'rgba(30,30,30,0.96)',
    border: '#333333',
    statusBar: 'light',
  },
  amoled: {
    // Negro puro: en pantallas OLED los píxeles se apagan y ahorra batería.
    label: 'AMOLED',
    dark: true,
    bg: '#000000',
    subtle: '#0a0a0a',
    text: '#d4d4d4',
    muted: '#8b8b8b',
    surface: 'rgba(0,0,0,0.96)',
    border: '#262626',
    statusBar: 'light',
  },
};

// Color de la app (botones, selección, enlaces). Cada uno tiene un tono para
// fondos claros y otro más luminoso para los oscuros, para que siempre se lea.
export const ACCENTS = {
  blue: { label: 'Azul', light: '#2563eb', dark: '#60a5fa' },
  red: { label: 'Rojo', light: '#c81e1e', dark: '#f87171' },
  green: { label: 'Verde', light: '#15803d', dark: '#4ade80' },
  purple: { label: 'Morado', light: '#7c3aed', dark: '#a78bfa' },
};

export const accentFor = (accent, theme) => (theme.dark ? ACCENTS[accent].dark : ACCENTS[accent].light);

// secondary: el complementario del color de la app (el otro lado del chat).
export function themeFor(settings) {
  const theme = THEMES[settings.theme];
  const accent = accentFor(settings.accent, theme);
  const secondary = complement(accent);
  return {
    ...theme,
    accent,
    onAccent: textOn(accent),
    secondary,
    onSecondary: textOn(secondary),
  };
}

export const DEFAULT_SETTINGS = {
  theme: 'light',
  accent: 'blue',
};
