import { PriceHistoryEntry, AssetDefinition, Transaction, Asset } from '@/types/domains/assets';

/**
 * Utility functions for managing price history data
 */

/**
 * Calculate total value for a given point in time based only on buy transactions
 * that occurred before that date
 */
export function calculateHistoricalValue(
  transactions: Array<Asset | Transaction>,
  priceAtDate: number,
  targetDate: string
): number {
  let totalValue = 0;
  
  // Only consider buy transactions that occurred before or on target date
  const validTransactions = transactions.filter(t => 
    t.transactionType === 'buy' && new Date(t.purchaseDate) <= new Date(targetDate)
  );

  // Sum up value based on quantity from buy transactions and price at that date
  totalValue = validTransactions.reduce((sum, t) => {
    const quantity = t.purchaseQuantity || 0;
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
  source: string = 'manual'
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
  source: string = 'manual'
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
  source: string = 'manual'
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
 * Calculate portfolio values for a series of dates based only on buy transactions
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
