import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AssetDefinition } from '@/types/domains/assets';
import { PortfolioPosition } from '@/types/domains/portfolio';
import { getCurrentQuantity } from '../../utils/transactionCalculations';
import Logger from '@/service/shared/logging/Logger/logger';
import portfolioHistoryService, { 
  PortfolioIntradayPoint 
} from '@/service/infrastructure/sqlLitePortfolioHistory';

// Simplified state - only store portfolio aggregates, not individual asset prices
interface PortfolioIntradayState {
  // Portfolio intraday data (aggregated values only)
  portfolioIntradayData: Array<{ date: string; value: number; timestamp: string }>;
  portfolioIntradayStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  portfolioIntradayError: string | null;
  portfolioIntradayCacheKey: string | null;
  portfolioIntradayLastUpdated: number | null;
}

const initialState: PortfolioIntradayState = {
  portfolioIntradayData: [],
  portfolioIntradayStatus: 'idle',
  portfolioIntradayError: null,
  portfolioIntradayCacheKey: null,
  portfolioIntradayLastUpdated: null,
};

// Helper functions
const generatePortfolioCacheKey = (
  portfolioCacheId: string,
  assetCount: number,
  dateRange: string
) => {
  return `${portfolioCacheId}-${assetCount}-${dateRange}`;
};

