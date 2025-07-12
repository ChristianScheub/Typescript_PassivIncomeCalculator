import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Transaction as Asset
} from '@/types/domains/assets/';
import { AssetDefinition, AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '@/types/domains/assets';
import { CachedDividends } from '@/types/domains/assets/calculations';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';
import { AssetFocusTimeRange } from '@/types/shared/analytics';
import { calculatePortfolioPositions, calculatePortfolioTotals } from '@service/domain/portfolio/management/portfolioService/portfolioCalculations';
import portfolioHistoryService from '@service/domain/portfolio/history/portfolioHistoryService';
import assetFocusService from '@service/domain/dashboard/assetFocusService';
import analyticsService from '@service/domain/analytics/calculations/financialAnalyticsService';
import portfolioIntradayService from '@service/infrastructure/sqlLitePortfolioHistory';
import sqliteService from '@service/infrastructure/sqlLiteService';
import { v4 as uuidv4 } from '@/utils/uuid';
import { generatePortfolioInputHash, simpleHash } from '@/utils/hashUtils';
import Logger from '@service/shared/logging/Logger/logger';
import { PortfolioCacheableState, createSliceLogger, standardReducerPatterns } from '../../common/slicePatterns';
import { AssetWithValue } from '@/types/domains/portfolio/assetWithValue';

// Consolidated Portfolio Cache - Single Source of Truth for all portfolio data
export interface ConsolidatedPortfolioCache {
  id?: string; // <-- Add this line to allow id property for cache identification
  // Core portfolio data
  positions: PortfolioPosition[];
  totals: {
    totalValue: number;
    totalInvestment: number;
    totalReturn: number;
    totalReturnPercentage: number;
    monthlyIncome: number;
    annualIncome: number;
    positionCount: number;
    transactionCount: number;
  };
  lastCalculated: string;
  confidence: number;
  inputHash: string; // <--- NEU: Hash für Forecast-Trigger
  
  // Extended cache data - consolidating all redundant caches
  history: {
    [K in AssetFocusTimeRange]?: {
      data: PortfolioHistoryPoint[];
      lastCalculated: string;
      inputHash: string;
    };
  };
  
  assetFocusData: {
    assetsWithValues: AssetWithValue[];
    portfolioSummary: unknown;
    lastCalculated: string;
    inputHash: string;
  } | null;
  
  financialSummary: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyCashFlow: number;
    lastCalculated: string;
    inputHash: string;
  } | null;
  
  intradayData: {
    data: Array<{ date: string; value: number; timestamp: string }>;
    lastCalculated: string;
    cacheKey: string;
  } | null;
  
  // Cache settings
  cacheValidityDuration: number; // in milliseconds
}

// Create logger for this slice
const logger = createSliceLogger('Transactions');

// Using standardized PortfolioCacheableState for transactions with portfolio cache
type TransactionsState = PortfolioCacheableState<Asset, ConsolidatedPortfolioCache>;

const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
  cache: undefined,
  lastCalculated: undefined,
  calculationMetadata: {
    lastCalculated: '',
    totalValue: 0,
    totalInvestment: 0,
    totalReturn: 0,
    totalReturnPercentage: 0,
    assetDefinitions: [],
    categories: [],
    categoryOptions: [],
    categoryAssignments: []
  }
};

// Async Thunks
export const fetchTransactions = createAsyncThunk('transactions/fetchTransactions', async () => {
  Logger.infoRedux(logger.startOperation('fetch'));
  const result = await sqliteService.getAll('transactions');
  Logger.infoRedux(logger.completeOperation('fetch', `${result.length} entries retrieved`));
  return result;
});

export const addTransaction = createAsyncThunk('transactions/addTransaction', async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
  Logger.infoRedux(logger.startOperation('add'));
  const now = new Date().toISOString();
  const newAsset: Asset = {
    ...asset,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  };
  
  await sqliteService.add('transactions', newAsset);
  Logger.infoRedux(logger.completeOperation('add', `ID: ${newAsset.id}`));
  
  return newAsset;
});

