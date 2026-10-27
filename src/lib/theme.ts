import { AccentTheme } from '@/types/theme';
import { THEME_STORAGE_KEY, ACCENT_THEMES, DEFAULT_THEME } from '@/constants/theme';

/**
 * Injects CSS variables dynamically onto the root element (:root)
 */
export function applyThemeToDOM(theme: AccentTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--primary-accent', theme.primary);
  root.style.setProperty('--primary-accent-hover', theme.hover);
  root.style.setProperty('--primary-accent-light', theme.light);
  root.style.setProperty('--primary-accent-border', theme.border);
  root.style.setProperty('--primary-accent-glow', `0 4px 14px ${theme.border}`);
  root.style.setProperty('--primary-accent-muted', `color-mix(in srgb, ${theme.primary} 55%, white)`);

  // Legacy brand mappings
  root.style.setProperty('--primary-orange', theme.primary);
  root.style.setProperty('--primary-orange-hover', theme.hover);
  root.style.setProperty('--primary-orange-light', theme.light);
  root.style.setProperty('--primary-orange-border', theme.border);
  root.style.setProperty('--primary-orange-muted', `color-mix(in srgb, ${theme.primary} 55%, white)`);
}

/**
 * Saves selected theme ID to local storage safely
 */
export function persistTheme(themeId: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  } catch {
    // Ignore storage quota/permission issues
  }
}

/**
 * Retrieves persisted theme or falls back to default
 */
export function getInitialTheme(): AccentTheme {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('pryma_accent');
      if (stored) {
        const found = ACCENT_THEMES.find((t) => t.id === stored);
        if (found) return found;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_THEME;
}
