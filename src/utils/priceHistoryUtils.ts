import { PriceHistoryEntry, AssetDefinition, Transaction, Asset } from '@/types/domains/assets';
import { getCurrentQuantity } from './transactionCalculations';

type PriceSource = 'manual' | 'api' | 'import';

/**
 * Utility functions for managing price history data
 */

/**
 * Calculate total value for a given point in time considering all transactions
 * (buy and sell) that occurred before that date
 */
export function calculateHistoricalValue(
  transactions: Array<Asset | Transaction>,
  priceAtDate: number,
  targetDate: string
): number {
  let totalValue = 0;
  
  // Consider all transactions that occurred before or on target date
  const validTransactions = transactions.filter(t => 
    new Date(t.purchaseDate) <= new Date(targetDate)
  );

  // Sum up value based on net quantity (buy - sell) and price at that date
  totalValue = validTransactions.reduce((sum, t) => {
    const quantity = getCurrentQuantity(t); // This handles buy/sell correctly
    return sum + (quantity * priceAtDate);
  }, 0);

  return totalValue;
}

/**
 * Add a new price entry to the history
 * Preserves all historical prices, only removes duplicates if same date, price, and source
 */
export function addPriceToHistory(
  price: number,
  currentHistory: PriceHistoryEntry[] = [],
  date?: string,
  source: PriceSource = 'manual'
): PriceHistoryEntry[] {
  const entryDate = date || new Date().toISOString();
  
  // Check if we already have the exact same entry (same date, price, and source)
  const isDuplicate = currentHistory.some(entry => 
    entry.date === entryDate && 
    entry.price === price && 
    entry.source === source
  );
  
  // If it's a duplicate, don't add it
  if (isDuplicate) {
    return currentHistory;
  }
  
  const newEntry: PriceHistoryEntry = {
    date: entryDate,
    price,
    source
  };
  
  // Add new entry and sort by date (newest first)
  return [...currentHistory, newEntry].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Add a price entry and replace existing entry for the same day and source
 * This is useful for API updates where you want the latest price for the day
 */
export function addOrUpdateDailyPrice(
  price: number,
  currentHistory: PriceHistoryEntry[] = [],
  date?: string,
  source: PriceSource = 'manual'
): PriceHistoryEntry[] {
  const entryDate = date || new Date().toISOString();
  const dateOnly = entryDate.split('T')[0];
  
  // Remove existing entries for the same date and source
  const filteredHistory = currentHistory.filter(entry => 
    !(entry.date.startsWith(dateOnly) && entry.source === source)
  );
  
  const newEntry: PriceHistoryEntry = {
    date: entryDate,
    price,
    source
  };
  
  // Add new entry and sort by date (newest first)
  return [...filteredHistory, newEntry].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Add intraday price entries to history (preserves minute-level timestamps)
 * This is specifically for intraday data where we want to keep all minute-level prices
 * Unlike addOrUpdateDailyPrice, this preserves all entries with different timestamps
 */
export function addIntradayPriceHistory(
  intradayEntries: PriceHistoryEntry[],
  currentHistory: PriceHistoryEntry[] = [],
  maxIntradayEntries: number = 500 // Limit to prevent excessive storage
): PriceHistoryEntry[] {
  // Filter out existing intraday entries for the same day to avoid duplicates
  const today = new Date().toISOString().split('T')[0];
  const filteredHistory = currentHistory.filter(entry => 
    !(entry.date.startsWith(today) && entry.source === 'api')
  );
  
  // Take only the most recent intraday entries if we exceed the limit
  const intradayCopy = [...intradayEntries];
  const sortedIntraday = intradayCopy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const limitedIntradayEntries = sortedIntraday.slice(0, maxIntradayEntries);
  
  // Combine with existing history and sort by date (newest first)
  return [...filteredHistory, ...limitedIntradayEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get the latest price from history
 */
export function getLatestPrice(priceHistory: PriceHistoryEntry[] = []): PriceHistoryEntry | null {
  if (priceHistory.length === 0) return null;
  
  return priceHistory.reduce((latest, current) => 
    new Date(current.date).getTime() > new Date(latest.date).getTime() ? current : latest,
    priceHistory[0]
  );
}

/**
 * Get price history for a specific date range
 */
export function getPriceHistoryForRange(
  startDate: string,
  endDate: string,
  priceHistory: PriceHistoryEntry[] = []
): PriceHistoryEntry[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return priceHistory
    .filter(entry => {
      const entryTime = new Date(entry.date).getTime();
      return entryTime >= start && entryTime <= end;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Calculate price change percentage between two dates
 */
export function calculatePriceChangePercentage(
  fromDate: string,
  toDate: string,
  priceHistory: PriceHistoryEntry[] = []
): number | null {
  const fromEntry = priceHistory.find(entry => 
    entry.date.startsWith(fromDate.split('T')[0])
  );
  const toEntry = priceHistory.find(entry => 
    entry.date.startsWith(toDate.split('T')[0])
  );
  
  if (!fromEntry || !toEntry || fromEntry.price === 0) {
    return null;
  }
  
  return ((toEntry.price - fromEntry.price) / fromEntry.price) * 100;
}

/**
 * Get the closest price entry to a specific date
 */
export function getClosestPriceToDate(
  targetDate: string,
  priceHistory: PriceHistoryEntry[] = []
): PriceHistoryEntry | null {
  if (priceHistory.length === 0) return null;
  
  const target = new Date(targetDate).getTime();
  
  return priceHistory.reduce((closest, current) => {
    const currentDiff = Math.abs(new Date(current.date).getTime() - target);
    const closestDiff = Math.abs(new Date(closest.date).getTime() - target);
    
    return currentDiff < closestDiff ? current : closest;
  }, priceHistory[0]);
}

/**
 * Clean up old price history entries (keep only last N entries)
 */
export function cleanupOldPriceHistory(
  priceHistory: PriceHistoryEntry[] = [],
  maxEntries: number = 365
): PriceHistoryEntry[] {
  const sorted = [...priceHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sorted.slice(0, maxEntries);
}

/**
 * Update AssetDefinition with new price and add to history
 */
export function updateAssetDefinitionPrice(
  definition: AssetDefinition,
  newPrice: number,
  source: PriceSource = 'manual'
): AssetDefinition {
  const currentDate = new Date().toISOString();
  
  // For API updates, use addOrUpdateDailyPrice to get latest price for the day
  // For manual updates, use addPriceToHistory to preserve all entries
  const priceHistoryFunction = source === 'api' ? addOrUpdateDailyPrice : addPriceToHistory;
  
  return {
    ...definition,
    currentPrice: newPrice,
    lastPriceUpdate: currentDate,
    priceHistory: priceHistoryFunction(
      newPrice,
      definition.priceHistory,
      currentDate,
      source
    ),
    updatedAt: currentDate
  };
}

/**
 * Calculate portfolio values for a series of dates considering all transactions (buy and sell)
 */
export function calculateHistoricalPortfolioValues(
  transactions: Array<Asset | Transaction>,
  priceHistory: PriceHistoryEntry[]
): PriceHistoryEntry[] {
  // Sort price history by date (oldest first)
  const sortedHistory = [...priceHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate portfolio value at each historical date
  return sortedHistory.map(entry => ({
    date: entry.date,
    price: calculateHistoricalValue(transactions, entry.price, entry.date),
    source: entry.source
  }));
}
