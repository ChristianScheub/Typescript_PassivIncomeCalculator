import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Asset, CachedDividends, AssetDefinition } from '../../types';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';
import Logger from '../../service/Logger/logger';
import { shouldInvalidateCache } from '../../utils/dividendCacheUtils';
import { hydrateStore } from '../actions/hydrateAction';
import { calculatePortfolioPositions, PortfolioPosition } from '../../service/portfolioService/portfolioCalculations';
import { getCurrentQuantity } from '../../utils/transactionCalculations';
import { formatCurrency } from '../../service/formatService/methods/formatCurrency';
import { formatPercentage } from '../../service/formatService/methods/formatPercentage';

interface PortfolioCache {
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
    // Pre-formatted values
    formatted: {
      totalValue: string;
      totalInvestment: string;
      totalReturn: string;
      totalReturnPercentage: string;
      monthlyIncome: string;
      annualIncome: string;
    };
  };
  metadata: {
    lastCalculated: string;
    assetCount: number;
    definitionCount: number;
    positionCount: number;
    assetHash: string; // Hash of asset data to detect changes
    definitionHash: string; // Hash of definition data to detect changes
    combinedHash: string; // Combined hash including category data
  };
}

interface AssetsState {
  items: Asset[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  // Cached portfolio calculations
  portfolioCache?: PortfolioCache;
  // Cache validity timestamps
  lastPortfolioCalculation?: string;
  portfolioCacheValid: boolean;
}

const initialState: AssetsState = {
  items: [],
  status: 'idle',
  error: null,
  portfolioCacheValid: false
};

// Async Thunks
export const fetchAssets = createAsyncThunk('assets/fetchAssets', async (_, { getState }) => {
  const state = getState() as { assets: AssetsState };
  
  // If we already have items (from localStorage), don't fetch from SQLite
  if (state.assets.items.length > 0) {
    Logger.infoRedux('Using assets from localStorage');
    return state.assets.items;
  }

  Logger.infoRedux('Fetching all assets from SQLite');
  return await sqliteService.getAll('assets');
});

export const addAsset = createAsyncThunk('assets/addAsset', async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    Logger.infoRedux(`Received asset data: ${JSON.stringify(asset)}`);
    
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...asset,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    Logger.infoRedux(`Asset with ID created: ${JSON.stringify(newAsset)}`);
    
    await sqliteService.add('assets', newAsset);
    Logger.infoRedux(`Asset saved to storage successfully`);
    
    return newAsset;
  } catch (error) {
    Logger.infoRedux(`Failed to add asset: ${JSON.stringify(error)}`);
    throw error;
  }
});

export const updateAsset = createAsyncThunk('assets/updateAsset', async (asset: Asset, { getState }) => {
  const state = getState() as { assets: AssetsState };
  const oldAsset = state.assets.items.find(a => a.id === asset.id);
  
  const updatedAsset: Asset = {
    ...asset,
    updatedAt: new Date().toISOString()
  };
  
  // Clear cache if dividend-relevant data changed
  if (oldAsset && shouldInvalidateCache(oldAsset, updatedAsset)) {
    updatedAsset.cachedDividends = undefined;
    Logger.infoRedux('Cache invalidated due to dividend-relevant data change');
  } else if (oldAsset?.cachedDividends) {
    // Keep existing cache if data didn't change
    updatedAsset.cachedDividends = oldAsset.cachedDividends;
    Logger.infoRedux('Keeping existing dividend cache');
  }
  
  await sqliteService.update('assets', updatedAsset);
  Logger.infoRedux(`Asset updated successfully: ${JSON.stringify(updatedAsset)}`);
  return updatedAsset;
});

export const deleteAsset = createAsyncThunk('assets/deleteAsset', async (id: string) => {
  Logger.infoRedux(`Deleting asset with ID: ${id}`);
  await sqliteService.remove('assets', id);
  return id;
});

