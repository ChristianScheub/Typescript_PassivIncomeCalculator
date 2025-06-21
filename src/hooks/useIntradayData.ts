import { useMemo } from 'react';
import { useAppSelector } from './redux';
import { PriceHistoryEntry, AssetDefinition } from '@/types/domains/assets';
import { PortfolioPosition } from '@/types/domains/portfolio';
import { getCurrentQuantity } from '../utils/transactionCalculations';
import Logger from '@/service/shared/logging/Logger/logger';

/**
 * Hook to extract intraday data from asset definitions
 * Returns minute-level price entries for the last 5 days from all assets
 */
export function useIntradayData(): PriceHistoryEntry[] {
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);

  return useMemo(() => {
    // Get last 5 days (including today)
    const today = new Date();
    const datesRange: string[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      datesRange.push(date.toISOString().split('T')[0]);
    }
    
    const intradayEntries: PriceHistoryEntry[] = [];

    Logger.info(`Extracting intraday data for last 5 days: ${datesRange.join(', ')}`);
    Logger.info(`Total asset definitions: ${assetDefinitions.length}`);

    assetDefinitions.forEach((definition: AssetDefinition) => {
      if (!definition.priceHistory || definition.priceHistory.length === 0) {
        Logger.info(`No price history for ${definition.ticker || definition.fullName}`);
        return;
      }

      Logger.info(`Checking ${definition.ticker || definition.fullName}: ${definition.priceHistory.length} total price entries`);
      
      // Log sample entries to see the date format
      if (definition.priceHistory.length > 0) {
        Logger.info(`Sample price entries for ${definition.ticker}: ${JSON.stringify(definition.priceHistory.slice(0, 3).map(e => e.date))}`);
      }

      // Filter price history for last 5 days intraday entries (entries with full timestamps, not just date)
      const intradayEntriesForAsset = definition.priceHistory.filter((entry: PriceHistoryEntry, index: number) => {
        // Check if this is an intraday entry (has time component) and is within last 5 days
        const entryDate = entry.date.split('T')[0];
        const hasTime = entry.date.includes('T') && entry.date.length > 10;
        const isInRange = datesRange.includes(entryDate);
        
        // Only log first few entries to avoid spam
        if (index < 3) {
          Logger.info(`Entry: ${entry.date}, entryDate: ${entryDate}, hasTime: ${hasTime}, isInRange: ${isInRange}`);
        }
        
        return isInRange && hasTime;
      });

      if (intradayEntriesForAsset.length > 0) {
        Logger.info(`Found ${intradayEntriesForAsset.length} intraday entries for ${definition.ticker || definition.fullName}`);
        intradayEntries.push(...intradayEntriesForAsset);
      } else {
        Logger.info(`No intraday entries found for ${definition.ticker || definition.fullName} (last 5 days: ${datesRange.join(', ')})`);
      }
    });

    // Sort by timestamp (newest first)
    const sortedEntries = intradayEntries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    Logger.info(`Total intraday entries for last 5 days: ${sortedEntries.length}`);
    
    return sortedEntries;
  }, [assetDefinitions]);
}

/**
 * Hook to get aggregated portfolio value for each intraday timestamp
 * Combines multiple assets' intraday data into portfolio-level data points
 */
export function useIntradayPortfolioData(): Array<{ date: string; value: number; timestamp: string }> {
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const intradayData = useIntradayData();

  return useMemo(() => {
    Logger.info(`useIntradayPortfolioData: portfolioCache exists: ${!!portfolioCache}, intradayData length: ${intradayData.length}`);
    
    if (!portfolioCache || !portfolioCache.positions || intradayData.length === 0) {
      Logger.info(`useIntradayPortfolioData: Early return - portfolioCache: ${!!portfolioCache}, positions: ${!!portfolioCache?.positions}, intradayData: ${intradayData.length}`);
      return [];
    }

    Logger.info(`useIntradayPortfolioData: Processing ${intradayData.length} intraday entries with ${portfolioCache.positions.length} portfolio positions`);

    // Group intraday data by asset ticker/symbol and then by timestamp
    const assetDataMap = new Map<string, Map<string, PriceHistoryEntry>>();
    
    intradayData.forEach(entry => {
      // We need to find which asset this entry belongs to
      // Look through all asset definitions to find the one with this entry in its price history
      assetDefinitions.forEach((definition: AssetDefinition) => {
        if (definition.priceHistory?.some((ph: PriceHistoryEntry) => ph.date === entry.date && ph.price === entry.price)) {
          const ticker = definition.ticker || definition.id;
          if (!assetDataMap.has(ticker)) {
            assetDataMap.set(ticker, new Map());
          }
          assetDataMap.get(ticker)!.set(entry.date, entry);
        }
      });
    });

    Logger.info(`useIntradayPortfolioData: Grouped intraday data for ${assetDataMap.size} assets`);

    // Get all unique timestamps
    const allTimestamps = new Set<string>();
    assetDataMap.forEach(timestampMap => {
      timestampMap.forEach((_, timestamp) => {
        allTimestamps.add(timestamp);
      });
    });

    Logger.info(`useIntradayPortfolioData: Found ${allTimestamps.size} unique timestamps`);

    // Calculate portfolio value for each timestamp
    const portfolioIntradayData: Array<{ date: string; value: number; timestamp: string }> = [];

    allTimestamps.forEach(timestamp => {
      let portfolioValue = 0;
      let assetsWithPrices = 0;

      // For each position in the portfolio, find its price at this timestamp
      portfolioCache.positions.forEach((position: PortfolioPosition) => {
        const assetDefinition = position.assetDefinition;
        if (!assetDefinition) return;

        const ticker = assetDefinition.ticker || assetDefinition.id;
        const assetTimestampMap = assetDataMap.get(ticker);
        const priceEntry = assetTimestampMap?.get(timestamp);

        if (priceEntry) {
          // Calculate position quantity considering all transactions that occurred before or on this timestamp
          // This ensures that sells are properly reflected in historical intraday data
          const validTransactions = position.transactions.filter((transaction) => 
            new Date(transaction.purchaseDate) <= new Date(timestamp)
          );

          const positionQuantity = validTransactions.reduce((sum: number, transaction) => {
            return sum + getCurrentQuantity(transaction); // Use imported function to handle buy/sell correctly
          }, 0);

          // Use the intraday price with the correct historical quantity
          portfolioValue += positionQuantity * priceEntry.price;
          assetsWithPrices++;
        } else {
          // Fallback to current price or position value (but this should be rare for intraday data)
          portfolioValue += position.currentValue;
        }
      });

      // Only add this timestamp if we have at least some intraday prices
      if (assetsWithPrices > 0) {
        portfolioIntradayData.push({
          date: timestamp.split('T')[0], // Date part for compatibility
          value: portfolioValue,
          timestamp: timestamp // Full timestamp for sorting
        });
      }
    });

    // Sort by timestamp (newest first)
    const sortedData = portfolioIntradayData.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    Logger.info(`Calculated portfolio intraday data: ${sortedData.length} data points`);
    
    // Log sample data for debugging
    if (sortedData.length > 0) {
      Logger.info(`Sample intraday portfolio data: ${JSON.stringify(sortedData.slice(0, 3))}`);
    }
    
    return sortedData;
  }, [portfolioCache, intradayData, assetDefinitions]);
}
