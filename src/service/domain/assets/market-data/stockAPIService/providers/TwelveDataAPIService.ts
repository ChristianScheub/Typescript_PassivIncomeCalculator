import { IStockAPIService } from '../interfaces/IStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';

/**
 * Twelve Data API Service Provider
 * Implements the IStockAPIService interface with Twelve Data API
 * API Documentation: https://twelvedata.com/docs
 */
export class TwelveDataAPIService implements IStockAPIService {
  private apiKey: string;
  private static readonly baseUrl = 'https://api.twelvedata.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized TwelveDataAPIService');
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`Twelve Data: Getting current price for ${symbol}`);
    
    try {
      const url = `${TwelveDataAPIService.baseUrl}/price?symbol=${symbol}&apikey=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`Twelve Data API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.code && data.message) {
        throw new Error(`Twelve Data API error: ${data.message}`);
      }

      // Get additional quote data for change information
      const quoteUrl = `${TwelveDataAPIService.baseUrl}/quote?symbol=${symbol}&apikey=${this.apiKey}`;
      const quoteResponse = await CapacitorHttp.get({ url: quoteUrl });
      const quoteData = quoteResponse.data;
      
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
      let interval = '1day';
      let outputsize = Math.min(days, 365).toString();
      
      const url = `${TwelveDataAPIService.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`Twelve Data API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.code && data.message) {
        throw new Error(`Twelve Data API error: ${data.message}`);
      }

      const values = data.values || [];
      
      const entries: StockHistoryEntry[] = values.map((item: any) => ({
        date: item.datetime.split(' ')[0], // Extract date part
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: item.volume ? parseInt(item.volume) : undefined,
        timestamp: new Date(item.datetime).getTime(),
        midday: (parseFloat(item.high) + parseFloat(item.low)) / 2
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

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`Twelve Data: Getting ${days} days intraday history for ${symbol}`);
    
    try {
      // Use 1min interval for intraday
      const interval = '1min';
      const outputsize = Math.min(days * 390, 5000).toString(); // Market is ~390 minutes per day, max 5000 points
      
      const url = `${TwelveDataAPIService.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`Twelve Data API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.code && data.message) {
        throw new Error(`Twelve Data API error: ${data.message}`);
      }

      const values = data.values || [];
      
      const entries: StockHistoryEntry[] = values.map((item: any) => ({
        date: item.datetime.split(' ')[0], // Extract date part
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: item.volume ? parseInt(item.volume) : undefined,
        timestamp: new Date(item.datetime).getTime(),
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