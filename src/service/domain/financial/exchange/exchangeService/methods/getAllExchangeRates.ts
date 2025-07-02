import sqliteService from "@/service/infrastructure/sqlLiteService";
import Logger from "@/service/shared/logging/Logger/logger";
import { ExchangeRate } from '../interfaces/IExchangeService';

/**
 * Get all stored exchange rates
 * Returns sorted by date (newest first)
 */
export const getAllExchangeRatesMethod = async (): Promise<ExchangeRate[]> => {
  try {
    Logger.infoService('Getting all exchange rates from database');

    const exchangeRates = await sqliteService.getAll('exchangeRates');
    // Move sort to a separate statement for clarity
    let sortedRates = exchangeRates;
    sortedRates = sortedRates.sort((a, b) => b.date.localeCompare(a.date));

    Logger.infoService(`Retrieved ${sortedRates.length} exchange rates`);
    return sortedRates;

  } catch (error) {
    Logger.error(`Error getting all exchange rates: ${JSON.stringify(error)}`);
    return [];
  }
};
