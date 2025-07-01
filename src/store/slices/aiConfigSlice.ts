import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * AI Configuration State
 */
export interface AIConfigState {
  isAIEnabled: boolean;
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
}

const initialState: AIConfigState = {
  isAIEnabled: false,
  selectedModelId: 'tinyllama', // Default to TinyLlama
  modelStatus: 'unloaded',
  autoLoadModel: false,
  lastUsedModel: null,
  preferences: {
    maxTokens: 512,
    temperature: 0.7,
    autoGenerateInsights: true,
    showAIRecommendations: true,
  }
};

/**
 * AI Configuration Slice
 * Manages AI-related settings and model state
 */
const aiConfigSlice = createSlice({
  name: 'aiConfig',
  initialState,
  reducers: {
    setAIEnabled: (state, action: PayloadAction<boolean>) => {
      state.isAIEnabled = action.payload;
    },
    
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModelId = action.payload;
    },
    
    setModelStatus: (state, action: PayloadAction<AIConfigState['modelStatus']>) => {
      state.modelStatus = action.payload;
      if (action.payload === 'loaded' && state.selectedModelId) {
        state.lastUsedModel = state.selectedModelId;
      }
    },
    
    setAutoLoadModel: (state, action: PayloadAction<boolean>) => {
      state.autoLoadModel = action.payload;
    },
    
    updatePreferences: (state, action: PayloadAction<Partial<AIConfigState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    resetAIConfig: () => initialState
  }
});

export const {
  setAIEnabled,
  setSelectedModel,
  setModelStatus,
  setAutoLoadModel,
  updatePreferences,
  resetAIConfig
} = aiConfigSlice.actions;

export default aiConfigSlice.reducer;
