import { BaseStockAPIService } from './BaseStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * Twelve Data API Service Provider
 * Implements the IStockAPIService interface with Twelve Data API
 * API Documentation: https://twelvedata.com/docs
 */
export class TwelveDataAPIService extends BaseStockAPIService {
  protected readonly baseUrl = 'https://api.twelvedata.com';
  protected readonly providerName = 'Twelve Data';

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`Twelve Data: Getting current price for ${symbol}`);
    
    try {
      const url = `${this.baseUrl}/price?symbol=${symbol}&apikey=${this.apiKey}`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      // Get additional quote data for change information
      const quoteUrl = `${this.baseUrl}/quote?symbol=${symbol}&apikey=${this.apiKey}`;
      const quoteData = await this.makeRequest(quoteUrl);
      
      return {
        symbol: symbol,
        price: parseFloat(data.price),
        currency: 'USD', // Twelve Data default is USD
        timestamp: Date.now(),
        change: quoteData.change ? parseFloat(quoteData.change) : undefined,
        changePercent: quoteData.percent_change ? parseFloat(quoteData.percent_change) : undefined
      };
    } catch (error) {
      Logger.error(`Twelve Data API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.info(`Twelve Data: Getting ${days} days history for ${symbol}`);
    
    try {
      // Calculate the appropriate interval and outputsize
      const interval = '1day';
      const outputsize = Math.min(days, 365).toString();
      
      const url = `${this.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      const values = data.values || [];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: StockHistoryEntry[] = values.map((item: any) => ({
        date: item.datetime.split(' ')[0], // Extract date part
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: item.volume ? parseInt(item.volume) : undefined,
        timestamp: this.parseTimestamp(item.datetime),
        midday: this.calculateMidday(parseFloat(item.high), parseFloat(item.low))
      }));

      return {
        symbol: symbol,
        entries: entries.reverse(), // Twelve Data returns newest first, reverse for chronological order
        currency: 'USD',
        source: 'twelve_data'
      };
    } catch (error) {
      Logger.error(`Twelve Data API request failed: ${error}`);
      throw error;
    }
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`Twelve Data: Getting ${days} days intraday history for ${symbol}`);
    
    try {
      // Use 1min interval for intraday
      const interval = '1min';
      const outputsize = Math.min(days * 390, 5000).toString(); // Market is ~390 minutes per day, max 5000 points
      
      const url = `${this.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      const values = data.values || [];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: StockHistoryEntry[] = values.map((item: any) => ({
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
        entries: entries.reverse(), // Twelve Data returns newest first, reverse for chronological order
        currency: 'USD',
        source: 'twelve_data'
      };
    } catch (error) {
      Logger.error(`Twelve Data API request failed: ${error}`);
      throw error;
    }
  }
}