// New action to calculate portfolio data
export const calculatePortfolioData = createAsyncThunk(
  'assets/calculatePortfolioData',
  async (params: { 
    assetDefinitions: AssetDefinition[], 
    categoryData?: { 
      categories: any[], 
      categoryOptions: any[], 
      categoryAssignments: any[] 
    } 
  }, { getState }) => {
    const state = getState() as { assets: AssetsState };
    const assets = state.assets.items;
    const { assetDefinitions, categoryData } = params;
    
    Logger.infoRedux(`Calculating portfolio data for ${assets.length} assets and ${assetDefinitions.length} definitions`);
    
    // Generate hashes to detect changes - inline implementation for simplicity
    const generateHash = (obj: any): string => {
      const str = JSON.stringify(obj);
      let hash = 0;
      if (str.length === 0) return hash.toString();
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    };
    
    const assetData = assets.map(a => ({ 
      id: a.id, 
      quantity: getCurrentQuantity(a), // Use helper function instead of accessing currentQuantity directly
      price: a.purchasePrice, // Use only purchasePrice from transaction
      updatedAt: a.updatedAt 
    }));
    const definitionData = assetDefinitions.map(d => ({ 
      id: d.id, 
      dividendInfo: d.dividendInfo, 
      updatedAt: d.updatedAt 
    }));
    const categoryDataHash = categoryData ? generateHash({
      categories: categoryData.categories,
      categoryOptions: categoryData.categoryOptions,
      categoryAssignments: categoryData.categoryAssignments
    }) : '';
    
    const assetHash = generateHash(assetData);
    const definitionHash = generateHash(definitionData);
    const combinedHash = generateHash({ assetHash, definitionHash, categoryDataHash });
    
    // Check if cache is still valid
    const currentCache = state.assets.portfolioCache;
    if (currentCache && 
        currentCache.metadata.assetHash === assetHash && 
        currentCache.metadata.definitionHash === definitionHash &&
        currentCache.metadata.combinedHash === combinedHash &&
        state.assets.portfolioCacheValid) {
      Logger.infoRedux('Portfolio cache is still valid, skipping calculation');
      return currentCache;
    }
    
    // Calculate portfolio positions with category data
    const positions = categoryData 
      ? calculatePortfolioPositions(
          assets, 
          assetDefinitions, 
          categoryData.categories, 
          categoryData.categoryOptions, 
          categoryData.categoryAssignments
        )
      : calculatePortfolioPositions(assets, assetDefinitions);
    
    // Calculate totals
    const totals = {
      totalValue: positions.reduce((sum, pos) => sum + pos.currentValue, 0),
      totalInvestment: positions.reduce((sum, pos) => sum + pos.totalInvestment, 0),
      totalReturn: positions.reduce((sum, pos) => sum + pos.totalReturn, 0),
      totalReturnPercentage: 0, // Will be calculated below
      monthlyIncome: positions.reduce((sum, pos) => sum + pos.monthlyIncome, 0),
      annualIncome: positions.reduce((sum, pos) => sum + pos.annualIncome, 0),
      positionCount: positions.length,
      transactionCount: assets.length,
      // Pre-format totals for UI
      formatted: {
        totalValue: '',
        totalInvestment: '',
        totalReturn: '',
        totalReturnPercentage: '',
        monthlyIncome: '',
        annualIncome: '',
      }
    };
    
    // Calculate total return percentage
    totals.totalReturnPercentage = totals.totalInvestment > 0 
      ? (totals.totalReturn / totals.totalInvestment) * 100 
      : 0;
    
    // Format all totals once for UI
    totals.formatted = {
      totalValue: formatCurrency(totals.totalValue),
      totalInvestment: formatCurrency(Math.abs(totals.totalInvestment)),
      totalReturn: formatCurrency(totals.totalReturn),
      totalReturnPercentage: formatPercentage(totals.totalReturnPercentage),
      monthlyIncome: formatCurrency(totals.monthlyIncome),
      annualIncome: formatCurrency(totals.annualIncome),
    };
    
    const portfolioCache: PortfolioCache = {
      positions,
      totals,
      metadata: {
        lastCalculated: new Date().toISOString(),
        assetCount: assets.length,
        definitionCount: assetDefinitions.length,
        positionCount: positions.length,
        assetHash,
        definitionHash,
        combinedHash
      }
    };
    
    Logger.infoRedux(`Portfolio calculation completed: ${positions.length} positions, total value: ${totals.totalValue}`);
    return portfolioCache;
  }
);

// New action to update stock prices
export const updateStockPrices = createAsyncThunk('assets/updateStockPrices', 
  async (updatedStocks: Asset[]) => {
    try {
      Logger.infoRedux(`Updating prices for ${updatedStocks.length} stocks`);
      
      // Update each stock in SQLite
      for (const stock of updatedStocks) {
        await sqliteService.update('assets', stock);
      }
      
      return updatedStocks;
    } catch (error) {
      Logger.infoRedux(`Failed to update stock prices: ${JSON.stringify(error)}`);
      throw error;
    }
  }
);

