import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Transaction as Asset
} from '@/types/domains/assets/';
import { AssetDefinition, AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '@/types/domains/assets';
import { CachedDividends } from '@/types/domains/assets/calculations';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { calculatePortfolioPositions, calculatePortfolioTotals } from '@service/domain/portfolio/management/portfolioService/portfolioCalculations';
import sqliteService from '@service/infrastructure/sqlLiteService';
import { v4 as uuidv4 } from '@/utils/uuid';
import Logger from '@service/shared/logging/Logger/logger';
import { PortfolioCacheableState, createSliceLogger, standardReducerPatterns } from '../../common/slicePatterns';

export interface PortfolioCache {
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
}

// Create logger for this slice
const logger = createSliceLogger('Transactions');

// Using standardized PortfolioCacheableState for transactions with portfolio cache
type TransactionsState = PortfolioCacheableState<Asset, PortfolioCache>;

const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
  cache: undefined,
  cacheValid: false,
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
    
    // Create the portfolio cache
    const portfolioCache: PortfolioCache = {
      positions,
      totals,
      lastCalculated: new Date().toISOString(),
      confidence: 1.0
    };
    
    Logger.infoRedux(logger.completeOperation('portfolio calculation', `${positions.length} positions, total value: ${totals.totalValue}`));
    
    return portfolioCache;
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
      state.cacheValid = false;
      state.lastCalculated = undefined;
    },
    invalidatePortfolioCache: (state) => {
      state.cache = undefined;
      state.cacheValid = false;
      state.lastCalculated = undefined;
    },
    setPortfolioCache: (state, action: PayloadAction<{ cache: PortfolioCache; timestamp: string }>) => {
      state.cache = action.payload.cache;
      state.cacheValid = true;
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
        state.cacheValid = true;
        state.lastCalculated = action.payload.lastCalculated;
        Logger.infoRedux(logger.cacheUpdate('portfolio calculation'));
      })
      .addCase(calculatePortfolioData.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to calculate portfolio data';
        Logger.infoRedux(logger.failOperation('portfolio calculation', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      });
  },
});

// Export actions
export const {
  clearAllTransactions,
  invalidatePortfolioCache,
  setPortfolioCache,
  updateAssetCache
} = transactionsSlice.actions;

// Selectors
export const selectTransactions = (state: { transactions: TransactionsState }) => state.transactions.items;
export const selectTransactionsStatus = (state: { transactions: TransactionsState }) => state.transactions.status;
export const selectPortfolioCache = (state: { transactions: TransactionsState }) => state.transactions.cache;
export const selectPortfolioCacheValid = (state: { transactions: TransactionsState }) => state.transactions.cacheValid;
export const selectLastPortfolioCalculation = (state: { transactions: TransactionsState }) => state.transactions.lastCalculated;

// Derived selectors
export const selectPortfolioTotals = (state: { transactions: TransactionsState }) => 
  state.transactions.cache?.totals;
export const selectSortedTransactions = (state: { transactions: TransactionsState }) => 
  [...state.transactions.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export default transactionsSlice.reducer;
