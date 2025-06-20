export interface ExchangeRate {
  id?: number;
  date: string; // YYYY-MM-DD format
  usdToEur: number;
  createdAt?: string;
}

export interface IExchangeService {
  /**
   * Refreshes the exchange rate for today if not already stored
   * Fetches from ECB XML if today's rate is missing
   */
  refreshExchangeRate(): Promise<void>;

  /**
   * Gets today's exchange rate
   * If not available, calls refreshExchangeRate() first
   */
  getExchangeRate(): Promise<number>;

  /**
   * Gets the exchange rate for a specific date
   * Returns the rate if available in database, otherwise returns null
   */
  getExchangeRate(date: string): Promise<number | null>;

  /**
   * Gets all stored exchange rates
   * Useful for historical data analysis
   */
  getAllExchangeRates(): Promise<ExchangeRate[]>;

  /**
   * Clears all exchange rate data from database
   * Used for testing or data reset
   */
  clearExchangeRates(): Promise<void>;
}
