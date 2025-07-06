/**
 * Backward Compatibility Selectors
 * Provides legacy selector interfaces during config migration
 * TODO: Remove after all components migrated to new configSlice
 */

import { RootState } from '../config/storeConfig';

// Legacy API Config selectors
export const selectLegacyApiConfig = (state: RootState) => ({
  isEnabled: state.config.apis.stock.enabled,
  isDividendApiEnabled: state.config.apis.dividend.enabled,
  selectedProvider: state.config.apis.stock.selectedProvider,
  apiKeys: state.config.apis.stock.apiKeys,
  selectedDiviProvider: state.config.apis.dividend.selectedProvider,
  dividendApiKey: state.config.apis.dividend.apiKeys,
});

// Legacy Dividend API Config selectors
export const selectLegacyDividendApiConfig = (state: RootState) => ({
  enabled: state.config.apis.dividend.enabled,
  selectedProvider: state.config.apis.dividend.selectedProvider,
  apiKeys: state.config.apis.dividend.apiKeys,
});

// Legacy AI Config selectors
export const selectLegacyAIConfig = (state: RootState) => ({
  isAIEnabled: state.config.apis.ai.enabled,
  selectedModelId: state.config.apis.ai.selectedModelId,
  modelStatus: state.config.apis.ai.modelStatus,
  autoLoadModel: state.config.apis.ai.autoLoadModel,
  lastUsedModel: state.config.apis.ai.lastUsedModel,
  preferences: state.config.apis.ai.preferences,
});

// Legacy Dashboard Settings selectors
export const selectLegacyDashboardSettings = (state: RootState) => ({
  mode: state.config.dashboard.defaultView === 'list' ? 'list' : 'smartSummary',
  assetFocus: {
    timeRange: '1W' // Default fallback - this was stored separately in old system
  }
});

// Legacy state interfaces for temporary compatibility
export interface LegacyApiConfigState {
  isEnabled: boolean;
  isDividendApiEnabled: boolean;
  selectedProvider: any;
  apiKeys: any;
  selectedDiviProvider: any;
  dividendApiKey: any;
}

export interface LegacyDividendApiConfigState {
  enabled: boolean;
  selectedProvider: any;
  apiKeys: any;
}

export interface LegacyAIConfigState {
  isAIEnabled: boolean;
  selectedModelId: string | null;
  modelStatus: string;
  autoLoadModel: boolean;
  lastUsedModel: string | null;
  preferences: any;
}

export interface LegacyDashboardSettingsState {
  mode: string;
  assetFocus: {
    timeRange: string;
  };
}
