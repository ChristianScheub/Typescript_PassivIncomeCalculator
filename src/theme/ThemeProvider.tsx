import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useAppContext } from '../context/AppContext';
import { createMuiTheme } from './muiTheme';

interface ThemeProviderContextType {
  isDarkMode: boolean;
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useAppContext();
  const isDarkMode = theme === 'dark';

  const muiTheme = useMemo(() => createMuiTheme(theme), [theme]);

  const contextValue = useMemo(() => ({
    isDarkMode,
  }), [isDarkMode]);

  return (
    <ThemeProviderContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeProviderContext.Provider>
  );
};

export const useThemeProvider = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useThemeProvider must be used within a ThemeProvider');
  }
  return context;
};
