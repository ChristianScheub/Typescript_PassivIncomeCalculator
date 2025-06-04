import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ApiConfigState {
  isEnabled: boolean;
  apiKey: string | null;
}

const initialState: ApiConfigState = {
  isEnabled: false,
  apiKey: localStorage.getItem('finnhub_api_key') || null
};

const apiConfigSlice = createSlice({
  name: 'apiConfig',
  initialState,
  reducers: {
    setApiEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    setApiKey: (state, action: PayloadAction<string | null>) => {
      state.apiKey = action.payload;
      if (action.payload) {
        localStorage.setItem('finnhub_api_key', action.payload);
      } else {
        localStorage.removeItem('finnhub_api_key');
      }
    }
  }
});

export const { setApiEnabled, setApiKey } = apiConfigSlice.actions;
export default apiConfigSlice.reducer;
