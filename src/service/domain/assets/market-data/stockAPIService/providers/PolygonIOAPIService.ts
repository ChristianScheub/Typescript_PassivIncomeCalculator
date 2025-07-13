import { IStockAPIService } from '../interfaces/IStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';

/**
 * Polygon.io API Service Provider
 * Implements the IStockAPIService interface with Polygon.io API
 * API Documentation: https://polygon.io/docs/stocks
 */
export class PolygonIOAPIService implements IStockAPIService {
  private apiKey: string;
  private static readonly baseUrl = 'https://api.polygon.io';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized PolygonIOAPIService');
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`Polygon.io: Getting current price for ${symbol}`);
    
    try {
      // Use the previous close endpoint for current price data
      const url = `${PolygonIOAPIService.baseUrl}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`Polygon.io API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.status !== 'OK') {
        throw new Error(`Polygon.io API error: ${data.error || 'Unknown error'}`);
      }

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
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Use aggregates endpoint with daily timespan
      const url = `${PolygonIOAPIService.baseUrl}/v2/aggs/ticker/${symbol}/range/1/day/${startDateStr}/${endDateStr}?adjusted=true&sort=asc&apikey=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`Polygon.io API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.status !== 'OK') {
        throw new Error(`Polygon.io API error: ${data.error || 'Unknown error'}`);
      }

      if (!data.results || data.results.length === 0) {
        throw new Error(`No data available for symbol ${symbol}`);
      }

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
          midday: (item.h + item.l) / 2
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

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`Polygon.io: Getting ${days} days intraday history for ${symbol}`);
    
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Use aggregates endpoint with minute timespan for intraday
      const url = `${PolygonIOAPIService.baseUrl}/v2/aggs/ticker/${symbol}/range/1/minute/${startDateStr}/${endDateStr}?adjusted=true&sort=asc&limit=50000&apikey=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`Polygon.io API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.status !== 'OK') {
        throw new Error(`Polygon.io API error: ${data.error || 'Unknown error'}`);
      }

      if (!data.results || data.results.length === 0) {
        throw new Error(`No intraday data available for symbol ${symbol}`);
      }

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