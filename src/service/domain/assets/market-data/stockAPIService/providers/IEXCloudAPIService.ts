import { BaseStockAPIService } from './BaseStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * IEX Cloud API Service Provider
 * Implements the IStockAPIService interface with IEX Cloud API
 * API Documentation: https://iexcloud.io/docs/api/
 */
export class IEXCloudAPIService extends BaseStockAPIService {
  protected readonly baseUrl = 'https://cloud.iexapis.com/stable';
  protected readonly providerName = 'IEX Cloud';

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`IEX Cloud: Getting current price for ${symbol}`);
    
    try {
      const url = `${this.baseUrl}/stock/${symbol}/quote?token=${this.apiKey}`;
      const data = await this.makeRequest(url);
      this.checkForAPIErrors(data);
      
      return {
        symbol: data.symbol,
        price: data.latestPrice,
        currency: 'USD', // IEX Cloud primarily returns USD prices
        timestamp: data.latestUpdate,
        change: data.change,
        changePercent: data.changePercent * 100 // IEX returns as decimal, convert to percentage
      };
    } catch (error) {
      Logger.error(`IEX Cloud API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.info(`IEX Cloud: Getting ${days} days history for ${symbol}`);
    
    try {
      // IEX Cloud uses range parameter
      let range: string;
      if (days <= 7) range = '5d';
      else if (days <= 30) range = '1m';
      else if (days <= 90) range = '3m';
      else if (days <= 180) range = '6m';
      else range = '1y';

      const url = `${this.baseUrl}/stock/${symbol}/chart/${range}?token=${this.apiKey}`;
      const data = await this.makeRequest(url);
      this.checkForAPIErrors(data);
      
      const entries: StockHistoryEntry[] = data.map((item: any) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        timestamp: this.parseTimestamp(item.date),
        midday: this.calculateMidday(item.high, item.low)
      }));

      return {
        symbol: symbol,
        entries: entries,
        currency: 'USD',
        data: entries // Add data property for compatibility
      };
    } catch (error) {
      Logger.error(`IEX Cloud API request failed: ${error}`);
      throw error;
    }
  }

  // Use the default implementation from BaseStockAPIService
  // async getHistory30Days(symbol: string): Promise<StockHistory> {
  //   return this.getHistory(symbol, 30);
  // }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`IEX Cloud: Getting ${days} days intraday history for ${symbol}`);
    
    try {
      // For intraday data, use the intraday-prices endpoint
      const url = `${this.baseUrl}/stock/${symbol}/intraday-prices?token=${this.apiKey}`;
      const data = await this.makeRequest(url);
      this.checkForAPIErrors(data);
      
      const entries: StockHistoryEntry[] = data.map((item: any) => ({
        date: item.date,
        open: item.open || item.close,
        high: item.high || item.close,
        low: item.low || item.close,
        close: item.close,
        volume: item.volume || 0,
        timestamp: this.parseTimestamp(`${item.date} ${item.minute}`),
        midday: item.close // For intraday, use close as midday
      })).filter((entry: StockHistoryEntry) => entry.close !== null);

      return {
        symbol: symbol,
        entries: entries,
        currency: 'USD',
        data: entries // Add data property for compatibility
      };
    } catch (error) {
      Logger.error(`IEX Cloud API request failed: ${error}`);
      throw error;
    }
  }
}