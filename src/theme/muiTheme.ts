
import { createTheme } from '@mui/material/styles';

// Color palette definitions for light and dark mode
const paletteByMode = {
  light: {
    primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' },
    secondary: { main: '#7c3aed', light: '#8b5cf6', dark: '#6d28d9' },
    background: { default: '#f9fafb', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#6b7280' },
    divider: '#e5e7eb',
    error: { main: '#dc2626' },
    warning: { main: '#d97706' },
    success: { main: '#059669' },
    info: { main: '#2563eb' },
  },
  dark: {
    primary: { main: '#60a5fa', light: '#93c5fd', dark: '#3b82f6' },
    secondary: { main: '#a78bfa', light: '#c4b5fd', dark: '#8b5cf6' },
    background: { default: '#111827', paper: '#1f2937' },
    text: { primary: '#f9fafb', secondary: '#d1d5db' },
    divider: '#374151',
    error: { main: '#f87171' },
    warning: { main: '#fbbf24' },
    success: { main: '#34d399' },
    info: { main: '#60a5fa' },
  },
};

// Helper for style overrides by mode
const styleOverridesByMode = (mode: 'light' | 'dark') => {
  const c = paletteByMode[mode];
  return {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: mode === 'dark' ? '#4b5563' : '#d1d5db' },
            '&:hover fieldset': { borderColor: c.primary.main },
            '&.Mui-focused fieldset': { borderColor: c.primary.main },
          },
          '& .MuiInputLabel-root': {
            color: c.text.secondary,
            '&.Mui-focused': { color: c.primary.main },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? '#4b5563' : '#d1d5db' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.primary.main },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.primary.main },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: c.text.secondary,
            '&.Mui-focused': { color: c.primary.main },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: c.background.paper,
          color: c.text.primary,
          '&:hover': { backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6' },
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? '#1e40af' : '#dbeafe',
            '&:hover': { backgroundColor: mode === 'dark' ? '#1d4ed8' : '#bfdbfe' },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: c.background.paper,
          backgroundImage: 'none',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: mode === 'dark' ? '#9ca3af' : '#6b7280',
          '&.Mui-checked': { color: c.primary.main },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: { color: c.text.primary },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: mode === 'dark' ? '#9ca3af' : '#6b7280',
          '&.Mui-error': { color: c.error.main },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: c.text.secondary,
          '&:hover': { backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
          color: c.text.primary,
          '&.MuiChip-colorPrimary': {
            backgroundColor: mode === 'dark' ? '#1e40af' : '#dbeafe',
            color: mode === 'dark' ? '#f9fafb' : '#1e40af',
          },
        },
      },
    },
  };
};

export const createMuiTheme = (mode: 'light' | 'dark') => {
  const palette = paletteByMode[mode];
  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
    },
    components: styleOverridesByMode(mode),
  });
};
