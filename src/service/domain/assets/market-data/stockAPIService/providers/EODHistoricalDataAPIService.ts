import { BaseStockAPIService } from './BaseStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * EOD Historical Data API Service Provider
 * Implements the IStockAPIService interface with EOD Historical Data API
 * API Documentation: https://eodhistoricaldata.com/financial-apis/
 */
export class EODHistoricalDataAPIService extends BaseStockAPIService {
  protected readonly baseUrl = 'https://eodhistoricaldata.com/api';
  protected readonly providerName = 'EOD Historical Data';

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`EOD Historical Data: Getting current price for ${symbol}`);
    
    try {
      // Use real-time data endpoint for current price
      const url = `${this.baseUrl}/real-time/${symbol}?api_token=${this.apiKey}&fmt=json`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      return {
        symbol: data.code || symbol,
        price: parseFloat(data.close),
        currency: 'USD', // EOD Historical Data default
        timestamp: data.timestamp ? data.timestamp * 1000 : Date.now(), // Convert to milliseconds
        change: data.change ? parseFloat(data.change) : undefined,
        changePercent: data.change_p ? parseFloat(data.change_p) : undefined
      };
    } catch (error) {
      Logger.error(`EOD Historical Data API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.info(`EOD Historical Data: Getting ${days} days history for ${symbol}`);
    
    try {
      const { startDateStr, endDateStr } = this.calculateDateRange(days);
      
      const url = `${this.baseUrl}/eod/${symbol}?api_token=${this.apiKey}&from=${startDateStr}&to=${endDateStr}&fmt=json`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      if (!Array.isArray(data)) {
        throw new Error(`No data available for symbol ${symbol}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: StockHistoryEntry[] = data.map((item: any) => ({
        date: item.date,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: item.volume ? parseInt(item.volume) : undefined,
        timestamp: this.parseTimestamp(item.date),
        midday: this.calculateMidday(parseFloat(item.high), parseFloat(item.low))
      }));

      return {
        symbol: symbol,
        entries: entries,
        currency: 'USD',
        source: 'eod_historical_data'
      };
    } catch (error) {
      Logger.error(`EOD Historical Data API request failed: ${error}`);
      throw error;
    }
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`EOD Historical Data: Getting ${days} days intraday history for ${symbol}`);
    
    try {
      const { startDateStr, endDateStr } = this.calculateDateRange(days);
      
      // Use intraday endpoint with 1m interval
      const url = `${this.baseUrl}/intraday/${symbol}?api_token=${this.apiKey}&interval=1m&from=${startDateStr}&to=${endDateStr}&fmt=json`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      if (!Array.isArray(data)) {
        throw new Error(`No intraday data available for symbol ${symbol}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: StockHistoryEntry[] = data.map((item: any) => ({
        date: item.datetime.split(' ')[0], // Extract date part
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: item.volume ? parseInt(item.volume) : undefined,
        timestamp: this.parseTimestamp(item.datetime),
        midday: parseFloat(item.close) // For intraday, use close as midday
      }));

      return {
        symbol: symbol,
        entries: entries,
        currency: 'USD',
        source: 'eod_historical_data'
      };
    } catch (error) {
      Logger.error(`EOD Historical Data API request failed: ${error}`);
      throw error;
    }
  }
}