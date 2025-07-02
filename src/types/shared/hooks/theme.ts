/**
 * Theme hook types
 * Re-exports the main Theme type for consistency
 */

import type { Theme } from '../base/enums';
export type { Theme } from '../base/enums';

export interface ThemeConfig {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
