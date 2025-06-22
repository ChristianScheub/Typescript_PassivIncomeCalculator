import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StoreState } from '..';
import Logger from '@/service/shared/logging/Logger/logger';
import portfolioHistoryService from '@/service/domain/portfolio/history/portfolioHistoryService';
import assetFocusService from '@/service/domain/dashboard/assetFocusService';
import analyticsService from '@/service/domain/analytics/calculations/financialAnalyticsService';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio/history';
import { AssetFocusTimeRange } from './dashboardSettingsSlice';

// Types for cached data
export interface CachedPortfolioHistory {
  timeRange: AssetFocusTimeRange;
  data: PortfolioHistoryPoint[];
  lastCalculated: string;
  inputHash: string; // Hash of input data to detect changes
}

export interface CachedAssetFocusData {
  assetsWithValues: unknown[]; // ReturnType of assetFocusService.calculateAssetFocusData
  portfolioSummary: unknown;
  lastCalculated: string;
  inputHash: string;
}

export interface CachedFinancialSummary {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  lastCalculated: string;
  inputHash: string;
}

export interface CalculatedDataState {
  portfolioHistory: {
    [K in AssetFocusTimeRange]?: CachedPortfolioHistory;
  };
  assetFocusData: CachedAssetFocusData | null;
  financialSummary: CachedFinancialSummary | null;
  
  // Cache status tracking
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // Cache invalidation settings
  cacheValidityDuration: number; // in milliseconds, default 5 minutes
  enableConditionalLogging: boolean; // Feature flag for reduced logging
  
  // Store hydration tracking
  isHydrated: boolean; // Track if store has been hydrated from localStorage
}

const initialState: CalculatedDataState = {
  portfolioHistory: {},
  assetFocusData: null,
  financialSummary: null,
  status: 'idle',
  error: null,
  cacheValidityDuration: 5 * 60 * 1000, // 5 minutes
  enableConditionalLogging: true,
  isHydrated: false
};

// Helper function to create input hash for cache invalidation
const createInputHash = (data: unknown): string => {
  return JSON.stringify(data);
};

// Helper function to check if cache is valid
const isCacheValid = (lastCalculated: string, validityDuration: number): boolean => {
  const now = new Date().getTime();
  const cacheTime = new Date(lastCalculated).getTime();
  return (now - cacheTime) < validityDuration;
};

// Async thunk for calculating portfolio history with caching
export const calculatePortfolioHistory = createAsyncThunk(
  'calculatedData/calculatePortfolioHistory',
  async (
    { timeRange }: { timeRange: AssetFocusTimeRange },
    { getState }
  ) => {
    const state = getState() as StoreState;
    const { assets, assetDefinitions } = state.transactions.items && state.assetDefinitions.items ? 
      { assets: state.transactions.items, assetDefinitions: state.assetDefinitions.items } :
      { assets: [], assetDefinitions: [] };
    
    const inputData = { assets, assetDefinitions, timeRange };
    const inputHash = createInputHash(inputData);
    
    // Check if we have valid cached data
    const existingCache = state.calculatedData.portfolioHistory[timeRange];
    const isValid = existingCache && 
      existingCache.inputHash === inputHash &&
      isCacheValid(existingCache.lastCalculated, state.calculatedData.cacheValidityDuration);
    
    if (isValid) {
      Logger.cache(`Portfolio history cache hit for timeRange: ${timeRange}`);
      return existingCache;
    }
    
    Logger.cache(`Calculating portfolio history for timeRange: ${timeRange}`);
    
    const fullHistory = portfolioHistoryService.calculatePortfolioHistory(assets, assetDefinitions);
    
    // Filter history based on selected time range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1D':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1W':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'ALL':
      default:
        return {
          timeRange,
          data: fullHistory,
          lastCalculated: new Date().toISOString(),
          inputHash
        };
    }
    
    const filteredHistory = fullHistory.filter(point => 
      new Date(point.date) >= startDate
    );
    
    return {
      timeRange,
      data: filteredHistory,
      lastCalculated: new Date().toISOString(),
      inputHash
    };
  }
);

