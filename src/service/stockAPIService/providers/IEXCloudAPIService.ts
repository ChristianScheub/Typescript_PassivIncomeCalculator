import { IStockAPIService } from '../interfaces/IStockAPIService';
import { 
  StockExchange,
  StockPrice,
  StockHistory
} from '../types';
import Logger from '../../Logger/logger';

/**
 * IEX Cloud API Service Provider (Placeholder)
 * Implements the simplified IStockAPIService interface
 */
export class IEXCloudAPIService implements IStockAPIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized IEXCloudAPIService with simplified interface (placeholder)');
  }

  async getStockExchanges(symbol: string): Promise<StockExchange[]> {
    Logger.info(`IEX Cloud: Getting stock exchanges for ${symbol} (not implemented)`);
    throw new Error('IEX Cloud provider not yet implemented');
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`IEX Cloud: Getting current price for ${symbol} (not implemented)`);
    throw new Error('IEX Cloud provider not yet implemented');
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.info(`IEX Cloud: Getting ${days} days history for ${symbol} (not implemented)`);
    throw new Error('IEX Cloud provider not yet implemented');
  }

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    Logger.info(`IEX Cloud: Getting 30 days history for ${symbol} (not implemented)`);
    throw new Error('IEX Cloud provider not yet implemented');
  }
}
