import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum StockAPIProvider {
  FINNHUB = 'finnhub',
  YAHOO = 'yahoo',
  ALPHA_VANTAGE = 'alpha_vantage'
}

// Type alias for backward compatibility
export type StockAPIProviderType = StockAPIProvider;

interface ApiConfigState {
  isEnabled: boolean;
  selectedProvider: StockAPIProvider;
  apiKeys: {
    [K in StockAPIProvider]?: string;
  };
}

const initialState: ApiConfigState = {
  isEnabled: localStorage.getItem('stock_api_enabled') === 'true',
  selectedProvider: (localStorage.getItem('selected_stock_api_provider') as StockAPIProvider) || StockAPIProvider.FINNHUB,
  apiKeys: {
    [StockAPIProvider.FINNHUB]: localStorage.getItem('finnhub_api_key') || undefined,
    [StockAPIProvider.YAHOO]: localStorage.getItem('yahoo_api_key') || undefined,
    [StockAPIProvider.ALPHA_VANTAGE]: localStorage.getItem('alpha_vantage_api_key') || undefined,
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
    }
  }
});

export const { setApiEnabled, setSelectedProvider, setApiKey } = apiConfigSlice.actions;
export default apiConfigSlice.reducer;
