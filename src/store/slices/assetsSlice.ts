import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Asset, CachedDividends } from '../../types';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';
import Logger from '../../service/Logger/logger';
import { shouldInvalidateCache } from '../../utils/dividendCacheUtils';

interface AssetsState {
  items: Asset[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AssetsState = {
  items: [],
  status: 'idle',
  error: null
};

// Async Thunks
export const fetchAssets = createAsyncThunk('assets/fetchAssets', async () => {
  return await sqliteService.getAll('assets');
});

export const addAsset = createAsyncThunk('assets/addAsset', async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    Logger.info(`Redux addAsset thunk - Received asset data: ${JSON.stringify(asset)}`);
    
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...asset,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    Logger.info(`Redux addAsset thunk - Asset with ID created: ${JSON.stringify(newAsset)}`);
    
    await sqliteService.add('assets', newAsset);
    Logger.info(`Redux addAsset thunk - Asset saved to storage successfully`);
    
    return newAsset;
  } catch (error) {
    Logger.error(`Redux addAsset thunk - Error: ${JSON.stringify(error)}`);
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
  } else if (oldAsset?.cachedDividends) {
    // Keep existing cache if data didn't change
    updatedAsset.cachedDividends = oldAsset.cachedDividends;
  }
  
  await sqliteService.update('assets', updatedAsset);
  return updatedAsset;
});

export const deleteAsset = createAsyncThunk('assets/deleteAsset', async (id: string) => {
  await sqliteService.remove('assets', id);
  return id;
});

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
    }
  },
  extraReducers: (builder) => {
    builder
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
        Logger.info('Redux addAsset pending');
        state.status = 'loading';
      })
      .addCase(addAsset.fulfilled, (state, action) => {
        Logger.info(`Redux addAsset fulfilled - Asset added: ${JSON.stringify(action.payload)}`);
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(addAsset.rejected, (state, action) => {
        Logger.error(`Redux addAsset rejected - Error: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add asset';
      })
      
      // Update asset
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.items.findIndex(asset => asset.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete asset
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.items = state.items.filter(asset => asset.id !== action.payload);
      });
  }
});

export const { updateAssetDividendCache, invalidateAssetDividendCache, invalidateAllDividendCaches } = assetsSlice.actions;

export default assetsSlice.reducer;