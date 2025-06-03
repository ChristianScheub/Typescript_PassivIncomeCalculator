import { StockHistoricalData } from '../types';
import Logger from '../../Logger/logger';
import { fetchFromFinnhub, convertPrices } from '../utils/fetch';

/**
 * Get historical price data for a stock
 * Note: Finnhub provides daily resolution data, higher resolution requires premium plan
 */
export const getHistoricalData = async (
  symbol: string,
  range: string = '1y',
  interval: string = '1d'
): Promise<StockHistoricalData> => {
  try {
    Logger.infoService(`Fetching historical data for ${symbol}, range: ${range}, interval: ${interval}`);
    
    // Calculate date range for Finnhub API
    const toDate = Math.floor(Date.now() / 1000); // Current timestamp
    const fromDate = Math.floor((Date.now() - getMillisecondsFromRange(range)) / 1000);
    
    const response = await fetchFromFinnhub('/stock/candle', {
      symbol: symbol,
      resolution: 'D', // Daily resolution (Finnhub format)
      from: fromDate.toString(),
      to: toDate.toString()
    });

    if (response.s !== 'ok' || !response.c || response.c.length === 0) {
      Logger.infoService(`No historical data found for symbol: ${symbol}`);
      return {
        symbol: symbol,
        timestamp: [],
        closePrices: [],
        volumes: [],
        dividends: {},
        splits: {}
      };
    }

    // Convert prices from USD to EUR if needed
    const convertedClosePrices = await convertPrices(response.c);

    return {
      symbol: symbol,
      timestamp: response.t, // Unix timestamps
      closePrices: convertedClosePrices, // Converted close prices
      volumes: response.v, // Volumes
      dividends: {}, // Finnhub doesn't provide dividend data in candle endpoint
      splits: {} // Finnhub doesn't provide split data in candle endpoint
    };
  } catch (error) {
    Logger.error(`Error fetching historical data for ${symbol}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Convert range string to milliseconds
 */
function getMillisecondsFromRange(range: string): number {
  const rangeMap: Record<string, number> = {
    '1d': 24 * 60 * 60 * 1000, // 1 day
    '5d': 5 * 24 * 60 * 60 * 1000, // 5 days
    '1mo': 30 * 24 * 60 * 60 * 1000, // 1 month
    '3mo': 90 * 24 * 60 * 60 * 1000, // 3 months
    '6mo': 180 * 24 * 60 * 60 * 1000, // 6 months
    '1y': 365 * 24 * 60 * 60 * 1000, // 1 year
    '2y': 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    '5y': 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
    '10y': 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
    'ytd': (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()), // Year to date
    'max': 20 * 365 * 24 * 60 * 60 * 1000 // 20 years as max
  };
  
  return rangeMap[range] || rangeMap['1y']; // Default to 1 year
}
