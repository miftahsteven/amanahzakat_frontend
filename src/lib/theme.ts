export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'amanahzakat_theme';

export function getStoredTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
  } catch {
    // ignore
  }
  return 'light';
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return 'light';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'dark' ? 'dark' : 'light';
}


export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = preference;
  root.style.colorScheme = resolved;
  return resolved;
}

export function cycleTheme(current: ThemePreference): ThemePreference {
  if (current === 'system') return 'light';
  if (current === 'light') return 'dark';
  return 'system';
}
