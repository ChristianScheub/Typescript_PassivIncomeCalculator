import sqliteService from '../../sqlLiteService';
import Logger from '../../Logger/logger';

/**
 * Clear all exchange rate data from database
 * Used for testing or data reset
 */
export const clearExchangeRatesMethod = async (): Promise<void> => {
  try {
    Logger.infoService('Clearing all exchange rates from database');

    // Get all exchange rates to delete them one by one
    const exchangeRates = await sqliteService.getAll('exchangeRates');
    
    if (exchangeRates.length === 0) {
      Logger.infoService('No exchange rates to clear');
      return;
    }

    // Delete each exchange rate by its ID
    for (const rate of exchangeRates) {
      if (rate.id) {
        await sqliteService.remove('exchangeRates', rate.id.toString());
      }
    }

    Logger.infoService(`Cleared ${exchangeRates.length} exchange rates from database`);

  } catch (error) {
    Logger.error(`Error clearing exchange rates: ${JSON.stringify(error)}`);
    throw new Error(`Failed to clear exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