// Async thunk for calculating asset focus data with caching
export const calculateAssetFocusData = createAsyncThunk(
  'calculatedData/calculateAssetFocusData',
  async (_, { getState }) => {
    const state = getState() as StoreState;
    const { assets, assetDefinitions } = state.transactions.items && state.assetDefinitions.items ? 
      { assets: state.transactions.items, assetDefinitions: state.assetDefinitions.items } :
      { assets: [], assetDefinitions: [] };
    
    const inputData = { assets, assetDefinitions };
    const inputHash = createInputHash(inputData);
    
    // Check if we have valid cached data
    const existingCache = state.calculatedData.assetFocusData;
    const isValid = existingCache && 
      existingCache.inputHash === inputHash &&
      isCacheValid(existingCache.lastCalculated, state.calculatedData.cacheValidityDuration);
    
    if (isValid) {
      Logger.cache(`Asset focus data cache hit`);
      return existingCache;
    }
    
    Logger.cache(`Calculating asset focus data`);
    
    const result = assetFocusService.calculateAssetFocusData(assets, assetDefinitions);
    
    return {
      ...result,
      lastCalculated: new Date().toISOString(),
      inputHash
    };
  }
);

// Async thunk for calculating financial summary with caching
export const calculateFinancialSummary = createAsyncThunk(
  'calculatedData/calculateFinancialSummary',
  async (_, { getState }) => {
    const state = getState() as StoreState;
    const { assets } = state.transactions.items ? { assets: state.transactions.items } : { assets: [] };
    const { items: assetDefinitions } = state.assetDefinitions || { items: [] };
    const { items: liabilities } = state.liabilities || { items: [] };
    const { items: expenses } = state.expenses || { items: [] };
    const { items: income } = state.income || { items: [] };
    
    const inputData = { assets, assetDefinitions, liabilities, expenses, income };
    const inputHash = createInputHash(inputData);
    
    // Check if we have valid cached data
    const existingCache = state.calculatedData.financialSummary;
    const isValid = existingCache && 
      existingCache.inputHash === inputHash &&
      isCacheValid(existingCache.lastCalculated, state.calculatedData.cacheValidityDuration);
    
    if (isValid) {
      Logger.cache(`Financial summary cache hit`);
      return existingCache;
    }
    
    Logger.cache(`Calculating financial summary`);
    
    const result = analyticsService.calculateFinancialSummary(
      assets, 
      liabilities, 
      expenses, 
      income, 
      assetDefinitions
    );
    
    return {
      ...result,
      lastCalculated: new Date().toISOString(),
      inputHash
    };
  }
);

