import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StockAPIProvider = 'finnhub' | 'yahoo' | 'alpha_vantage' | 'iex_cloud';

interface ApiConfigState {
  isEnabled: boolean;
  selectedProvider: StockAPIProvider;
  apiKeys: {
    [K in StockAPIProvider]?: string;
  };
}

const initialState: ApiConfigState = {
  isEnabled: localStorage.getItem('stock_api_enabled') === 'true',
  selectedProvider: (localStorage.getItem('selected_stock_api_provider') as StockAPIProvider) || 'finnhub',
  apiKeys: {
    finnhub: localStorage.getItem('finnhub_api_key') || undefined,
    yahoo: localStorage.getItem('yahoo_api_key') || undefined,
    alpha_vantage: localStorage.getItem('alpha_vantage_api_key') || undefined,
    iex_cloud: localStorage.getItem('iex_cloud_api_key') || undefined,
  }
};

const apiConfigSlice = createSlice({
  name: 'apiConfig',
  initialState,
  reducers: {
    setApiEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
      // Also save to localStorage for persistence
      localStorage.setItem('stock_api_enabled', action.payload.toString());
    },
    setSelectedProvider: (state, action: PayloadAction<StockAPIProvider>) => {
      state.selectedProvider = action.payload;
      // Also save to localStorage so createStockAPIService() can read it
      localStorage.setItem('selected_stock_api_provider', action.payload);
    },
    setApiKey: (state, action: PayloadAction<{ provider: StockAPIProvider; apiKey: string | null }>) => {
      const { provider, apiKey } = action.payload;
      
      if (apiKey) {
        state.apiKeys[provider] = apiKey;
        localStorage.setItem(`${provider}_api_key`, apiKey);
      } else {
        delete state.apiKeys[provider];
        localStorage.removeItem(`${provider}_api_key`);
      }
    },
    // Legacy support for backwards compatibility
    setApiKeyLegacy: (state, action: PayloadAction<string | null>) => {
      const apiKey = action.payload;
      if (apiKey) {
        state.apiKeys.finnhub = apiKey;
        localStorage.setItem('finnhub_api_key', apiKey);
      } else {
        delete state.apiKeys.finnhub;
        localStorage.removeItem('finnhub_api_key');
      }
    }
  }
});

export const { setApiEnabled, setSelectedProvider, setApiKey, setApiKeyLegacy } = apiConfigSlice.actions;
export default apiConfigSlice.reducer;
