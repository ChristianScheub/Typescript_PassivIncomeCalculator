import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SnackbarMessage {
  id: string;
  message: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  autoHideDuration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SnackbarState {
  messages: SnackbarMessage[];
  open: boolean;
}

const initialState: SnackbarState = {
  messages: [],
  open: false,
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<Omit<SnackbarMessage, 'id'>>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
      const newMessage: SnackbarMessage = {
        id,
        severity: 'info',
        autoHideDuration: 4000,
        ...action.payload,
      };
      
      state.messages.push(newMessage);
      state.open = true;
    },
    
    hideSnackbar: (state) => {
      state.open = false;
    },
    
    removeSnackbar: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
      state.open = state.messages.length > 0;
    },
    
    clearAllSnackbars: (state) => {
      state.messages = [];
      state.open = false;
    },
    
    // Convenience actions for different severities
    showSuccessSnackbar: (state, action: PayloadAction<string>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
      const newMessage: SnackbarMessage = {
        id,
        message: action.payload,
        severity: 'success',
        autoHideDuration: 4000,
      };
      
      state.messages.push(newMessage);
      state.open = true;
    },
    
    showErrorSnackbar: (state, action: PayloadAction<string>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
      const newMessage: SnackbarMessage = {
        id,
        message: action.payload,
        severity: 'error',
        autoHideDuration: 6000, // Errors stay longer
      };
      
      state.messages.push(newMessage);
      state.open = true;
    },
    
    showWarningSnackbar: (state, action: PayloadAction<string>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
      const newMessage: SnackbarMessage = {
        id,
        message: action.payload,
        severity: 'warning',
        autoHideDuration: 5000,
      };
      
      state.messages.push(newMessage);
      state.open = true;
    },
    
    showInfoSnackbar: (state, action: PayloadAction<string>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
      const newMessage: SnackbarMessage = {
        id,
        message: action.payload,
        severity: 'info',
        autoHideDuration: 4000,
      };
      
      state.messages.push(newMessage);
      state.open = true;
    },
  },
});

export const {
  showSnackbar,
  hideSnackbar,
  removeSnackbar,
  clearAllSnackbars,
  showSuccessSnackbar,
  showErrorSnackbar,
  showWarningSnackbar,
  showInfoSnackbar,
} = snackbarSlice.actions;

export default snackbarSlice.reducer;
