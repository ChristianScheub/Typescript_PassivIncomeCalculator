import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PriceHistoryEntry, AssetDefinition } from '@/types/domains/assets';
import { PortfolioPosition } from '@/types/domains/portfolio';
import { getCurrentQuantity } from '../../utils/transactionCalculations';
import Logger from '@/service/shared/logging/Logger/logger';

// Types for our intraday data state
interface IntradayDataState {
  // Raw intraday price entries
  intradayEntries: PriceHistoryEntry[];
  intradayEntriesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  intradayEntriesError: string | null;
  intradayEntriesCacheKey: string | null;
  intradayEntriesLastUpdated: number | null;
  
  // Portfolio intraday data (aggregated)
  portfolioIntradayData: Array<{ date: string; value: number; timestamp: string }>;
  portfolioIntradayStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  portfolioIntradayError: string | null;
  portfolioIntradayCacheKey: string | null;
  portfolioIntradayLastUpdated: number | null;
  
  // Asset data mapping for quick lookups
  assetDataMap: Record<string, Record<string, PriceHistoryEntry>>;
  assetDataMapCacheKey: string | null;
}

const initialState: IntradayDataState = {
  intradayEntries: [],
  intradayEntriesStatus: 'idle',
  intradayEntriesError: null,
  intradayEntriesCacheKey: null,
  intradayEntriesLastUpdated: null,
  
  portfolioIntradayData: [],
  portfolioIntradayStatus: 'idle',
  portfolioIntradayError: null,
  portfolioIntradayCacheKey: null,
  portfolioIntradayLastUpdated: null,
  
  assetDataMap: {},
  assetDataMapCacheKey: null,
};

// Helper functions
const generateCacheKey = (assetDefinitions: AssetDefinition[]) => {
  return assetDefinitions
    .map(def => `${def.id}-${def.priceHistory?.length || 0}`)
    .sort()
    .join('|');
};

const generatePortfolioCacheKey = (
  portfolioCacheId: string,
  assetDefinitionsKey: string,
  intradayDataLength: number
) => {
  return `${portfolioCacheId}-${assetDefinitionsKey}-${intradayDataLength}`;
};

const isDataFresh = (lastUpdated: number | null, maxAgeMinutes: number = 30): boolean => {
  if (!lastUpdated) return false;
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
  return (now - lastUpdated) < maxAge;
};

// Async thunk for calculating intraday data
export const calculateIntradayData = createAsyncThunk(
  'intradayData/calculateIntradayData',
  async (assetDefinitions: AssetDefinition[], { getState }) => {
    const state = getState() as { intradayData: IntradayDataState };
    const cacheKey = generateCacheKey(assetDefinitions);
    
    // Check if we have fresh cached data
    if (
      state.intradayData.intradayEntriesCacheKey === cacheKey &&
      isDataFresh(state.intradayData.intradayEntriesLastUpdated) &&
      state.intradayData.intradayEntries.length > 0
    ) {
      Logger.cache(`Intraday data cache hit for key: ${cacheKey.substring(0, 50)}...`);
      return {
        intradayEntries: state.intradayData.intradayEntries,
        cacheKey,
        fromCache: true
      };
    }

    Logger.cache(`Calculating fresh intraday data for cache key: ${cacheKey.substring(0, 50)}...`);

    // Get last 5 days (including today)
    const today = new Date();
    const datesRange: string[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      datesRange.push(date.toISOString().split('T')[0]);
    }

    const intradayEntries: PriceHistoryEntry[] = [];

    assetDefinitions.forEach((definition: AssetDefinition) => {
      if (!definition.priceHistory || definition.priceHistory.length === 0) {
        return;
      }

      // Filter price history for last 5 days intraday entries
      const intradayEntriesForAsset = definition.priceHistory.filter((entry: PriceHistoryEntry) => {
        const entryDate = entry.date.split('T')[0];
        const hasTime = entry.date.includes('T') && entry.date.length > 10;
        const isInRange = datesRange.includes(entryDate);
        return isInRange && hasTime;
      });

      if (intradayEntriesForAsset.length > 0) {
        intradayEntries.push(...intradayEntriesForAsset);
      }
    });

    // Sort by timestamp (newest first)
    const sortedEntries = intradayEntries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    Logger.info(`Calculated ${sortedEntries.length} intraday entries for last 5 days`);

    return {
      intradayEntries: sortedEntries,
      cacheKey,
      fromCache: false
    };
  }
);

