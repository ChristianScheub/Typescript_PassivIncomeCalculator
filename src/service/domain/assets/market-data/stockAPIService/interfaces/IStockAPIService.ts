import { 
  StockExchange,
  StockPrice,
  StockHistory
} from '@/types/domains/assets/';

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

  /**
   * Get intraday stock data (1-minute intervals for specified days)
   * @param symbol - Stock symbol with exchange suffix (e.g., "AAPL.US")
   * @param days - Number of days to retrieve (default: 1, max: 5)
   * @returns Intraday data with 1-minute resolution
   */
  getIntradayHistory: (symbol: string, days?: number) => Promise<StockHistory>;
}