// Slice
const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    // Cache management actions
    updateAssetDividendCache: (state, action: PayloadAction<{ assetId: string; cachedDividends: CachedDividends }>) => {
      const index = state.items.findIndex(asset => asset.id === action.payload.assetId);
      if (index !== -1) {
        state.items[index].cachedDividends = action.payload.cachedDividends;
      }
    },
    
    invalidateAssetDividendCache: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(asset => asset.id === action.payload);
      if (index !== -1) {
        state.items[index].cachedDividends = undefined;
      }
    },
    
    invalidateAllDividendCaches: (state) => {
      state.items.forEach(asset => {
        asset.cachedDividends = undefined;
      });
    },

    // Portfolio cache management
    invalidatePortfolioCache: (state) => {
      state.portfolioCacheValid = false;
      Logger.infoRedux('Portfolio cache invalidated');
    },

    // Clear all assets action
    clearAllAssets: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.portfolioCache = undefined;
      state.portfolioCacheValid = false;
      state.lastPortfolioCalculation = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateStore, (state, action) => {
        if (action.payload.assets) {
          return {
            ...state,
            ...action.payload.assets,
            status: 'idle',
            error: null
          };
        }
        return state;
      })
      // Fetch assets
      .addCase(fetchAssets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch assets';
      })
      
      // Add asset
      .addCase(addAsset.pending, (state) => {
        Logger.infoRedux('Asset add operation pending');
        state.status = 'loading';
      })
      .addCase(addAsset.fulfilled, (state, action) => {
        Logger.infoRedux(`Asset added successfully: ${JSON.stringify(action.payload)}`);
        state.status = 'succeeded';
        state.items.push(action.payload);
        // Invalidate portfolio cache when new asset is added
        state.portfolioCacheValid = false;
      })
      .addCase(addAsset.rejected, (state, action) => {
        Logger.infoRedux(`Failed to add asset: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add asset';
      })
      
      // Update asset
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.items.findIndex(asset => asset.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          // Invalidate portfolio cache when asset is updated
          state.portfolioCacheValid = false;
        }
      })
      
      // Delete asset
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.items = state.items.filter(asset => asset.id !== action.payload);
        // Invalidate portfolio cache when asset is deleted
        state.portfolioCacheValid = false;
      })

      // Calculate portfolio data
      .addCase(calculatePortfolioData.pending, () => {
        // Don't change loading state for portfolio calculations to avoid UI flicker
        Logger.infoRedux('Portfolio calculation pending');
      })
      .addCase(calculatePortfolioData.fulfilled, (state, action) => {
        state.portfolioCache = action.payload;
        state.portfolioCacheValid = true;
        state.lastPortfolioCalculation = new Date().toISOString();
        Logger.infoRedux('Portfolio calculation completed and cached');
      })
      .addCase(calculatePortfolioData.rejected, (state, action) => {
        state.portfolioCacheValid = false;
        Logger.infoRedux(`Portfolio calculation failed: ${action.error.message}`);
      })
      
      // Update stock prices
      .addCase(updateStockPrices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateStockPrices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the prices in state
        action.payload.forEach(updatedStock => {
          const index = state.items.findIndex(item => item.id === updatedStock.id);
          if (index !== -1) {
            state.items[index] = updatedStock;
          }
        });
        // Invalidate portfolio cache when prices are updated
        state.portfolioCacheValid = false;
      })
      .addCase(updateStockPrices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update stock prices';
      });
  }
});

export const { 
  updateAssetDividendCache, 
  invalidateAssetDividendCache, 
  invalidateAllDividendCaches, 
  invalidatePortfolioCache,
  clearAllAssets 
} = assetsSlice.actions;

// Selectors
export const selectAssets = (state: { assets: AssetsState }) => state.assets.items;
export const selectAssetsStatus = (state: { assets: AssetsState }) => state.assets.status;
export const selectPortfolioCache = (state: { assets: AssetsState }) => state.assets.portfolioCache;
export const selectPortfolioCacheValid = (state: { assets: AssetsState }) => state.assets.portfolioCacheValid;

// Memoized selectors for portfolio data
export const selectPortfolioPositions = (state: { assets: AssetsState }) => 
  state.assets.portfolioCache?.positions || [];

export const selectPortfolioTotals = (state: { assets: AssetsState }) => 
  state.assets.portfolioCache?.totals || {
    totalValue: 0,
    totalInvestment: 0,
    totalReturn: 0,
    totalReturnPercentage: 0,
    monthlyIncome: 0,
    annualIncome: 0,
    positionCount: 0,
    transactionCount: 0,
    formatted: {
      totalValue: '0,00 €',
      totalInvestment: '0,00 €',
      totalReturn: '0,00 €',
      totalReturnPercentage: '0,00%',
      monthlyIncome: '0,00 €',
      annualIncome: '0,00 €',
    }
  };

// NEW: Selector for formatted totals only
export const selectFormattedPortfolioTotals = (state: { assets: AssetsState }) => 
  state.assets.portfolioCache?.totals.formatted || {
    totalValue: '0,00 €',
    totalInvestment: '0,00 €',
    totalReturn: '0,00 €',
    totalReturnPercentage: '0,00%',
    monthlyIncome: '0,00 €',
    annualIncome: '0,00 €',
  };

export const selectSortedAssets = (state: { assets: AssetsState }) =>
  [...state.assets.items].sort((a, b) => 
    new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  );

export default assetsSlice.reducer;