// Async thunk for calculating portfolio intraday data
export const calculatePortfolioIntradayData = createAsyncThunk(
  'intradayData/calculatePortfolioIntradayData',
  async (
    params: {
      portfolioPositions: PortfolioPosition[];
      portfolioCacheId: string;
      assetDefinitions: AssetDefinition[];
      intradayEntries: PriceHistoryEntry[];
    },
    { getState }
  ) => {
    const state = getState() as { intradayData: IntradayDataState };
    const assetDefKey = generateCacheKey(params.assetDefinitions);
    const portfolioCacheKey = generatePortfolioCacheKey(
      params.portfolioCacheId,
      assetDefKey,
      params.intradayEntries.length
    );

    // Check if we have fresh cached data
    if (
      state.intradayData.portfolioIntradayCacheKey === portfolioCacheKey &&
      isDataFresh(state.intradayData.portfolioIntradayLastUpdated) &&
      state.intradayData.portfolioIntradayData.length > 0
    ) {
      Logger.cache(`Portfolio intraday data cache hit for key: ${portfolioCacheKey.substring(0, 50)}...`);
      return {
        portfolioIntradayData: state.intradayData.portfolioIntradayData,
        cacheKey: portfolioCacheKey,
        fromCache: true
      };
    }

    Logger.cache(`Calculating fresh portfolio intraday data for cache key: ${portfolioCacheKey.substring(0, 50)}...`);

    // Build asset data map for quick lookups
    const assetDataMap: Record<string, Record<string, PriceHistoryEntry>> = {};
    
    params.intradayEntries.forEach(entry => {
      const definition = params.assetDefinitions.find((def: AssetDefinition) => 
        def.priceHistory?.some((ph: PriceHistoryEntry) => 
          ph.date === entry.date && ph.price === entry.price
        )
      );
      
      if (definition) {
        const ticker = definition.ticker || definition.id;
        if (!assetDataMap[ticker]) {
          assetDataMap[ticker] = {};
        }
        assetDataMap[ticker][entry.date] = entry;
      }
    });

    // Get all unique timestamps
    const allTimestamps = new Set<string>();
    Object.values(assetDataMap).forEach(timestampMap => {
      Object.keys(timestampMap).forEach(timestamp => {
        allTimestamps.add(timestamp);
      });
    });

    // Helper function to find the last available price
    const findLastAvailablePrice = (
      assetDefinition: AssetDefinition,
      targetTimestamp: string
    ): number | null => {
      const ticker = assetDefinition.ticker || assetDefinition.id;
      const assetTimestampMap = assetDataMap[ticker];
      
      if (!assetTimestampMap) return null;

      // Check exact match first
      if (assetTimestampMap[targetTimestamp]) {
        return assetTimestampMap[targetTimestamp].price;
      }

      // Find most recent price before target timestamp
      let latestPrice: number | null = null;
      let latestTimestamp: Date | null = null;
      const targetDate = new Date(targetTimestamp);

      Object.entries(assetTimestampMap).forEach(([timestamp, entry]) => {
        const entryDate = new Date(timestamp);
        if (entryDate <= targetDate) {
          if (!latestTimestamp || entryDate > latestTimestamp) {
            latestTimestamp = entryDate;
            latestPrice = entry.price;
          }
        }
      });

      if (latestPrice !== null) return latestPrice;

      // Fallback to daily price history
      if (assetDefinition.priceHistory) {
        const targetDateStr = targetTimestamp.split('T')[0];
        const sortedHistory = assetDefinition.priceHistory
          .filter(entry => !entry.date.includes('T'))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        for (const entry of sortedHistory) {
          if (entry.date <= targetDateStr) {
            return entry.price;
          }
        }
      }

      return null;
    };

    // Calculate portfolio value for each timestamp
    const portfolioIntradayData: Array<{ date: string; value: number; timestamp: string }> = [];

    allTimestamps.forEach(timestamp => {
      let portfolioValue = 0;
      let assetsWithPrices = 0;

      params.portfolioPositions.forEach((position: PortfolioPosition) => {
        const definition = position.assetDefinition;
        if (!definition) return;

        const price = findLastAvailablePrice(definition, timestamp);

        if (price !== null) {
          const validTransactions = position.transactions.filter((transaction) => 
            new Date(transaction.purchaseDate) <= new Date(timestamp)
          );

          const positionQuantity = validTransactions.reduce((sum: number, transaction) => {
            return sum + getCurrentQuantity(transaction);
          }, 0);

          portfolioValue += positionQuantity * price;
          assetsWithPrices++;
        }
      });

      if (assetsWithPrices > 0) {
        portfolioIntradayData.push({
          date: timestamp.split('T')[0],
          value: portfolioValue,
          timestamp: timestamp
        });
      }
    });

    // Sort by timestamp (newest first)
    const sortedData = portfolioIntradayData.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    Logger.info(`Calculated ${sortedData.length} portfolio intraday data points`);

    return {
      portfolioIntradayData: sortedData,
      assetDataMap,
      cacheKey: portfolioCacheKey,
      fromCache: false
    };
  }
);

