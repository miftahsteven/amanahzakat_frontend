import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  cycleTheme,
  getStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/theme';

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  cycle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => getStoredTheme());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(getStoredTheme()));

  useEffect(() => {
    const next = applyTheme(preference);
    setResolved(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // ignore
    }
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setResolved(applyTheme('system'));
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolved,
      setPreference: setPreferenceState,
      cycle: () => setPreferenceState((prev) => cycleTheme(prev)),
    }),
    [preference, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme harus dipakai di dalam ThemeProvider');
  }
  return ctx;
}
