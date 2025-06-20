import sqliteService from '../../../../../infrastructure/sqlLiteService';
import Logger from '../../../../../shared/logging/Logger/logger';

/**
 * Get USD to EUR exchange rate for a specific date
 * Returns null if rate is not available for that date
 */
export const getExchangeRateByDateMethod = async (date: string): Promise<number | null> => {
  try {
    Logger.infoService(`Getting exchange rate for date: ${date}`);

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Logger.error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
      return null;
    }

    // Get all exchange rates
    const existingRates = await sqliteService.getAll('exchangeRates');
    const rateForDate = existingRates.find(rate => rate.date === date);

    if (rateForDate) {
      Logger.infoService(`Found exchange rate for ${date}: ${rateForDate.usdToEur}`);
      return rateForDate.usdToEur;
    }

    Logger.infoService(`No exchange rate found for ${date}`);
    return null;

  } catch (error) {
    Logger.error(`Error getting exchange rate for date ${date}: ${JSON.stringify(error)}`);
    return null;
  }
};