const intradayDataSlice = createSlice({
  name: 'intradayData',
  initialState,
  reducers: {
    clearIntradayDataCache: (state) => {
      state.intradayEntries = [];
      state.intradayEntriesStatus = 'idle';
      state.intradayEntriesCacheKey = null;
      state.intradayEntriesLastUpdated = null;
      Logger.cache('Cleared intraday data cache');
    },
    clearPortfolioIntradayCache: (state) => {
      state.portfolioIntradayData = [];
      state.portfolioIntradayStatus = 'idle';
      state.portfolioIntradayCacheKey = null;
      state.portfolioIntradayLastUpdated = null;
      Logger.cache('Cleared portfolio intraday cache');
    },
    clearAllIntradayCache: (state) => {
      Object.assign(state, initialState);
      Logger.cache('Cleared all intraday cache');
    }
  },
  extraReducers: (builder) => {
    // Intraday Data
    builder
      .addCase(calculateIntradayData.pending, (state) => {
        state.intradayEntriesStatus = 'loading';
        state.intradayEntriesError = null;
      })
      .addCase(calculateIntradayData.fulfilled, (state, action) => {
        state.intradayEntriesStatus = 'succeeded';
        state.intradayEntries = action.payload.intradayEntries;
        state.intradayEntriesCacheKey = action.payload.cacheKey;
        state.intradayEntriesLastUpdated = Date.now();
        state.intradayEntriesError = null;
      })
      .addCase(calculateIntradayData.rejected, (state, action) => {
        state.intradayEntriesStatus = 'failed';
        state.intradayEntriesError = action.error.message || 'Failed to calculate intraday data';
      })
      
    // Portfolio Intraday Data
      .addCase(calculatePortfolioIntradayData.pending, (state) => {
        state.portfolioIntradayStatus = 'loading';
        state.portfolioIntradayError = null;
      })
      .addCase(calculatePortfolioIntradayData.fulfilled, (state, action) => {
        state.portfolioIntradayStatus = 'succeeded';
        state.portfolioIntradayData = action.payload.portfolioIntradayData;
        state.portfolioIntradayCacheKey = action.payload.cacheKey;
        state.portfolioIntradayLastUpdated = Date.now();
        state.portfolioIntradayError = null;
        
        if (action.payload.assetDataMap) {
          state.assetDataMap = action.payload.assetDataMap;
          state.assetDataMapCacheKey = action.payload.cacheKey;
        }
      })
      .addCase(calculatePortfolioIntradayData.rejected, (state, action) => {
        state.portfolioIntradayStatus = 'failed';
        state.portfolioIntradayError = action.error.message || 'Failed to calculate portfolio intraday data';
      });
  },
});

export const { 
  clearIntradayDataCache, 
  clearPortfolioIntradayCache, 
  clearAllIntradayCache 
} = intradayDataSlice.actions;

export default intradayDataSlice.reducer;
