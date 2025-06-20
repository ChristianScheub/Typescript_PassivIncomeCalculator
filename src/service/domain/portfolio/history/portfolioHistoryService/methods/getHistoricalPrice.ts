import { AssetDefinition } from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * Gets the most appropriate price for a given date from asset definition
 * Searches historical prices first, then falls back to current price
 */
export function getHistoricalPrice(
  assetDefinition: AssetDefinition, 
  date: string
): number {
  const normalizedDate = date.split('T')[0];
  const assetName = assetDefinition.ticker || assetDefinition.fullName;
  
  Logger.infoService(`Getting price for ${assetName} on ${normalizedDate}`);
  
  // Try to get price from historical data first
  const historicalPrice = getValidHistoricalPrice(assetDefinition, normalizedDate);
  if (historicalPrice > 0) return historicalPrice;
  
  // Try to use current price if date is today
  const todayPrice = getTodayPrice(assetDefinition, normalizedDate);
  if (todayPrice > 0) return todayPrice;
  
  // Use current price as fallback
  const fallbackPrice = getFallbackPrice(assetDefinition, normalizedDate);
  if (fallbackPrice > 0) return fallbackPrice;

  // Last resort: return 0
  Logger.error(`No price available for ${assetName} on ${normalizedDate}`);
  return 0;
}

/**
 * Gets a valid historical price for the given date
 */
function getValidHistoricalPrice(assetDefinition: AssetDefinition, normalizedDate: string): number {
  if (!assetDefinition.priceHistory?.length) return 0;

  const validPrices = assetDefinition.priceHistory
    .filter(entry => entry.date.split('T')[0] <= normalizedDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!validPrices.length) return 0;

  const price = validPrices[0].price;
  if (isValidPrice(price)) {
    Logger.infoService(`Found historical price: €${price.toFixed(2)} from ${validPrices[0].date}`);
    return price;
  }
  
  return 0;
}

/**
 * Gets current price if the requested date is today
 */
function getTodayPrice(assetDefinition: AssetDefinition, normalizedDate: string): number {
  const today = new Date().toISOString().split('T')[0];
  if (normalizedDate !== today || !assetDefinition.currentPrice) return 0;

  const currentPrice = assetDefinition.currentPrice;
  if (isValidPrice(currentPrice)) {
    Logger.infoService(`Using current price: €${currentPrice.toFixed(2)}`);
    return currentPrice;
  }
  
  return 0;
}

/**
 * Gets current price as fallback when no historical price is available
 */
function getFallbackPrice(assetDefinition: AssetDefinition, normalizedDate: string): number {
  if (!assetDefinition.currentPrice) return 0;

  const currentPrice = assetDefinition.currentPrice;
  if (isValidPrice(currentPrice)) {
    Logger.warn(`No historical price for ${normalizedDate}, using current price as fallback: €${currentPrice.toFixed(2)}`);
    return currentPrice;
  }
  
  return 0;
}

/**
 * Validates that a price is usable
 */
function isValidPrice(price: number | null | undefined): price is number {
  return price !== null && price !== undefined && isFinite(price) && price > 0;
}
