import { IStockAPIService } from '../interfaces/IStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';

/**
 * EOD Historical Data API Service Provider
 * Implements the IStockAPIService interface with EOD Historical Data API
 * API Documentation: https://eodhistoricaldata.com/financial-apis/
 */
export class EODHistoricalDataAPIService implements IStockAPIService {
  private apiKey: string;
  private static readonly baseUrl = 'https://eodhistoricaldata.com/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized EODHistoricalDataAPIService');
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`EOD Historical Data: Getting current price for ${symbol}`);
    
    try {
      // Use real-time data endpoint for current price
      const url = `${EODHistoricalDataAPIService.baseUrl}/real-time/${symbol}?api_token=${this.apiKey}&fmt=json`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`EOD Historical Data API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.code && data.message) {
        throw new Error(`EOD Historical Data API error: ${data.message}`);
      }

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
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const url = `${EODHistoricalDataAPIService.baseUrl}/eod/${symbol}?api_token=${this.apiKey}&from=${startDateStr}&to=${endDateStr}&fmt=json`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`EOD Historical Data API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.error) {
        throw new Error(`EOD Historical Data API error: ${data.error}`);
      }

      if (!Array.isArray(data)) {
        throw new Error(`No data available for symbol ${symbol}`);
      }

      const entries: StockHistoryEntry[] = data.map((item: any) => ({
        date: item.date,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: item.volume ? parseInt(item.volume) : undefined,
        timestamp: new Date(item.date).getTime(),
        midday: (parseFloat(item.high) + parseFloat(item.low)) / 2
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

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`EOD Historical Data: Getting ${days} days intraday history for ${symbol}`);
    
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Use intraday endpoint with 1m interval
      const url = `${EODHistoricalDataAPIService.baseUrl}/intraday/${symbol}?api_token=${this.apiKey}&interval=1m&from=${startDateStr}&to=${endDateStr}&fmt=json`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`EOD Historical Data API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.error) {
        throw new Error(`EOD Historical Data API error: ${data.error}`);
      }

      if (!Array.isArray(data)) {
        throw new Error(`No intraday data available for symbol ${symbol}`);
      }

      const entries: StockHistoryEntry[] = data.map((item: any) => ({
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