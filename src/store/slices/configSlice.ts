/**
 * Unified Configuration Slice
 * Consolidates all app configuration: API, AI, Dashboard settings
 * Replaces: apiConfigSlice, dividendApiConfigSlice, aiConfigSlice, dashboardSettingsSlice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StockAPIProvider, DividendApiProvider } from '@/types/shared/base/enums';
import { AssetFocusTimeRange } from '@/types/shared/analytics';
import { hydrateStore } from '../actions/hydrateAction';

// Unified Configuration Interface
interface ConfigState {
  // API Configuration
  apis: {
    stock: {
      enabled: boolean;
      selectedProvider: StockAPIProvider;
      apiKeys: Partial<Record<StockAPIProvider, string>>;
    };
    dividend: {
      enabled: boolean;
      selectedProvider: DividendApiProvider;
      apiKeys: Partial<Record<DividendApiProvider, string>>;
    };
    ai: {
      enabled: boolean;
      selectedModelId: string | null;
      modelStatus: 'unloaded' | 'loading' | 'loaded' | 'error';
      autoLoadModel: boolean;
      lastUsedModel: string | null;
      preferences: {
        maxTokens: number;
        temperature: number;
        autoGenerateInsights: boolean;
        showAIRecommendations: boolean;
      };
    };
  };
  
  // Dashboard Settings
  dashboard: {
    defaultView: 'grid' | 'list';
    compactMode: boolean;
    showPerformanceIndicators: boolean;
    autoRefreshInterval: number; // in seconds
    hiddenSections: string[];
    customLayout: {
      [sectionId: string]: {
        position: number;
        visible: boolean;
        size: 'small' | 'medium' | 'large';
      };
    };
    assetFocus: {
      timeRange: AssetFocusTimeRange;
      mode: 'smartSummary' | 'assetFocus';
    };
  };
  
  // General App Settings
  general: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    dateFormat: string;
    numberFormat: string;
  };
  
  // Developer Settings
  developer: {
    enabled: boolean;
  };
  
  // Status tracking
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state with basic defaults - hydration will load persisted values
const initialState: ConfigState = {
  apis: {
    stock: {
      enabled: false,
      selectedProvider: StockAPIProvider.FINNHUB,
      apiKeys: {},
    },
    dividend: {
      enabled: false,
      selectedProvider: 'yahoo',
      apiKeys: {},
    },
    ai: {
      enabled: false,
      selectedModelId: 'tinyllama',
      modelStatus: 'unloaded',
      autoLoadModel: false,
      lastUsedModel: null,
      preferences: {
        maxTokens: 512,
        temperature: 0.7,
        autoGenerateInsights: true,
        showAIRecommendations: true,
      },
    },
  },
  dashboard: {
    defaultView: 'grid',
    compactMode: false,
    showPerformanceIndicators: true,
    autoRefreshInterval: 300, // 5 minutes
    hiddenSections: [],
    customLayout: {},
    assetFocus: {
      timeRange: '1M',
      mode: 'smartSummary',
    },
  },
  general: {
    theme: 'auto',
    language: 'en',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'de-DE',
  },
  developer: {
    enabled: false,
  },
  status: 'idle',
  error: null,
};

// Unified Configuration Slice
const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    // Stock API Configuration
    setStockApiEnabled: (state, action: PayloadAction<boolean>) => {
      state.apis.stock.enabled = action.payload;
    },
    setStockApiProvider: (state, action: PayloadAction<StockAPIProvider>) => {
      state.apis.stock.selectedProvider = action.payload;
    },
    setStockApiKey: (state, action: PayloadAction<{ provider: StockAPIProvider; key: string }>) => {
      state.apis.stock.apiKeys[action.payload.provider] = action.payload.key;
    },
    
    // Dividend API Configuration
    setDividendApiEnabled: (state, action: PayloadAction<boolean>) => {
      state.apis.dividend.enabled = action.payload;
    },
    setDividendApiProvider: (state, action: PayloadAction<DividendApiProvider>) => {
      state.apis.dividend.selectedProvider = action.payload;
    },
    setDividendApiKey: (state, action: PayloadAction<{ provider: DividendApiProvider; key: string }>) => {
      state.apis.dividend.apiKeys[action.payload.provider] = action.payload.key;
    },
    
    // AI Configuration
    setAIEnabled: (state, action: PayloadAction<boolean>) => {
      state.apis.ai.enabled = action.payload;
    },
    setAISelectedModel: (state, action: PayloadAction<string>) => {
      state.apis.ai.selectedModelId = action.payload;
    },
    setAIModelStatus: (state, action: PayloadAction<ConfigState['apis']['ai']['modelStatus']>) => {
      state.apis.ai.modelStatus = action.payload;
    },
    setAIAutoLoad: (state, action: PayloadAction<boolean>) => {
      state.apis.ai.autoLoadModel = action.payload;
    },
    setAIPreferences: (state, action: PayloadAction<Partial<ConfigState['apis']['ai']['preferences']>>) => {
      state.apis.ai.preferences = { ...state.apis.ai.preferences, ...action.payload };
    },
    
    // Dashboard Configuration
    setDashboardView: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.dashboard.defaultView = action.payload;
    },
    setDashboardCompactMode: (state, action: PayloadAction<boolean>) => {
      state.dashboard.compactMode = action.payload;
    },
    setDashboardAutoRefresh: (state, action: PayloadAction<number>) => {
      state.dashboard.autoRefreshInterval = action.payload;
    },
    toggleDashboardSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      const index = state.dashboard.hiddenSections.indexOf(sectionId);
      if (index > -1) {
        state.dashboard.hiddenSections.splice(index, 1);
      } else {
        state.dashboard.hiddenSections.push(sectionId);
      }
    },
    updateDashboardLayout: (state, action: PayloadAction<ConfigState['dashboard']['customLayout']>) => {
      state.dashboard.customLayout = action.payload;
    },
    
    // Asset Focus Configuration
    setAssetFocusTimeRange: (state, action: PayloadAction<AssetFocusTimeRange>) => {
      state.dashboard.assetFocus.timeRange = action.payload;
    },
    setAssetFocusMode: (state, action: PayloadAction<'smartSummary' | 'assetFocus'>) => {
      state.dashboard.assetFocus.mode = action.payload;
    },
    
    // General Settings
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.general.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.general.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.general.currency = action.payload;
    },
    
    // Developer Settings
    setDeveloperModeEnabled: (state, action: PayloadAction<boolean>) => {
      state.developer.enabled = action.payload;
    },
    
    // Bulk Configuration Update
    updateConfig: (state, action: PayloadAction<Partial<ConfigState>>) => {
      Object.assign(state, action.payload);
    },
    
    // Reset Configuration
    resetConfig: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Handle store hydration
      .addCase(hydrateStore, (state, action) => {
        if (action.payload.config) {
          return {
            ...state,
            ...action.payload.config,
            status: 'idle',
            error: null
          };
        }
        return state;
      });
  },
});

// Export actions
export const {
  // Stock API
  setStockApiEnabled,
  setStockApiProvider,
  setStockApiKey,
  
  // Dividend API
  setDividendApiEnabled,
  setDividendApiProvider,
  setDividendApiKey,
  
  // AI
  setAIEnabled,
  setAISelectedModel,
  setAIModelStatus,
  setAIAutoLoad,
  setAIPreferences,
  
  // Dashboard
  setDashboardView,
  setDashboardCompactMode,
  setDashboardAutoRefresh,
  toggleDashboardSection,
  updateDashboardLayout,
  
  // Asset Focus
  setAssetFocusTimeRange,
  setAssetFocusMode,
  
  // General
  setTheme,
  setLanguage,
  setCurrency,
  
  // Developer
  setDeveloperModeEnabled,
  
  // Bulk operations
  updateConfig,
  resetConfig,
} = configSlice.actions;

// Selectors
export const selectConfig = (state: { config: ConfigState }) => state.config;
export const selectStockApiConfig = (state: { config: ConfigState }) => state.config.apis.stock;
export const selectDividendApiConfig = (state: { config: ConfigState }) => state.config.apis.dividend;
export const selectAIConfig = (state: { config: ConfigState }) => state.config.apis.ai;
export const selectDashboardConfig = (state: { config: ConfigState }) => state.config.dashboard;
export const selectAssetFocusConfig = (state: { config: ConfigState }) => state.config.dashboard.assetFocus;
export const selectGeneralConfig = (state: { config: ConfigState }) => state.config.general;

// Developer selector
export const selectDeveloperConfig = (state: { config: ConfigState }) => state.config.developer;

// Derived selectors
export const selectIsStockApiReady = (state: { config: ConfigState }) => {
  const stockConfig = state.config.apis.stock;
  return stockConfig.enabled && stockConfig.apiKeys[stockConfig.selectedProvider];
};

export const selectIsDividendApiReady = (state: { config: ConfigState }) => {
  const dividendConfig = state.config.apis.dividend;
  return dividendConfig.enabled && dividendConfig.apiKeys[dividendConfig.selectedProvider];
};

export const selectIsAIReady = (state: { config: ConfigState }) => {
  const aiConfig = state.config.apis.ai;
  return aiConfig.enabled && aiConfig.modelStatus === 'loaded';
};

export default configSlice.reducer;
