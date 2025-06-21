import sqliteService from '../../../../../infrastructure/sqlLiteService';
import Logger from "@/service/shared/logging/Logger/logger";
import { refreshExchangeRateMethod } from './refreshExchangeRate';

/**
 * Get today's USD to EUR exchange rate
 * If not available, refreshes from ECB first
 */
export const getExchangeRateMethod = async (): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    Logger.infoService(`Getting exchange rate for today: ${today}`);

    // Check if today's rate exists
    const existingRates = await sqliteService.getAll('exchangeRates');
    const todayRate = existingRates.find(rate => rate.date === today);

    if (todayRate) {
      Logger.cache(`Found cached exchange rate for ${today}: ${todayRate.usdToEur}`);
      return todayRate.usdToEur;
    }

    // Rate not found, refresh from ECB
    Logger.infoService(`Exchange rate for ${today} not found, refreshing from ECB`);
    await refreshExchangeRateMethod();

    // Try to get the rate again after refresh
    const refreshedRates = await sqliteService.getAll('exchangeRates');
    const refreshedTodayRate = refreshedRates.find(rate => rate.date === today);

    if (refreshedTodayRate) {
      Logger.infoService(`Successfully refreshed exchange rate for ${today}: ${refreshedTodayRate.usdToEur}`);
      return refreshedTodayRate.usdToEur;
    }

    // If still not found, try to get the most recent rate as fallback
    let sortedRates = refreshedRates;
    sortedRates = sortedRates.sort((a, b) => b.date.localeCompare(a.date));
    if (sortedRates.length > 0) {
      const fallbackRate = sortedRates[0];
      Logger.warn(`Using fallback exchange rate from ${fallbackRate.date}: ${fallbackRate.usdToEur}`);
      return fallbackRate.usdToEur;
    }

    // Ultimate fallback if no rates available
    const fallbackRate = 0.85; // Conservative USD to EUR rate
    Logger.error(`No exchange rates available, using hardcoded fallback: ${fallbackRate}`);
    return fallbackRate;

  } catch (error) {
    Logger.error(`Error getting exchange rate: ${JSON.stringify(error)}`);
    
    // Return fallback rate on error
    const fallbackRate = 0.85;
    Logger.warn(`Using fallback exchange rate due to error: ${fallbackRate}`);
    return fallbackRate;
  }
};
