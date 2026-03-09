export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bb_theme_mode';

export function getStoredThemeMode(): ThemeMode {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  return raw === 'dark' ? 'dark' : 'light';
}

export function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyThemeMode(mode);
}
