import { IStockAPIService } from '../interfaces/IStockAPIService';
import { 
  StockExchange,
  StockPrice,
  StockHistory
} from '../../../types/domains/assets/';
import Logger from '../../../../../shared/logging/Logger/logger';

/**
 * Alpha Vantage API Service Provider (Placeholder)
 * Implements the simplified IStockAPIService interface
 */
export class AlphaVantageAPIService implements IStockAPIService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized AlphaVantageAPIService with simplified interface (placeholder)');
  }

  async getStockExchanges(symbol: string): Promise<StockExchange[]> {
    Logger.info(`Alpha Vantage: Getting stock exchanges for ${symbol} (not implemented)`);
    throw new Error('Alpha Vantage provider not yet implemented');
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`Alpha Vantage: Getting current price for ${symbol} (not implemented)`);
    throw new Error('Alpha Vantage provider not yet implemented');
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.info(`Alpha Vantage: Getting ${days} days history for ${symbol} (not implemented)`);
    throw new Error('Alpha Vantage provider not yet implemented');
  }

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    Logger.info(`Alpha Vantage: Getting 30 days history for ${symbol} (not implemented)`);
    throw new Error('Alpha Vantage provider not yet implemented');
  }
}
