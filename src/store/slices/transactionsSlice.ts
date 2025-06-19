import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Transaction as Asset
} from '../../types/domains/assets/';
import { AssetDefinition, AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '../../types/domains/assets';
import { PortfolioPosition } from '../../types/domains/portfolio/position';
import { TransactionsState } from '../../types/domains/financial/state';
import { calculatePortfolioPositions, calculatePortfolioTotals } from '../../service/portfolioService/portfolioCalculations';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';
import Logger from '../../service/Logger/logger';

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

const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
  portfolioCache: undefined,
  portfolioCacheValid: false,
  lastPortfolioCalculation: undefined,
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
  Logger.infoRedux('Fetching all transactions from SQLite');
  return await sqliteService.getAll('transactions');
});

export const addTransaction = createAsyncThunk('transactions/addTransaction', async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const newAsset: Asset = {
    ...asset,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  };
  
  await sqliteService.add('transactions', newAsset);
  Logger.infoRedux('Transaction saved to storage successfully');
  
  return newAsset;
});

export const updateTransaction = createAsyncThunk('transactions/updateTransaction', async (asset: Asset) => {
  const updatedAsset: Asset = {
    ...asset,
    updatedAt: new Date().toISOString()
  };
  
  await sqliteService.update('transactions', updatedAsset);
  Logger.infoRedux('Transaction updated successfully');
  
  return updatedAsset;
});

export const deleteTransaction = createAsyncThunk('transactions/deleteTransaction', async (id: string) => {
  Logger.infoRedux('Deleting transaction with ID: ' + id);
  await sqliteService.remove('transactions', id);
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
    
    Logger.infoRedux(`Calculating portfolio data: ${assets.length} transactions, ${assetDefinitions.length} asset definitions`);
    
    // Debug: Log first few assets and definitions
    if (assets.length > 0) {
      Logger.infoRedux(`First transaction: ${JSON.stringify(assets[0])}`);
    }
    if (assetDefinitions.length > 0) {
      Logger.infoRedux(`First asset definition: ${JSON.stringify(assetDefinitions[0])}`);
    }
    
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
    
    Logger.infoRedux('Portfolio calculation completed');
    
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
      state.portfolioCache = undefined;
      state.portfolioCacheValid = false;
      state.lastPortfolioCalculation = undefined;
    },
    invalidatePortfolioCache: (state) => {
      state.portfolioCache = undefined;
      state.portfolioCacheValid = false;
      state.lastPortfolioCalculation = undefined;
    },
    setPortfolioCache: (state, action: PayloadAction<{ cache: PortfolioCache; timestamp: string }>) => {
      state.portfolioCache = action.payload.cache;
      state.portfolioCacheValid = true;
      state.lastPortfolioCalculation = action.payload.timestamp;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      
      // Add transaction
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.portfolioCache = undefined;
        state.portfolioCacheValid = false;
        state.lastPortfolioCalculation = undefined;
      })
      
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.portfolioCache = undefined;
          state.portfolioCacheValid = false;
          state.lastPortfolioCalculation = undefined;
        }
      })
      
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.portfolioCache = undefined;
        state.portfolioCacheValid = false;
        state.lastPortfolioCalculation = undefined;
      })
      
      // Calculate portfolio data
      .addCase(calculatePortfolioData.fulfilled, (state, action) => {
        state.portfolioCache = action.payload;
        state.portfolioCacheValid = true;
        state.lastPortfolioCalculation = action.payload.lastCalculated;
      });
  },
});

// Export actions
export const {
  clearAllTransactions,
  invalidatePortfolioCache,
  setPortfolioCache
} = transactionsSlice.actions;

// Selectors
export const selectTransactions = (state: { transactions: TransactionsState }) => state.transactions.items;
export const selectTransactionsStatus = (state: { transactions: TransactionsState }) => state.transactions.status;
export const selectPortfolioCache = (state: { transactions: TransactionsState }) => state.transactions.portfolioCache;
export const selectPortfolioCacheValid = (state: { transactions: TransactionsState }) => state.transactions.portfolioCacheValid;
export const selectLastPortfolioCalculation = (state: { transactions: TransactionsState }) => state.transactions.lastPortfolioCalculation;

// Derived selectors
export const selectPortfolioTotals = (state: { transactions: TransactionsState }) => 
  state.transactions.portfolioCache?.totals;
export const selectSortedAssets = (state: { transactions: TransactionsState }) => 
  [...state.transactions.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// Legacy exports for backward compatibility
export const fetchAssets = fetchTransactions;
export const addAsset = addTransaction;
export const updateAsset = updateTransaction;
export const deleteAsset = deleteTransaction;
export const selectAssets = selectTransactions;
export const selectAssetsStatus = selectTransactionsStatus;
export const clearAllAssets = clearAllTransactions;

export default transactionsSlice.reducer;
