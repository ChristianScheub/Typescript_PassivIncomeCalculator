/**
 * Theme hook types
 */

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
