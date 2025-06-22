import { useMemo, useEffect, useState } from 'react';
import { useAppSelector } from './redux';
import { PriceHistoryEntry } from '@/types/domains/assets';
import portfolioHistoryService, { 
  PortfolioIntradayPoint 
} from '@/service/infrastructure/sqlLitePortfolioHistory';
import Logger from '@/service/shared/logging/Logger/logger';

/**
 * AUTO-UPDATING Portfolio History Hook
 * - Calculates portfolio values directly from asset definitions
 * - Only stores the final portfolio values in IndexedDB (no individual asset prices)
 * - Auto-recalculates when assets or their price history change
 * - Persists to IndexedDB for fast retrieval
 * - Returns cached data when fresh calculation is not needed
 */
export function useAutoUpdatingPortfolioHistory(): Array<{ date: string; value: number; timestamp: string }> {
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { isHydrated } = useAppSelector(state => state.calculatedData);
  
  const [cachedData, setCachedData] = useState<Array<{ date: string; value: number; timestamp: string }>>([]);
  const [lastCalculationHash, setLastCalculationHash] = useState<string>('');

  // Create hash to detect changes in assets or their price history
  const assetDefinitionHash = useMemo(() => {
    if (!assetDefinitions || assetDefinitions.length === 0) return '';
    
    const hashInput = assetDefinitions
      .map((asset: any) => `${asset.id}-${asset.ticker || 'NO_TICKER'}-${JSON.stringify(asset.priceHistory || [])}`)
      .sort()
      .join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }, [assetDefinitions]);

  // Load cached data from IndexedDB on mount
  useEffect(() => {
    if (!isHydrated) return;

    const loadCachedPortfolioData = async () => {
      try {
        Logger.infoService('📂 Loading cached portfolio intraday data from IndexedDB...');
        
        // Get last 5 days range
        const today = new Date();
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(today.getDate() - 5);
        
        const startDate = fiveDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const cachedPoints = await portfolioHistoryService.getPortfolioIntradayByDateRange(startDate, endDate);
        
        const transformedData = cachedPoints.map(point => ({
          date: point.date,
          value: point.value,
          timestamp: point.timestamp
        }));
        
        setCachedData(transformedData);
        Logger.infoService(`📂 Loaded ${transformedData.length} cached portfolio intraday points from IndexedDB`);
      } catch (error) {
        Logger.infoService(`❌ Error loading cached portfolio data: ${error}`);
        setCachedData([]);
      }
    };

    loadCachedPortfolioData();
  }, [isHydrated]);

  // Calculate portfolio values directly from asset definitions
  const portfolioIntradayData = useMemo(() => {
    if (!isHydrated || !portfolioCache?.positions || portfolioCache.positions.length === 0 || assetDefinitions.length === 0) {
      // Return cached data if fresh calculation not possible
      Logger.infoService('📂 Using cached portfolio data (no assets or portfolio available)');
      return cachedData;
    }

    // Check if we need to recalculate
    if (assetDefinitionHash === lastCalculationHash && cachedData.length > 0) {
      Logger.infoService('📂 Using cached portfolio data (no changes detected)');
      return cachedData;
    }

    Logger.infoService('🔄 Calculating portfolio intraday data from asset definitions...');
    Logger.infoService(`Portfolio positions: ${portfolioCache.positions.length}`);
    Logger.infoService(`Asset definitions: ${assetDefinitions.length}`);

    // Get last 5 days
    const today = new Date();
    const datesRange: string[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      datesRange.push(date.toISOString().split('T')[0]);
    }

    Logger.infoService(`Date range: ${datesRange.join(', ')}`);

    // Collect all intraday timestamps from all assets
    const allTimestamps = new Set<string>();
    const assetDataMap: Record<string, Record<string, number>> = {};

    assetDefinitions.forEach((definition: any) => {
      if (!definition.priceHistory || definition.priceHistory.length === 0) {
        Logger.infoService(`❌ No price history for asset: ${definition.ticker || definition.id}`);
        return;
      }

      const ticker = definition.ticker || definition.id;
      assetDataMap[ticker] = {};

      // Filter for intraday entries in the last 5 days
      const intradayEntries = definition.priceHistory.filter((entry: any) => {
        const entryDate = entry.date.split('T')[0];
        const hasTime = entry.date.includes('T') && entry.date.length > 10;
        const isInRange = datesRange.includes(entryDate);
        return isInRange && hasTime;
      });

      Logger.infoService(`Asset ${ticker}: ${intradayEntries.length} intraday entries of ${definition.priceHistory.length} total`);

      intradayEntries.forEach((entry: any) => {
        allTimestamps.add(entry.date);
        assetDataMap[ticker][entry.date] = entry.price;
      });
    });

    // Helper function to find the last available price
    const findLastAvailablePrice = (assetDefinition: any, targetTimestamp: string): number | null => {
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
    const portfolioData: Array<{ date: string; value: number; timestamp: string }> = [];

    allTimestamps.forEach(timestamp => {
      let portfolioValue = 0;
      let assetsWithPrices = 0;
      let debugInfo: string[] = [];

      portfolioCache.positions.forEach((position: any) => {
        const definition = position.assetDefinition;
        if (!definition) {
          debugInfo.push(`No definition for position`);
          return;
        }

        const price = findLastAvailablePrice(definition, timestamp);
        if (price !== null && !isNaN(price) && !isNaN(position.quantity)) {
          const assetValue = price * position.quantity;
          portfolioValue += assetValue;
          assetsWithPrices++;
          debugInfo.push(`${definition.ticker || definition.id}: ${position.quantity} × ${price} = ${assetValue}`);
        } else {
          debugInfo.push(`${definition.ticker || definition.id}: NO PRICE (price=${price}, qty=${position.quantity})`);
        }
      });

      // Only include if we have prices for at least some assets and portfolio value is valid
      if (assetsWithPrices > 0 && !isNaN(portfolioValue) && portfolioValue > 0) {
        const date = timestamp.split('T')[0];
        portfolioData.push({
          date,
          value: portfolioValue,
          timestamp
        });
      } else {
        Logger.infoService(`❌ Skipping timestamp ${timestamp}: assetsWithPrices=${assetsWithPrices}, portfolioValue=${portfolioValue}. Debug: ${debugInfo.slice(0, 3).join('; ')}`);
      }
    });

    // Sort by timestamp
    portfolioData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    Logger.infoService(`✅ Calculated ${portfolioData.length} portfolio intraday points from ${allTimestamps.size} timestamps`);

    return portfolioData;
  }, [portfolioCache, assetDefinitions, isHydrated, cachedData, assetDefinitionHash, lastCalculationHash]);

  // Auto-save to IndexedDB when calculation changes
  useEffect(() => {
    if (portfolioIntradayData.length > 0 && assetDefinitionHash !== lastCalculationHash && assetDefinitionHash !== '') {
      const saveToIndexedDB = async () => {
        try {
          Logger.infoService('💾 Saving calculated portfolio intraday data to IndexedDB...');
          
          const portfolioPoints: PortfolioIntradayPoint[] = portfolioIntradayData.map((data: any) => ({
            timestamp: data.timestamp,
            date: data.date,
            value: data.value
          }));

          await portfolioHistoryService.bulkUpsertPortfolioIntradayData(portfolioPoints);
          
          // Also calculate and save daily portfolio history aggregates
          Logger.infoService('💾 Calculating daily portfolio history aggregates...');
          const dailyAggregates = calculateDailyAggregates(portfolioIntradayData);
          
          if (dailyAggregates.length > 0) {
            await portfolioHistoryService.bulkUpsertPortfolioHistory(dailyAggregates);
            Logger.infoService(`💾 Saved ${dailyAggregates.length} daily portfolio history points to IndexedDB`);
          }
          
          setLastCalculationHash(assetDefinitionHash);
          
          Logger.infoService(`💾 Saved ${portfolioPoints.length} portfolio intraday points to IndexedDB`);
        } catch (error) {
          Logger.infoService(`❌ Error saving portfolio data to IndexedDB: ${error}`);
        }
      };

      saveToIndexedDB();
    }
  }, [portfolioIntradayData, assetDefinitionHash, lastCalculationHash]);

  // Helper function to calculate daily aggregates from intraday data
  const calculateDailyAggregates = (intradayData: Array<{ date: string; value: number; timestamp: string }>) => {
    const dailyMap = new Map<string, { values: number[]; date: string }>();
    
    // Group by date
    intradayData.forEach(point => {
      if (!dailyMap.has(point.date)) {
        dailyMap.set(point.date, { values: [], date: point.date });
      }
      dailyMap.get(point.date)!.values.push(point.value);
    });
    
    // Calculate daily aggregates
    return Array.from(dailyMap.values()).map(dayData => {
      const values = dayData.values;
      const dailyValue = values[values.length - 1]; // Use last value of the day
      
      // Estimate total invested (this could be enhanced with actual transaction data)
      const estimatedInvested = dailyValue * 0.8; // Rough estimate
      const totalReturn = dailyValue - estimatedInvested;
      const totalReturnPercentage = estimatedInvested > 0 ? (totalReturn / estimatedInvested) * 100 : 0;
      
      // Create simplified positions array (this could be enhanced with actual position data)
      const positions = portfolioCache?.positions?.map((pos: any) => ({
        assetDefinitionId: pos.assetDefinition?.id || 'unknown',
        quantity: pos.quantity || 0,
        value: (pos.quantity || 0) * (dailyValue / (portfolioCache.positions?.length || 1)), // Rough estimate
        price: dailyValue / (portfolioCache.positions?.length || 1) // Rough estimate
      })) || [];
      
      return {
        date: dayData.date,
        value: dailyValue,
        totalInvested: estimatedInvested,
        totalReturn,
        totalReturnPercentage,
        positions,
        timestamp: new Date(dayData.date + 'T23:59:59Z').getTime()
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  };

  return portfolioIntradayData;
}
