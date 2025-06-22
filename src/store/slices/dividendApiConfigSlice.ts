import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DividendApiProvider = 'yahoo' | 'finnhub';

interface DividendApiConfigState {
  enabled: boolean;
  selectedProvider: DividendApiProvider;
  apiKeys: {
    yahoo?: string;
    finnhub?: string;
  };
}

const initialState: DividendApiConfigState = {
  enabled: true,
  selectedProvider: 'yahoo',
  apiKeys: {},
};

const dividendApiConfigSlice = createSlice({
  name: 'dividendApiConfig',
  initialState,
  reducers: {
    setDividendApiEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
    setDividendApiProvider(state, action: PayloadAction<DividendApiProvider>) {
      state.selectedProvider = action.payload;
    },
    setDividendApiKey(state, action: PayloadAction<{ provider: DividendApiProvider; key: string }>) {
      state.apiKeys[action.payload.provider] = action.payload.key;
    },
  },
});

export const { setDividendApiEnabled, setDividendApiProvider, setDividendApiKey } = dividendApiConfigSlice.actions;
export default dividendApiConfigSlice.reducer;