// Load portfolio intraday data from IndexedDB
export const loadPortfolioIntradayFromDB = createAsyncThunk(
  'portfolioIntraday/loadFromDB',
  async (params: { dateRange?: { start: string; end: string } }) => {
    try {
      Logger.cache('Loading portfolio intraday data from IndexedDB...');
      
      let portfolioData: PortfolioIntradayPoint[] = [];
      
      if (params.dateRange) {
        portfolioData = await portfolioHistoryService.getPortfolioIntradayByDateRange(
          params.dateRange.start, 
          params.dateRange.end
        );
      } else {
        portfolioData = await portfolioHistoryService.getAll('portfolioIntradayData') as PortfolioIntradayPoint[];
      }
      
      // Convert to the format expected by the slice
      const convertedData = portfolioData.map(point => ({
        date: point.date,
        value: point.value,
        timestamp: new Date(point.timestamp).toISOString()
      }));
      
      Logger.cache(`Loaded ${convertedData.length} portfolio intraday points from IndexedDB`);
      
      return {
        portfolioIntradayData: convertedData,
        loadedFromDB: true
      };
    } catch (error) {
      Logger.error('Failed to load portfolio intraday data from IndexedDB: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }
);

// Calculate portfolio intraday data directly from asset definitions (bypass individual price storage)
export const calculatePortfolioIntradayDataDirect = createAsyncThunk(
  'portfolioIntraday/calculateDirect',
  async (params: {
    portfolioPositions: PortfolioPosition[];
    portfolioCacheId: string;
    assetDefinitions: AssetDefinition[];
  }) => {
    try {
      Logger.cache('Calculating portfolio intraday data directly from asset definitions...');

      // Get last 5 days
      const today = new Date();
      const datesRange: string[] = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        datesRange.push(date.toISOString().split('T')[0]);
      }

      // Collect all intraday timestamps from all assets
      const allTimestamps = new Set<string>();
      const assetDataMap: Record<string, Record<string, number>> = {};

      params.assetDefinitions.forEach((definition: AssetDefinition) => {
        if (!definition.priceHistory || definition.priceHistory.length === 0) {
          return;
        }

        const ticker = definition.ticker || definition.id;
        assetDataMap[ticker] = {};

        // Filter for intraday entries in the last 5 days
        const intradayEntries = definition.priceHistory.filter((entry) => {
          const entryDate = entry.date.split('T')[0];
          const hasTime = entry.date.includes('T') && entry.date.length > 10;
          const isInRange = datesRange.includes(entryDate);
          return isInRange && hasTime;
        });

        intradayEntries.forEach((entry) => {
          allTimestamps.add(entry.date);
          assetDataMap[ticker][entry.date] = entry.price;
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
          return assetTimestampMap[targetTimestamp];
        }

        // Find most recent price before target timestamp
        let latestPrice: number | null = null;
        let latestTimestamp: Date | null = null;
        const targetDate = new Date(targetTimestamp);

        Object.entries(assetTimestampMap).forEach(([timestamp, price]) => {
          const entryDate = new Date(timestamp);
          if (entryDate <= targetDate) {
            if (!latestTimestamp || entryDate > latestTimestamp) {
              latestTimestamp = entryDate;
              latestPrice = price;
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
          // Find the matching asset definition by assetDefinitionId
          const definition = params.assetDefinitions.find(
            (def) => def.id === position.assetDefinitionId
          );
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
      const sortedData = portfolioIntradayData.toSorted((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      Logger.info(`Calculated ${sortedData.length} portfolio intraday data points directly`);

      // Generate cache key
      const cacheKey = generatePortfolioCacheKey(
        params.portfolioCacheId,
        params.assetDefinitions.length,
        datesRange.join('|')
      );

      return {
        portfolioIntradayData: sortedData,
        cacheKey,
        fromCache: false
      };
    } catch (error) {
      Logger.error('Failed to calculate portfolio intraday data: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }
);

// Save portfolio intraday data to IndexedDB
export const savePortfolioIntradayToDB = createAsyncThunk(
  'portfolioIntraday/saveToDB',
  async (portfolioIntradayData: Array<{ date: string; value: number; timestamp: string }>) => {
    try {
      Logger.cache('Saving portfolio intraday data to IndexedDB...');
      
      // Convert to PortfolioIntradayPoint format
      const portfolioPoints: PortfolioIntradayPoint[] = portfolioIntradayData.map(data => ({
        date: data.date,
        value: data.value,
        timestamp: data.timestamp // Keep as string, should already be ISO format
      }));
      
      // Save to IndexedDB using bulk operation
      if (portfolioPoints.length > 0) {
        await portfolioHistoryService.bulkAddPortfolioIntradayData(portfolioPoints);
        Logger.cache(`Saved ${portfolioPoints.length} portfolio intraday points to IndexedDB`);
      }
      
      return {
        savedCount: portfolioPoints.length,
        savedToDB: true
      };
    } catch (error) {
      Logger.error('Failed to save portfolio intraday data to IndexedDB: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }
);

const portfolioIntradaySlice = createSlice({
  name: 'portfolioIntraday',
  initialState,
  reducers: {
    clearPortfolioIntradayCache: (state) => {
      state.portfolioIntradayData = [];
      state.portfolioIntradayStatus = 'idle';
      state.portfolioIntradayCacheKey = null;
      state.portfolioIntradayLastUpdated = null;
      Logger.cache('Cleared portfolio intraday cache');
    },
    // Direct synchronous actions for hook integration
    setPortfolioIntradayData: (state, action) => {
      state.portfolioIntradayData = action.payload;
      state.portfolioIntradayLastUpdated = Date.now();
      Logger.cache(`Updated portfolio intraday data in Redux: ${action.payload.length} points`);
    },
    setPortfolioIntradayStatus: (state, action) => {
      state.portfolioIntradayStatus = action.payload;
    },
    setPortfolioIntradayError: (state, action) => {
      state.portfolioIntradayError = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load portfolio intraday from DB
      .addCase(loadPortfolioIntradayFromDB.pending, (state) => {
        state.portfolioIntradayStatus = 'loading';
        state.portfolioIntradayError = null;
      })
      .addCase(loadPortfolioIntradayFromDB.fulfilled, (state, action) => {
        state.portfolioIntradayStatus = 'succeeded';
        state.portfolioIntradayData = action.payload.portfolioIntradayData;
        state.portfolioIntradayError = null;
        state.portfolioIntradayLastUpdated = Date.now();
      })
      .addCase(loadPortfolioIntradayFromDB.rejected, (state, action) => {
        state.portfolioIntradayStatus = 'failed';
        state.portfolioIntradayError = action.error.message || 'Failed to load portfolio intraday data from database';
      })
      
      // Calculate portfolio intraday data directly
      .addCase(calculatePortfolioIntradayDataDirect.pending, (state) => {
        state.portfolioIntradayStatus = 'loading';
        state.portfolioIntradayError = null;
      })
      .addCase(calculatePortfolioIntradayDataDirect.fulfilled, (state, action) => {
        state.portfolioIntradayStatus = 'succeeded';
        state.portfolioIntradayData = action.payload.portfolioIntradayData;
        state.portfolioIntradayCacheKey = action.payload.cacheKey;
        state.portfolioIntradayLastUpdated = Date.now();
        state.portfolioIntradayError = null;
      })
      .addCase(calculatePortfolioIntradayDataDirect.rejected, (state, action) => {
        state.portfolioIntradayStatus = 'failed';
        state.portfolioIntradayError = action.error.message || 'Failed to calculate portfolio intraday data';
      })
      
      // Save portfolio intraday to DB
      .addCase(savePortfolioIntradayToDB.pending, () => {
        // Keep existing status, this is a background operation
      })
      .addCase(savePortfolioIntradayToDB.fulfilled, (_, action) => {
        // Mark as persisted, but don't change loading status
        Logger.cache(`Portfolio intraday data persisted to IndexedDB: ${action.payload.savedCount} points`);
      })
      .addCase(savePortfolioIntradayToDB.rejected, (_, action) => {
        Logger.error('Failed to persist portfolio intraday data: ' + (action.error.message || 'Unknown error'));
      });
  },
});

export const { 
  clearPortfolioIntradayCache,
  setPortfolioIntradayData,
  setPortfolioIntradayStatus,
  setPortfolioIntradayError 
} = portfolioIntradaySlice.actions;

export default portfolioIntradaySlice.reducer;
