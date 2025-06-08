import { createTheme } from '@mui/material/styles';

// Create both light and dark themes
export const createMuiTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
        light: mode === 'dark' ? '#93c5fd' : '#3b82f6', // blue-300 : blue-500
        dark: mode === 'dark' ? '#3b82f6' : '#1d4ed8', // blue-500 : blue-700
      },
      secondary: {
        main: mode === 'dark' ? '#a78bfa' : '#7c3aed', // violet-400 : violet-600
        light: mode === 'dark' ? '#c4b5fd' : '#8b5cf6', // violet-300 : violet-500
        dark: mode === 'dark' ? '#8b5cf6' : '#6d28d9', // violet-500 : violet-700
      },
      background: {
        default: mode === 'dark' ? '#111827' : '#f9fafb', // gray-900 : gray-50
        paper: mode === 'dark' ? '#1f2937' : '#ffffff', // gray-800 : white
      },
      text: {
        primary: mode === 'dark' ? '#f9fafb' : '#111827', // gray-50 : gray-900
        secondary: mode === 'dark' ? '#d1d5db' : '#6b7280', // gray-300 : gray-500
      },
      divider: mode === 'dark' ? '#374151' : '#e5e7eb', // gray-700 : gray-200
      error: {
        main: mode === 'dark' ? '#f87171' : '#dc2626', // red-400 : red-600
      },
      warning: {
        main: mode === 'dark' ? '#fbbf24' : '#d97706', // amber-400 : amber-600
      },
      success: {
        main: mode === 'dark' ? '#34d399' : '#059669', // emerald-400 : emerald-600
      },
      info: {
        main: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
      },
      subtitle2: {
        fontWeight: 500,
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: mode === 'dark' ? '#4b5563' : '#d1d5db', // gray-600 : gray-300
              },
              '&:hover fieldset': {
                borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
              },
            },
            '& .MuiInputLabel-root': {
              color: mode === 'dark' ? '#d1d5db' : '#6b7280', // gray-300 : gray-500
              '&.Mui-focused': {
                color: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#4b5563' : '#d1d5db', // gray-600 : gray-300
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
            },
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': {
              color: mode === 'dark' ? '#d1d5db' : '#6b7280', // gray-300 : gray-500
              '&.Mui-focused': {
                color: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
              },
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff', // gray-800 : white
            color: mode === 'dark' ? '#f9fafb' : '#111827', // gray-50 : gray-900
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6', // gray-700 : gray-100
            },
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? '#1e40af' : '#dbeafe', // blue-800 : blue-100
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#1d4ed8' : '#bfdbfe', // blue-700 : blue-200
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff', // gray-800 : white
            backgroundImage: 'none',
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
            '&.Mui-checked': {
              color: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
            },
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          label: {
            color: mode === 'dark' ? '#f9fafb' : '#111827', // gray-50 : gray-900
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
            '&.Mui-error': {
              color: mode === 'dark' ? '#f87171' : '#dc2626', // red-400 : red-600
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#d1d5db' : '#6b7280', // gray-300 : gray-500
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6', // gray-700 : gray-100
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6', // gray-700 : gray-100
            color: mode === 'dark' ? '#f9fafb' : '#111827', // gray-50 : gray-900
            '&.MuiChip-colorPrimary': {
              backgroundColor: mode === 'dark' ? '#1e40af' : '#dbeafe', // blue-800 : blue-100
              color: mode === 'dark' ? '#f9fafb' : '#1e40af', // gray-50 : blue-800
            },
          },
        },
      },
    },
  });
};
