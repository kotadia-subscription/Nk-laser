import { ThemeMode, SiteSettings } from '../types';

/**
 * ============================================================================
 * NKL CENTRALIZED DESIGN TOKEN & THEME SYSTEM
 * ============================================================================
 * Default brand colors derived directly from the official NKL Logo:
 * - Primary Navy:   #162657 (Deep NKL Blue)
 * - Dark Navy:      #0B1533 (Deep container/hero background)
 * - Brand Red:      #E51024 (Laser Red accent)
 * - Dark Red:       #B90D1D (Hover/active red)
 * - Light Navy:     #EAF0FF (Subtle highlight fill)
 * - Light Bg:       #F6F8FC (Crisp modern background)
 * - Primary Text:   #111827
 * - Secondary Text: #64748B
 * - Border:         #D9E1EF
 * ============================================================================
 */

export const NKL_DEFAULT_THEME = {
  primaryColor: '#162657',      // Primary Navy
  primaryDark: '#0B1533',       // Dark Navy
  accentColor: '#E51024',       // Brand Red
  accentDark: '#B90D1D',        // Dark Red
  lightNavy: '#EAF0FF',         // Light Navy tint
  bgLight: '#FFFFFF',           // Background (pure white)
  surfaceLight: '#FFFFFF',      // Card surface (pure white)
  surfaceSecondary: '#F8FAFC',  // Subtle light surface
  textPrimaryLight: '#111827',  // Primary Text
  textSecondaryLight: '#64748B',// Secondary Text
  borderLight: '#E2E8F0',       // Border (light)
};

export const DEFAULT_PRIMARY_COLOR = NKL_DEFAULT_THEME.primaryColor;
export const DEFAULT_ACCENT_COLOR = NKL_DEFAULT_THEME.accentColor;
export const DEFAULT_THEME_MODE: ThemeMode = 'light';

export const PRESET_THEME_COLORS = [
  {
    id: 'nkl-official',
    name: 'NK Laser Official',
    primary: '#162657',
    accent: '#E51024',
    description: 'Official deep navy and vibrant laser red'
  }
];

export function hexToRgbString(hex: string): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 22;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 38;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 87;
  return `${r}, ${g}, ${b}`;
}

export function getContrastTextColor(hexColor: string): string {
  const cleanHex = hexColor.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0F172A' : '#FFFFFF';
}

export function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255))
    .toString(16)
    .slice(1);
}

export function generateColorScale(baseHex: string) {
  return {
    500: baseHex,
    600: adjustColorBrightness(baseHex, -10),
    700: adjustColorBrightness(baseHex, -20),
    800: adjustColorBrightness(baseHex, -30),
    900: adjustColorBrightness(baseHex, -40),
  };
}

export function applyThemeToDocument(
  mode: ThemeMode = 'light',
  primaryColor: string = DEFAULT_PRIMARY_COLOR,
  accentColor: string = DEFAULT_ACCENT_COLOR
) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Always remove dark class to maintain pristine, clean white layout
  root.classList.remove('dark');

  // Set default primary and accent colors
  const finalPrimary = DEFAULT_PRIMARY_COLOR;
  const finalAccent = DEFAULT_ACCENT_COLOR;

  const primaryScale = generateColorScale(finalPrimary);
  const accentScale = generateColorScale(finalAccent);

  const primaryHover = primaryScale[600];
  const primaryActive = primaryScale[700];
  const primaryDark = primaryScale[800];
  const primaryContrast = getContrastTextColor(finalPrimary);

  const accentHover = accentScale[600];
  const accentActive = accentScale[700];
  const accentDark = accentScale[800];
  const accentContrast = getContrastTextColor(finalAccent);

  const primaryRgb = hexToRgbString(finalPrimary);
  const accentRgb = hexToRgbString(finalAccent);

  // Surface, Background, Text, and Border tokens
  const bg = '#FFFFFF';
  const surface = '#FFFFFF';
  const surfaceSecondary = '#F8FAFC';
  const textPrimary = '#111827';
  const textSecondary = '#64748B';
  const border = '#E2E8F0';

  // Set Standard Design Token Variables
  root.style.setProperty('--primary', finalPrimary);
  root.style.setProperty('--primary-hover', primaryHover);
  root.style.setProperty('--primary-active', primaryActive);
  root.style.setProperty('--primary-dark', primaryDark);
  root.style.setProperty('--primary-contrast', primaryContrast);
  root.style.setProperty('--primary-rgb', primaryRgb);

  root.style.setProperty('--accent', finalAccent);
  root.style.setProperty('--accent-hover', accentHover);
  root.style.setProperty('--accent-active', accentActive);
  root.style.setProperty('--accent-dark', accentDark);
  root.style.setProperty('--accent-contrast', accentContrast);
  root.style.setProperty('--accent-rgb', accentRgb);

  root.style.setProperty('--background', bg);
  root.style.setProperty('--surface', surface);
  root.style.setProperty('--surface-secondary', surfaceSecondary);
  root.style.setProperty('--text-primary', textPrimary);
  root.style.setProperty('--text-secondary', textSecondary);
  root.style.setProperty('--border', border);
  root.style.setProperty('--muted', textSecondary);

  // Backward compatibility alias variables
  root.style.setProperty('--primary-color', finalPrimary);
  root.style.setProperty('--accent-color', finalAccent);
  root.style.setProperty('--primary-light', '#EAF0FF');
  root.style.setProperty('--primary-light-border', '#CBD5E1');
  root.style.setProperty('--accent-light', '#FEE2E2');
  root.style.setProperty('--accent-light-border', '#FECACA');
}
