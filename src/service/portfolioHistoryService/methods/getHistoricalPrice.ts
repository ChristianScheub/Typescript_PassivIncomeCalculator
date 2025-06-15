import { AssetDefinition } from '../../../types';
import Logger from '../../Logger/logger';

/**
 * Gets the most appropriate price for a given date from asset definition
 * Searches historical prices first, then falls back to current price
 */
export function getHistoricalPrice(
  assetDefinition: AssetDefinition, 
  date: string
): number {
  const normalizedDate = date.split('T')[0];
  
  Logger.infoService(
    `Getting price for ${assetDefinition.ticker || assetDefinition.fullName} on ${normalizedDate}`
  );
  
  // If we have price history, find the most recent price before or on this date
  if (assetDefinition.priceHistory && assetDefinition.priceHistory.length > 0) {
    const validPrices = assetDefinition.priceHistory
      .filter(entry => {
        const entryDate = entry.date.split('T')[0];
        return entryDate <= normalizedDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (validPrices.length > 0) {
      const price = validPrices[0].price;
      // Safety check for valid price
      if (price !== null && price !== undefined && isFinite(price) && price > 0) {
        Logger.infoService(
          `Found historical price: €${price.toFixed(2)} from ${validPrices[0].date}`
        );
        return price;
      }
    }
  }

  // If no historical price available, check if this is today and use current price
  const today = new Date().toISOString().split('T')[0];
  if (normalizedDate === today && assetDefinition.currentPrice) {
    const currentPrice = assetDefinition.currentPrice;
    // Safety check for valid price
    if (currentPrice !== null && currentPrice !== undefined && isFinite(currentPrice) && currentPrice > 0) {
      Logger.infoService(`Using current price: €${currentPrice.toFixed(2)}`);
      return currentPrice;
    }
  }

  // If still no price available, use current price as fallback
  if (assetDefinition.currentPrice) {
    const currentPrice = assetDefinition.currentPrice;
    // Safety check for valid price
    if (currentPrice !== null && currentPrice !== undefined && isFinite(currentPrice) && currentPrice > 0) {
      Logger.warn(
        `No historical price for ${normalizedDate}, using current price as fallback: €${currentPrice.toFixed(2)}`
      );
      return currentPrice;
    }
  }

  // Last resort: return 0
  Logger.error(
    `No price available for ${assetDefinition.ticker || assetDefinition.fullName} on ${normalizedDate}`
  );
  return 0;
}
