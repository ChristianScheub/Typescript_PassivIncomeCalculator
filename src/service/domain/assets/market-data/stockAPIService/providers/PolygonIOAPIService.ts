import { BaseStockAPIService } from './BaseStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * Polygon.io API Service Provider
 * Implements the IStockAPIService interface with Polygon.io API
 * API Documentation: https://polygon.io/docs/stocks
 */
export class PolygonIOAPIService extends BaseStockAPIService {
  protected readonly baseUrl = 'https://api.polygon.io';
  protected readonly providerName = 'Polygon.io';

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`Polygon.io: Getting current price for ${symbol}`);
    
    try {
      // Use the previous close endpoint for current price data
      const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${this.apiKey}`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      if (!data.results || data.results.length === 0) {
        throw new Error(`No data available for symbol ${symbol}`);
      }

      const result = data.results[0];
      const price = result.c; // Close price
      const open = result.o; // Open price
      const change = price - open;
      const changePercent = (change / open) * 100;
      
      return {
        symbol: symbol,
        price: price,
        currency: 'USD', // Polygon.io primarily deals with USD
        timestamp: result.t, // Unix timestamp in milliseconds
        change: change,
        changePercent: changePercent
      };
    } catch (error) {
      Logger.error(`Polygon.io API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.info(`Polygon.io: Getting ${days} days history for ${symbol}`);
    
    try {
      const { startDateStr, endDateStr } = this.calculateDateRange(days);
      
      // Use aggregates endpoint with daily timespan
      const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/1/day/${startDateStr}/${endDateStr}?adjusted=true&sort=asc&apikey=${this.apiKey}`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      if (!data.results || data.results.length === 0) {
        throw new Error(`No data available for symbol ${symbol}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: StockHistoryEntry[] = data.results.map((item: any) => {
        const date = new Date(item.t);
        return {
          date: date.toISOString().split('T')[0],
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
          volume: item.v,
          timestamp: item.t,
          midday: this.calculateMidday(item.h, item.l)
        };
      });

      return {
        symbol: symbol,
        entries: entries,
        currency: 'USD',
        source: 'polygon_io'
      };
    } catch (error) {
      Logger.error(`Polygon.io API request failed: ${error}`);
      throw error;
    }
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`Polygon.io: Getting ${days} days intraday history for ${symbol}`);
    
    try {
      const { startDateStr, endDateStr } = this.calculateDateRange(days);
      
      // Use aggregates endpoint with minute timespan for intraday
      const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/1/minute/${startDateStr}/${endDateStr}?adjusted=true&sort=asc&limit=50000&apikey=${this.apiKey}`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);

      if (!data.results || data.results.length === 0) {
        throw new Error(`No intraday data available for symbol ${symbol}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: StockHistoryEntry[] = data.results.map((item: any) => {
        const date = new Date(item.t);
        return {
          date: date.toISOString().split('T')[0],
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
          volume: item.v,
          timestamp: item.t,
          midday: item.c // For intraday, use close as midday
        };
      });

      return {
        symbol: symbol,
        entries: entries,
        currency: 'USD',
        source: 'polygon_io'
      };
    } catch (error) {
      Logger.error(`Polygon.io API request failed: ${error}`);
      throw error;
    }
  }
}