import { IStockAPIService } from '../interfaces/IStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';

/**
 * IEX Cloud API Service Provider
 * Implements the IStockAPIService interface with IEX Cloud API
 * API Documentation: https://iexcloud.io/docs/api/
 */
export class IEXCloudAPIService implements IStockAPIService {
  private apiKey: string;
  private static readonly baseUrl = 'https://cloud.iexapis.com/stable';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized IEXCloudAPIService');
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`IEX Cloud: Getting current price for ${symbol}`);
    
    try {
      const url = `${IEXCloudAPIService.baseUrl}/stock/${symbol}/quote?token=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`IEX Cloud API error! status: ${response.status}`);
      }

      const data = response.data;
      
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
      let range = '1m'; // default to 1 month
      if (days <= 7) range = '5d';
      else if (days <= 30) range = '1m';
      else if (days <= 90) range = '3m';
      else if (days <= 180) range = '6m';
      else range = '1y';

      const url = `${IEXCloudAPIService.baseUrl}/stock/${symbol}/chart/${range}?token=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`IEX Cloud API error! status: ${response.status}`);
      }

      const data = response.data;
      
      const entries: StockHistoryEntry[] = data.map((item: any) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        timestamp: new Date(item.date).getTime(),
        midday: (item.high + item.low) / 2 // Calculate midday as average of high and low
      }));

      return {
        symbol: symbol,
        entries: entries,
        currency: 'USD',
        source: 'iex_cloud'
      };
    } catch (error) {
      Logger.error(`IEX Cloud API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`IEX Cloud: Getting ${days} days intraday history for ${symbol}`);
    
    try {
      // For intraday data, use the intraday-prices endpoint
      const url = `${IEXCloudAPIService.baseUrl}/stock/${symbol}/intraday-prices?token=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`IEX Cloud API error! status: ${response.status}`);
      }

      const data = response.data;
      
      const entries: StockHistoryEntry[] = data.map((item: any) => ({
        date: item.date,
        open: item.open || item.close,
        high: item.high || item.close,
        low: item.low || item.close,
        close: item.close,
        volume: item.volume || 0,
        timestamp: new Date(`${item.date} ${item.minute}`).getTime(),
        midday: item.close // For intraday, use close as midday
      })).filter((entry: StockHistoryEntry) => entry.close !== null);

      return {
        symbol: symbol,
        entries: entries,
        currency: 'USD',
        source: 'iex_cloud'
      };
    } catch (error) {
      Logger.error(`IEX Cloud API request failed: ${error}`);
      throw error;
    }
  }
}