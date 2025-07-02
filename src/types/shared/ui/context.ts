/**
 * Context-related UI types
 */

import { Theme } from '../base/enums';

export interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  isMobile: boolean;
}