export const updateTransaction = createAsyncThunk('transactions/updateTransaction', async (asset: Asset) => {
  Logger.infoRedux(logger.startOperation('update', `for ID: ${asset.id}`));
  const updatedAsset: Asset = {
    ...asset,
    updatedAt: new Date().toISOString()
  };
  
  await sqliteService.update('transactions', updatedAsset);
  Logger.infoRedux(logger.completeOperation('update', `ID: ${asset.id}`));
  
  return updatedAsset;
});

export const deleteTransaction = createAsyncThunk('transactions/deleteTransaction', async (id: string) => {
  Logger.infoRedux(logger.startOperation('delete', `for ID: ${id}`));
  await sqliteService.remove('transactions', id);
  Logger.infoRedux(logger.completeOperation('delete', `ID: ${id}`));
  return id;
});

export const calculatePortfolioData = createAsyncThunk(
  'transactions/calculatePortfolioData',
  async (payload: { 
    assetDefinitions: AssetDefinition[];
    categoryData: {
      categories: AssetCategory[];
      categoryOptions: AssetCategoryOption[];
      categoryAssignments: AssetCategoryAssignment[];
    };
  }, { getState }) => {
    const state = getState() as { transactions: TransactionsState };
    const assets = state.transactions.items;
    const { assetDefinitions, categoryData } = payload;
    
    Logger.infoRedux(logger.startOperation('portfolio calculation', `for ${assets.length} transactions, ${assetDefinitions.length} asset definitions`));
    
    // Calculate portfolio positions
    const positions = calculatePortfolioPositions(
      assets,
      assetDefinitions,
      categoryData.categories,
      categoryData.categoryOptions,
      categoryData.categoryAssignments
    );
    
    // Calculate totals
    const totals = calculatePortfolioTotals(positions);
    
    // InputHash für Forecast-Trigger berechnen
    const inputHash = generatePortfolioInputHash(assets, assetDefinitions);
    
    // Create the consolidated portfolio cache
    const portfolioCache: ConsolidatedPortfolioCache = {
      positions,
      totals,
      lastCalculated: new Date().toISOString(),
      confidence: 1.0,
      inputHash, // <--- NEU
      // Extended cache data - initially empty, will be populated by separate thunks
      history: {},
      assetFocusData: null,
      financialSummary: null,
      intradayData: null,
      cacheValidityDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    
    Logger.infoRedux(logger.completeOperation('portfolio calculation', `${positions.length} positions, total value: ${totals.totalValue}`));
    
    return portfolioCache;
  }
);

// Helper functions for cache validation
const createInputHash = (data: { assets: Asset[]; assetDefinitions: AssetDefinition[] }): string => {
  return generatePortfolioInputHash(data.assets, data.assetDefinitions);
};

const isCacheValid = (lastCalculated: string, validityDuration: number): boolean => {
  const now = new Date().getTime();
  const cacheTime = new Date(lastCalculated).getTime();
  return (now - cacheTime) < validityDuration;
};

// New consolidated thunks for extended cache calculations
export const calculatePortfolioHistory = createAsyncThunk(
  'transactions/calculatePortfolioHistory',
  async (
    { timeRange }: { timeRange: AssetFocusTimeRange },
    { getState }
  ) => {
    const state = getState() as { transactions: TransactionsState; assetDefinitions: { items: AssetDefinition[] } };
    const { assets, assetDefinitions } = {
      assets: state.transactions.items || [],
      assetDefinitions: state.assetDefinitions.items || []
    };
    
    const inputHash = createInputHash({ assets, assetDefinitions });
    
    // Check if we have valid cached data
    const existingCache = state.transactions.cache?.history[timeRange];
    if (existingCache && 
        existingCache.inputHash === inputHash &&
        isCacheValid(existingCache.lastCalculated, state.transactions.cache?.cacheValidityDuration || 7 * 24 * 60 * 60 * 1000)) {
      Logger.cache(`Portfolio history cache hit for timeRange: ${timeRange}`);
      return { timeRange, ...existingCache };
    }
    
    Logger.infoRedux(`Transactions: Starting portfolio history calculation for ${timeRange}`);
    
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

export const calculateAssetFocusData = createAsyncThunk(
  'transactions/calculateAssetFocusData',
  async (_, { getState }) => {
    const state = getState() as { transactions: TransactionsState; assetDefinitions: { items: AssetDefinition[] } };
    const { assets, assetDefinitions } = {
      assets: state.transactions.items || [],
      assetDefinitions: state.assetDefinitions.items || []
    };
    
    const inputHash = createInputHash({ assets, assetDefinitions });
    
    // Check if we have valid cached data
    const existingCache = state.transactions.cache?.assetFocusData;
    if (existingCache && 
        existingCache.inputHash === inputHash &&
        isCacheValid(existingCache.lastCalculated, state.transactions.cache?.cacheValidityDuration || 7 * 24 * 60 * 60 * 1000)) {
      Logger.cache(`Asset focus data cache hit`);
      return existingCache;
    }
    
    Logger.infoRedux('Transactions: Starting asset focus calculation');
    
    const result = assetFocusService.calculateAssetFocusData(assets, assetDefinitions);
    
    return {
      ...result,
      lastCalculated: new Date().toISOString(),
      inputHash
    };
  }
);

export const calculateFinancialSummary = createAsyncThunk(
  'transactions/calculateFinancialSummary',
  async (payload: {
    liabilities: any[];
    expenses: any[];
    income: any[];
  }, { getState }) => {
    const state = getState() as { transactions: TransactionsState; assetDefinitions: { items: AssetDefinition[] } };
    const { assets, assetDefinitions } = {
      assets: state.transactions.items || [],
      assetDefinitions: state.assetDefinitions.items || []
    };
    
    const inputHash = simpleHash([
      ...assets.map((a: any) => ({ id: a.id, updatedAt: a.updatedAt })),
      ...assetDefinitions.map((a: any) => ({ id: a.id, updatedAt: a.updatedAt })),
      ...payload.liabilities.map((l: any) => ({ id: l.id, updatedAt: l.updatedAt })),
      ...payload.expenses.map((e: any) => ({ id: e.id, updatedAt: e.updatedAt })),
      ...payload.income.map((i: any) => ({ id: i.id, updatedAt: i.updatedAt }))
    ]);
    
    // Check if we have valid cached data
    const existingCache = state.transactions.cache?.financialSummary;
    if (existingCache && 
        existingCache.inputHash === inputHash &&
        isCacheValid(existingCache.lastCalculated, state.transactions.cache?.cacheValidityDuration || 7 * 24 * 60 * 60 * 1000)) {
      Logger.cache(`Financial summary cache hit`);
      return existingCache;
    }
    
    Logger.infoRedux('Transactions: Starting financial summary calculation');
    
    const result = analyticsService.calculateFinancialSummary(
      assets,
      payload.liabilities,
      payload.expenses,
      payload.income,
      assetDefinitions  // Add missing assetDefinitions parameter
    );
    
    return {
      ...result,
      lastCalculated: new Date().toISOString(),
      inputHash
    };
  }
);

export const calculatePortfolioIntradayData = createAsyncThunk(
  'transactions/calculatePortfolioIntradayData',
  async (params: {
    portfolioCacheId: string;
    dateRange?: { start: string; end: string };
  }, { getState }) => {
    const state = getState() as { transactions: TransactionsState };
    const positions = state.transactions.cache?.positions || [];
    
    const cacheKey = `${params.portfolioCacheId}-${positions.length}`;
    
    // Check if we have valid cached data
    const existingCache = state.transactions.cache?.intradayData;
    if (existingCache && 
        existingCache.cacheKey === cacheKey &&
        isCacheValid(existingCache.lastCalculated, state.transactions.cache?.cacheValidityDuration || 7 * 24 * 60 * 60 * 1000)) {
      Logger.cache(`Portfolio intraday data cache hit`);
      return existingCache;
    }
    
    Logger.infoRedux('Transactions: Starting portfolio intraday calculation');
    
    try {
      let portfolioData: any[] = [];
      
      if (params.dateRange) {
        portfolioData = await portfolioIntradayService.getPortfolioIntradayByDateRange(
          params.dateRange.start, 
          params.dateRange.end
        );
      } else {
        portfolioData = await portfolioIntradayService.getAll('portfolioIntradayData') as any[];
      }
      
      const convertedData = portfolioData.map(point => ({
        date: point.date,
        value: point.value,
        timestamp: new Date(point.timestamp).toISOString()
      }));
      
      return {
        data: convertedData,
        lastCalculated: new Date().toISOString(),
        cacheKey
      };
    } catch (error) {
      Logger.error('Failed to calculate portfolio intraday data: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }
);

// Slice
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearAllTransactions: (state) => {
      state.items = [];
      state.cache = undefined;
      state.lastCalculated = undefined;
    },
    invalidatePortfolioCache: (state) => {
      state.cache = undefined;
      state.lastCalculated = undefined;
    },
    setPortfolioCache: (state, action: PayloadAction<{ cache: ConsolidatedPortfolioCache; timestamp: string }>) => {
      state.cache = action.payload.cache;
      state.lastCalculated = action.payload.timestamp;
    },
    updateAssetCache: (state, action: PayloadAction<{ assetId: string; cachedDividends: CachedDividends }>) => {
      const { assetId, cachedDividends } = action.payload;
      const assetIndex = state.items.findIndex(item => item.id === assetId);
      if (assetIndex !== -1) {
        state.items[assetIndex] = {
          ...state.items[assetIndex],
          cachedDividends
        };
        Logger.cache(`Updated dividend cache for asset ${assetId}`);
      }
    },
    
    // Extended cache management actions
    invalidatePortfolioHistory: (state, action: PayloadAction<AssetFocusTimeRange>) => {
      if (state.cache?.history) {
        delete state.cache.history[action.payload];
        Logger.cache(`Invalidated portfolio history cache for ${action.payload}`);
      }
    },
    invalidateAssetFocusData: (state) => {
      if (state.cache) {
        state.cache.assetFocusData = null;
        Logger.cache('Invalidated asset focus data cache');
      }
    },
    invalidateFinancialSummary: (state) => {
      if (state.cache) {
        state.cache.financialSummary = null;
        Logger.cache('Invalidated financial summary cache');
      }
    },
    invalidatePortfolioIntradayData: (state) => {
      if (state.cache) {
        state.cache.intradayData = null;
        Logger.cache('Invalidated portfolio intraday data cache');
      }
    },
    invalidateAllCaches: (state) => {
      if (state.cache) {
        state.cache.history = {};
        state.cache.assetFocusData = null;
        state.cache.financialSummary = null;
        state.cache.intradayData = null;
        Logger.cache('Invalidated all extended caches');
      }
    },
    setCacheValidityDuration: (state, action: PayloadAction<number>) => {
      if (state.cache) {
        state.cache.cacheValidityDuration = action.payload;
      }
    },
    
    // Portfolio intraday data management actions
    setIntradayData: (state, action: PayloadAction<any>) => {
      if (state.cache) {
        state.cache.intradayData = action.payload;
        Logger.cache('Set portfolio intraday data in cache');
      }
    },
    setIntradayStatus: (_state, action: PayloadAction<string>) => {
      // For backward compatibility, just log the status change
      Logger.cache(`Portfolio intraday status: ${action.payload}`);
    },
    setIntradayError: (_state, action: PayloadAction<string | null>) => {
      // For backward compatibility, just log the error
      if (action.payload) {
        Logger.error(`Portfolio intraday error: ${action.payload}`);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, standardReducerPatterns.pending)
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to fetch transactions';
        Logger.infoRedux(logger.failOperation('fetch', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Add transaction
      .addCase(addTransaction.pending, standardReducerPatterns.pending)
      .addCase(addTransaction.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items.push(action.payload);
        // Invalidate cache when data changes
        standardReducerPatterns.invalidatePortfolioCache(state);
      })
      .addCase(addTransaction.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to add transaction';
        Logger.infoRedux(logger.failOperation('add', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, standardReducerPatterns.pending)
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          // Invalidate cache when data changes
          standardReducerPatterns.invalidatePortfolioCache(state);
        }
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to update transaction';
        Logger.infoRedux(logger.failOperation('update', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Delete transaction
      .addCase(deleteTransaction.pending, standardReducerPatterns.pending)
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        // Invalidate cache when data changes
        standardReducerPatterns.invalidatePortfolioCache(state);
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to delete transaction';
        Logger.infoRedux(logger.failOperation('delete', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Calculate portfolio data
      .addCase(calculatePortfolioData.pending, standardReducerPatterns.pending)
      .addCase(calculatePortfolioData.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.cache = action.payload;
        state.lastCalculated = action.payload.lastCalculated;
        Logger.infoRedux(logger.cacheUpdate('portfolio calculation'));
      })
      .addCase(calculatePortfolioData.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to calculate portfolio data';
        Logger.infoRedux(logger.failOperation('portfolio calculation', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Calculate portfolio history
      .addCase(calculatePortfolioHistory.pending, standardReducerPatterns.pending)
      .addCase(calculatePortfolioHistory.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        if (state.cache) {
          const { timeRange, data, lastCalculated, inputHash } = action.payload;
          state.cache.history[timeRange] = { data, lastCalculated, inputHash };
          Logger.infoRedux(logger.cacheUpdate(`portfolio history for ${timeRange}`));
        }
      })
      .addCase(calculatePortfolioHistory.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to calculate portfolio history';
        Logger.infoRedux(logger.failOperation('portfolio history calculation', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Calculate asset focus data
      .addCase(calculateAssetFocusData.pending, standardReducerPatterns.pending)
      .addCase(calculateAssetFocusData.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        if (state.cache) {
          state.cache.assetFocusData = action.payload;
          Logger.infoRedux(logger.cacheUpdate('asset focus data'));
        }
      })
      .addCase(calculateAssetFocusData.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to calculate asset focus data';
        Logger.infoRedux(logger.failOperation('asset focus calculation', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Calculate financial summary
      .addCase(calculateFinancialSummary.pending, standardReducerPatterns.pending)
      .addCase(calculateFinancialSummary.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        if (state.cache) {
          state.cache.financialSummary = action.payload;
          Logger.infoRedux(logger.cacheUpdate('financial summary'));
        }
      })
      .addCase(calculateFinancialSummary.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to calculate financial summary';
        Logger.infoRedux(logger.failOperation('financial summary calculation', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Calculate portfolio intraday data
      .addCase(calculatePortfolioIntradayData.pending, standardReducerPatterns.pending)
      .addCase(calculatePortfolioIntradayData.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        if (state.cache) {
          state.cache.intradayData = action.payload;
          Logger.infoRedux(logger.cacheUpdate('portfolio intraday data'));
        }
      })
      .addCase(calculatePortfolioIntradayData.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to calculate portfolio intraday data';
        Logger.infoRedux(logger.failOperation('portfolio intraday calculation', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      });
  },
});

// Export actions
export const {
  clearAllTransactions,
  invalidatePortfolioCache,
  setPortfolioCache,
  updateAssetCache,
  
  // Extended cache management actions
  invalidatePortfolioHistory,
  invalidateAssetFocusData,
  invalidateFinancialSummary,
  invalidatePortfolioIntradayData,
  invalidateAllCaches,
  setCacheValidityDuration,
  
  // Portfolio intraday data actions
  setIntradayData,
  setIntradayStatus,
  setIntradayError
} = transactionsSlice.actions;

// Core selectors
export const selectTransactions = (state: { transactions: TransactionsState }) => state.transactions.items;
export const selectTransactionsStatus = (state: { transactions: TransactionsState }) => state.transactions.status;
export const selectPortfolioCache = (state: { transactions: TransactionsState }) => state.transactions.cache;
export const selectPortfolioTotals = (state: { transactions: TransactionsState }) => 
  state.transactions.cache?.totals;
export const selectSortedTransactions = (state: { transactions: TransactionsState }) => 
  [...state.transactions.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// Extended cache selectors - konsolidiert
export const selectPortfolioHistory = (timeRange: AssetFocusTimeRange) => (state: { transactions: TransactionsState }) =>
  state.transactions.cache?.history[timeRange];

export const selectAssetFocusData = (state: { transactions: TransactionsState }) =>
  state.transactions.cache?.assetFocusData;

export const selectFinancialSummary = (state: { transactions: TransactionsState }) =>
  state.transactions.cache?.financialSummary;

export const selectPortfolioIntradayData = (state: { transactions: TransactionsState }) =>
  state.transactions.cache?.intradayData;

export default transactionsSlice.reducer;
