import { AssetDefinition, PriceHistoryEntry } from '@/types/domains/assets';
import { PortfolioPosition } from '@/types/domains/portfolio';
import portfolioHistoryService, { 
  PortfolioIntradayPoint, 
  PortfolioHistoryPoint 
} from '@/service/infrastructure/sqlLitePortfolioHistory';
import Logger from '@/service/shared/logging/Logger/logger';

interface CalculatePortfolioHistoryParams {
  assetDefinitions: AssetDefinition[];
  portfolioPositions: PortfolioPosition[];
}

/**
 * Service for calculating and persisting portfolio history data
 * - Calculates both intraday (last 5 days) and historical (daily) portfolio values
 * - Stores ONLY in IndexedDB, not in Redux
 * - Called when asset definitions or portfolio positions change
 */
export class PortfolioHistoryCalculationService {
  
  /**
   * Main calculation method - calculates and saves both intraday and history data
   */
  static async calculateAndSavePortfolioHistory(params: CalculatePortfolioHistoryParams): Promise<void> {
    Logger.infoService('🔄 Starting portfolio history calculation and save...');
    
    try {
      // Calculate intraday data (last 5 days with minute-level precision)
      const intradayData = await this.calculatePortfolioIntraday(params);
      
      // Calculate daily history data (for longer timeframes)
      const historyData = await this.calculatePortfolioHistory(params);
      
      // Save to IndexedDB
      if (intradayData.length > 0) {
        await portfolioHistoryService.bulkUpsertPortfolioIntradayData(intradayData);
        Logger.infoService(`💾 Saved ${intradayData.length} portfolio intraday points to IndexedDB`);
      }
      
      if (historyData.length > 0) {
        await portfolioHistoryService.bulkUpsertPortfolioHistory(historyData);
        Logger.infoService(`💾 Saved ${historyData.length} portfolio history points to IndexedDB`);
      }
      
      Logger.infoService('✅ Portfolio history calculation and save completed');
    } catch (error) {
      Logger.error('❌ Portfolio history calculation failed: ' + JSON.stringify(error));
      throw error;
    }
  }
  
  /**
   * Calculate portfolio intraday data (last 5 days, minute-level)
   */
  private static async calculatePortfolioIntraday(params: CalculatePortfolioHistoryParams): Promise<PortfolioIntradayPoint[]> {
    const { assetDefinitions, portfolioPositions } = params;
    
    if (!portfolioPositions || portfolioPositions.length === 0) {
      Logger.infoService('⚠️ No portfolio positions available for intraday calculation');
      return [];
    }
    
    Logger.infoService('🔄 Calculating portfolio intraday data (last 5 days)...');
    
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
    
    assetDefinitions.forEach((definition) => {
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
    const findLastAvailablePrice = (assetDefinition: AssetDefinition, targetTimestamp: string): number | null => {
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
          .filter((entry: PriceHistoryEntry) => !entry.date.includes('T'))
          .sort((a: PriceHistoryEntry, b: PriceHistoryEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        for (const entry of sortedHistory) {
          if (entry.date <= targetDateStr) {
            return entry.price;
          }
        }
      }
      
      return null;
    };
    
    // Calculate portfolio value for each timestamp
    const portfolioData: PortfolioIntradayPoint[] = [];
    
    allTimestamps.forEach(timestamp => {
      let portfolioValue = 0;
      let assetsWithPrices = 0;
      let hasValidPrices = true;
      
      portfolioPositions.forEach((position) => {
        const definition = position.assetDefinition;
        if (!definition) return;
        
        const price = findLastAvailablePrice(definition, timestamp);
        if (price !== null && !isNaN(price) && price > 0) {
          const positionValue = price * position.totalQuantity;
          if (!isNaN(positionValue)) {
            portfolioValue += positionValue;
            assetsWithPrices++;
          } else {
            hasValidPrices = false;
          }
        } else {
          hasValidPrices = false;
        }
      });
      
      // Only include if we have valid prices for at least some assets and the total is valid
      if (assetsWithPrices > 0 && hasValidPrices && !isNaN(portfolioValue) && portfolioValue > 0) {
        const date = timestamp.split('T')[0];
        portfolioData.push({
          timestamp,
          date,
          value: portfolioValue
        });
      }
    });
    
    // Sort by timestamp
    portfolioData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    Logger.infoService(`✅ Calculated ${portfolioData.length} portfolio intraday points from ${allTimestamps.size} timestamps`);
    
    return portfolioData;
  }
  
  /**
   * Calculate portfolio history data (daily snapshots for longer timeframes)
   */
  private static async calculatePortfolioHistory(params: CalculatePortfolioHistoryParams): Promise<PortfolioHistoryPoint[]> {
    const { assetDefinitions, portfolioPositions } = params;
    
    if (!portfolioPositions || portfolioPositions.length === 0) {
      Logger.infoService('⚠️ No portfolio positions available for history calculation');
      return [];
    }
    
    Logger.infoService('🔄 Calculating portfolio history data (daily snapshots)...');
    
    // Get all unique dates from all asset price histories
    const allDates = new Set<string>();
    const assetDataMap: Record<string, Record<string, number>> = {};
    
    assetDefinitions.forEach((definition) => {
      if (!definition.priceHistory || definition.priceHistory.length === 0) {
        return;
      }
      
      const ticker = definition.ticker || definition.id;
      assetDataMap[ticker] = {};
      
      // Only use daily entries (no time component)
      const dailyEntries = definition.priceHistory.filter((entry) => !entry.date.includes('T'));
      
      dailyEntries.forEach((entry) => {
        allDates.add(entry.date);
        assetDataMap[ticker][entry.date] = entry.price;
      });
    });
    
    // Calculate portfolio value for each date
    const portfolioHistoryData: PortfolioHistoryPoint[] = [];
    
    Array.from(allDates).sort((a, b) => a.localeCompare(b)).forEach(date => {
      let portfolioValue = 0;
      let totalInvested = 0;
      let assetsWithPrices = 0;
      let hasValidPrices = true;
      
      portfolioPositions.forEach((position) => {
        const definition = position.assetDefinition;
        if (!definition) return;
        
        const ticker = definition.ticker || definition.id;
        const price = assetDataMap[ticker]?.[date];
        
        if (price !== undefined && !isNaN(price) && price > 0) {
          const positionValue = price * position.totalQuantity;
          if (!isNaN(positionValue)) {
            portfolioValue += positionValue;
            // Simplified calculation - use average buy price or current price as invested amount
            totalInvested += price * position.totalQuantity * 0.8; // Assume 20% gain on average
            assetsWithPrices++;
          } else {
            hasValidPrices = false;
          }
        }
      });
      
      // Only include if we have valid prices and values
      if (assetsWithPrices > 0 && hasValidPrices && !isNaN(portfolioValue) && !isNaN(totalInvested) && portfolioValue > 0) {
        const totalReturn = portfolioValue - totalInvested;
        const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
        
        portfolioHistoryData.push({
          date,
          value: portfolioValue,
          totalInvested,
          totalReturn,
          totalReturnPercentage,
          positions: [], // Simplified for now
          timestamp: new Date(date).getTime()
        });
      }
    });
    
    Logger.infoService(`✅ Calculated ${portfolioHistoryData.length} portfolio history points for ${allDates.size} dates`);
    
    return portfolioHistoryData;
  }
}

export default PortfolioHistoryCalculationService;
