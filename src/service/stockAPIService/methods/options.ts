import { OptionData } from '../types';
import Logger from '../../Logger/logger';

/**
 * Get options data for a stock
 * Note: Finnhub doesn't provide options data in free tier
 * This is a placeholder implementation
 */
export const getOptionsData = async (symbol: string): Promise<OptionData> => {
  try {
    Logger.infoService(`Fetching options data for ${symbol}`);
    
    // Finnhub doesn't provide options data in free tier
    Logger.infoService(`Options data for ${symbol} is not available in Finnhub free tier`);
    
    // Return empty options data structure
    return {
      expirationDates: [],
      options: {
        calls: [],
        puts: []
      }
    };
  } catch (error) {
    Logger.error(`Error fetching options data for ${symbol}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch options data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
