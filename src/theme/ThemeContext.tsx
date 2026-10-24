import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeKey,
  AccentKey,
  ThemePalette,
  THEMES,
  ACCENTS,
  DEFAULT_THEME,
  DEFAULT_ACCENT,
} from './themes';

// ─── Derived token shape ───────────────────────────────────────────────────

export interface AppTheme extends ThemePalette {
  accent: string;
  // Compact flag
  compact: boolean;
  // Toggle avatar letters
  showAvatars: boolean;
  // Convenience aliases
  busy: string;
  available: string;
}

// ─── Context ───────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: AppTheme;
  themeKey: ThemeKey;
  accentKey: AccentKey;
  setTheme: (key: ThemeKey) => void;
  setAccent: (key: AccentKey) => void;
  toggleCompact: () => void;
  toggleAvatars: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Helper ────────────────────────────────────────────────────────────────

function buildTheme(themeKey: ThemeKey, accentKey: AccentKey, compact: boolean, showAvatars: boolean): AppTheme {
  const base = THEMES[themeKey];
  const accent = ACCENTS[accentKey].color;
  return { ...base, accent, compact, showAvatars };
}

// ─── Provider ──────────────────────────────────────────────────────────────

const STORAGE_KEY = '@busyapp_theme_prefs';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>(DEFAULT_THEME);
  const [accentKey, setAccentKey] = useState<AccentKey>(DEFAULT_ACCENT);
  const [compact, setCompact] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);

  // Load persisted prefs on mount
  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        if (saved.themeKey) setThemeKey(saved.themeKey);
        if (saved.accentKey) setAccentKey(saved.accentKey);
        if (typeof saved.compact === 'boolean') setCompact(saved.compact);
        if (typeof saved.showAvatars === 'boolean') setShowAvatars(saved.showAvatars);
      } catch {}
    });
  }, []);

  const persist = useCallback(
    (tk: ThemeKey, ak: AccentKey, c: boolean, sa: boolean) => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ themeKey: tk, accentKey: ak, compact: c, showAvatars: sa }));
    },
    [],
  );

  const setTheme = useCallback(
    (key: ThemeKey) => {
      setThemeKey(key);
      persist(key, accentKey, compact, showAvatars);
    },
    [accentKey, compact, showAvatars, persist],
  );

  const setAccent = useCallback(
    (key: AccentKey) => {
      setAccentKey(key);
      persist(themeKey, key, compact, showAvatars);
    },
    [themeKey, compact, showAvatars, persist],
  );

  const toggleCompact = useCallback(() => {
    setCompact(prev => {
      persist(themeKey, accentKey, !prev, showAvatars);
      return !prev;
    });
  }, [themeKey, accentKey, showAvatars, persist]);

  const toggleAvatars = useCallback(() => {
    setShowAvatars(prev => {
      persist(themeKey, accentKey, compact, !prev);
      return !prev;
    });
  }, [themeKey, accentKey, compact, persist]);

  const theme = buildTheme(themeKey, accentKey, compact, showAvatars);

  return (
    <ThemeContext.Provider value={{ theme, themeKey, accentKey, setTheme, setAccent, toggleCompact, toggleAvatars }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
