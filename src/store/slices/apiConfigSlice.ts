import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StockAPIProvider } from '@/types/shared/base/enums';

// Type alias for backward compatibility
export type StockAPIProviderType = StockAPIProvider;

interface ApiConfigState {
  isEnabled: boolean;
  isDividendApiEnabled: boolean; // NEU
  selectedProvider: StockAPIProvider;
  apiKeys: {
    [K in StockAPIProvider]?: string;
  };
  // Neu für Dividenden-API
  selectedDiviProvider: string;
  dividendApiKey: {
    [provider: string]: string;
  };
}

const initialState: ApiConfigState = {
  isEnabled: localStorage.getItem('stock_api_enabled') === 'true',
  isDividendApiEnabled: localStorage.getItem('dividend_api_enabled') === 'true', // NEU
  selectedProvider: (localStorage.getItem('selected_stock_api_provider') as StockAPIProvider) || StockAPIProvider.FINNHUB,
  apiKeys: {
    [StockAPIProvider.FINNHUB]: localStorage.getItem('finnhub_api_key') || undefined,
    [StockAPIProvider.YAHOO]: localStorage.getItem('yahoo_api_key') || undefined,
    [StockAPIProvider.ALPHA_VANTAGE]: localStorage.getItem('alpha_vantage_api_key') || undefined,
  },
  // Neu für Dividenden-API
  selectedDiviProvider: localStorage.getItem('selected_divi_api_provider') || 'yahoo',
  dividendApiKey: {
    finnhub: localStorage.getItem('divi_finnhub_api_key') || '',
    yahoo: localStorage.getItem('divi_yahoo_api_key') || '',
  },
};

const apiConfigSlice = createSlice({
  name: 'apiConfig',
  initialState,
  reducers: {
    setApiEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    setDividendApiEnabled: (state, action: PayloadAction<boolean>) => { // NEU
      state.isDividendApiEnabled = action.payload;
    },
    setSelectedProvider: (state, action: PayloadAction<StockAPIProvider>) => {
      state.selectedProvider = action.payload;
    },
    setApiKey: (state, action: PayloadAction<{ provider: StockAPIProvider; apiKey: string | null }>) => {
      const { provider, apiKey } = action.payload;
      if (apiKey) {
        state.apiKeys[provider] = apiKey;
      } else {
        delete state.apiKeys[provider];
      }
    },
    setSelectedDiviProvider: (state, action: PayloadAction<string>) => {
      state.selectedDiviProvider = action.payload;
    },
    setDividendApiKey: (state, action: PayloadAction<{ provider: string; apiKey: string }>) => {
      const { provider, apiKey } = action.payload;
      if (!state.dividendApiKey) state.dividendApiKey = {};
      state.dividendApiKey[provider] = apiKey;
    },
  }
});

export const { setApiEnabled, setDividendApiEnabled, setSelectedProvider, setApiKey, setSelectedDiviProvider, setDividendApiKey } = apiConfigSlice.actions;
export default apiConfigSlice.reducer;
