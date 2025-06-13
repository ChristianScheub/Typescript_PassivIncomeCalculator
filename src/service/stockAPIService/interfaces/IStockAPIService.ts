import { 
  StockExchange,
  StockPrice,
  StockHistory
} from '../types';

/**
 * Simplified Stock API Service Interface
 * Provides only essential stock data functionality
 */
export interface IStockAPIService {
  /**
   * Get possible stock exchanges (suffixes) for a symbol
   * @param symbol - Stock symbol (e.g., "AAPL")
   * @returns Array of exchange information with suffixes
   */
  getStockExchanges: (symbol: string) => Promise<StockExchange[]>;

  /**
   * Get current stock price
   * @param symbol - Stock symbol with exchange suffix (e.g., "AAPL.US")
   * @returns Current price information
   */
  getCurrentStockPrice: (symbol: string) => Promise<StockPrice>;

  /**
   * Get historical stock data for specified number of days
   * @param symbol - Stock symbol with exchange suffix (e.g., "AAPL.US")
   * @param days - Number of days to retrieve (1-365)
   * @returns Historical data with open, midday, and close prices
   */
  getHistory: (symbol: string, days: number) => Promise<StockHistory>;

  /**
   * Get 30 days of historical stock data
   * @param symbol - Stock symbol with exchange suffix (e.g., "AAPL.US")
   * @returns 30 days of historical data
   */
  getHistory30Days: (symbol: string) => Promise<StockHistory>;
}