const calculatedDataSlice = createSlice({
  name: 'calculatedData',
  initialState,
  reducers: {
    // Clear all cached data
    clearAllCache: (state) => {
      state.portfolioHistory = {};
      state.assetFocusData = null;
      state.financialSummary = null;
      Logger.cache('Cleared all calculated data cache');
    },
    
    // Clear specific portfolio history cache
    clearPortfolioHistoryCache: (state, action: PayloadAction<AssetFocusTimeRange>) => {
      delete state.portfolioHistory[action.payload];
      Logger.cache(`Cleared portfolio history cache for timeRange: ${action.payload}`);
    },
    
    // Update cache validity duration
    setCacheValidityDuration: (state, action: PayloadAction<number>) => {
      state.cacheValidityDuration = action.payload;
    },
    
    // Toggle conditional logging
    toggleConditionalLogging: (state) => {
      state.enableConditionalLogging = !state.enableConditionalLogging;
      Logger.cache(`Conditional logging ${state.enableConditionalLogging ? 'enabled' : 'disabled'}`);
    },
    
    // Mark store as hydrated from localStorage
    markStoreHydrated: (state) => {
      state.isHydrated = true;
      Logger.cache('Store marked as hydrated from localStorage');
    },
    
    // Force refresh of all data (invalidate cache)
    invalidateAllCache: (state) => {
      // Guard: ensure portfolioHistory is always an object
      if (!state.portfolioHistory || typeof state.portfolioHistory !== 'object') {
        Logger.warn('portfolioHistory was undefined/null in invalidateAllCache, resetting to {}');
        state.portfolioHistory = {};
      }
      Object.keys(state.portfolioHistory).forEach(timeRange => {
        const key = timeRange as AssetFocusTimeRange;
        if (state.portfolioHistory[key]) {
          state.portfolioHistory[key]!.lastCalculated = new Date(0).toISOString();
        }
      });
      if (state.assetFocusData) {
        state.assetFocusData.lastCalculated = new Date(0).toISOString();
      }
      if (state.financialSummary) {
        state.financialSummary.lastCalculated = new Date(0).toISOString();
      }
      Logger.cache('Invalidated all calculated data cache');
    },
    
    // Validate cache on startup (check if cache is still valid after localStorage load)
    validateCacheOnStartup: (state) => {
      let invalidatedCount = 0;
      // Defensive: falls portfolioHistory nicht gesetzt ist, als leeres Objekt behandeln
      const portfolioHistory = state.portfolioHistory || {};
      Object.keys(portfolioHistory).forEach(timeRange => {
        const key = timeRange as AssetFocusTimeRange;
        const cache = portfolioHistory[key];
        if (cache && !isCacheValid(cache.lastCalculated, state.cacheValidityDuration)) {
          delete state.portfolioHistory[key];
          invalidatedCount++;
        }
      });
      
      // Check asset focus data cache
      if (state.assetFocusData && !isCacheValid(state.assetFocusData.lastCalculated, state.cacheValidityDuration)) {
        state.assetFocusData = null;
        invalidatedCount++;
      }
      
      // Check financial summary cache
      if (state.financialSummary && !isCacheValid(state.financialSummary.lastCalculated, state.cacheValidityDuration)) {
        state.financialSummary = null;
        invalidatedCount++;
      }
      
      if (invalidatedCount > 0) {
        Logger.cache(`Validated cache on startup: invalidated ${invalidatedCount} expired caches`);
      } else if (state.enableConditionalLogging) {
        Logger.cache('Validated cache on startup: all caches still valid');
      }
    }
  },
  extraReducers: (builder) => {
    // Portfolio History
    builder
      .addCase(calculatePortfolioHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(calculatePortfolioHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const timeRange = action.payload.timeRange as AssetFocusTimeRange;
        state.portfolioHistory[timeRange] = action.payload;
      })
      .addCase(calculatePortfolioHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to calculate portfolio history';
      })
      
      // Asset Focus Data
      .addCase(calculateAssetFocusData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(calculateAssetFocusData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assetFocusData = action.payload;
      })
      .addCase(calculateAssetFocusData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to calculate asset focus data';
      })
      
      // Financial Summary
      .addCase(calculateFinancialSummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(calculateFinancialSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.financialSummary = action.payload;
      })
      .addCase(calculateFinancialSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to calculate financial summary';
      });
  }
});

export const {
  clearAllCache,
  clearPortfolioHistoryCache,
  setCacheValidityDuration,
  toggleConditionalLogging,
  invalidateAllCache,
  validateCacheOnStartup,
  markStoreHydrated
} = calculatedDataSlice.actions;

// Selectors for accessing cached data
export const selectPortfolioHistory = (timeRange: AssetFocusTimeRange) => (state: StoreState) => 
  state.calculatedData?.portfolioHistory?.[timeRange];

export const selectAssetFocusData = (state: StoreState) => 
  state.calculatedData?.assetFocusData;

export const selectFinancialSummary = (state: StoreState) => 
  state.calculatedData?.financialSummary;

export const selectCalculatedDataStatus = (state: StoreState) => 
  state.calculatedData?.status || 'idle';

export const selectCacheSettings = (state: StoreState) => ({
  cacheValidityDuration: state.calculatedData?.cacheValidityDuration || 5 * 60 * 1000,
  enableConditionalLogging: state.calculatedData?.enableConditionalLogging ?? true
});

export const selectIsStoreHydrated = (state: StoreState) => 
  state.calculatedData?.isHydrated || false;

export default calculatedDataSlice.reducer;
