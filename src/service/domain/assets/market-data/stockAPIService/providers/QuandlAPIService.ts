import { IStockAPIService } from '../interfaces/IStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';

/**
 * Quandl API Service Provider
 * Implements the IStockAPIService interface with Quandl API
 * API Documentation: https://docs.quandl.com/docs
 * Note: Quandl is now part of Nasdaq Data Link
 */
export class QuandlAPIService implements IStockAPIService {
  private apiKey: string;
  private static readonly baseUrl = 'https://data.nasdaq.com/api/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized QuandlAPIService');
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`Quandl: Getting current price for ${symbol}`);
    
    try {
      // Quandl requires dataset specification, using EOD (End of Day) data from WIKI database
      // For current price, we get the latest data point
      const dataset = `WIKI/${symbol}`;
      const url = `${QuandlAPIService.baseUrl}/datasets/${dataset}/data.json?rows=1&api_key=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`Quandl API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.quandl_error) {
        throw new Error(`Quandl API error: ${data.quandl_error.message}`);
      }

      if (!data.dataset_data || !data.dataset_data.data || data.dataset_data.data.length === 0) {
        throw new Error(`No data available for symbol ${symbol}`);
      }

      const latestData = data.dataset_data.data[0];
      const columnNames = data.dataset_data.column_names;
      
      // Find indices for required columns
      const dateIndex = columnNames.indexOf('Date');
      const closeIndex = columnNames.indexOf('Close');
      const openIndex = columnNames.indexOf('Open');
      
      const price = latestData[closeIndex];
      const open = latestData[openIndex];
      const change = price - open;
      const changePercent = (change / open) * 100;
      
      return {
        symbol: symbol,
        price: price,
        currency: 'USD', // Quandl WIKI data is in USD
        timestamp: new Date(latestData[dateIndex]).getTime(),
        change: change,
        changePercent: changePercent
      };
    } catch (error) {
      Logger.error(`Quandl API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.info(`Quandl: Getting ${days} days history for ${symbol}`);
    
    try {
      const dataset = `WIKI/${symbol}`;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const url = `${QuandlAPIService.baseUrl}/datasets/${dataset}/data.json?start_date=${startDateStr}&end_date=${endDateStr}&api_key=${this.apiKey}`;
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`Quandl API error! status: ${response.status}`);
      }

      const data = response.data;
      
      if (data.quandl_error) {
        throw new Error(`Quandl API error: ${data.quandl_error.message}`);
      }

      if (!data.dataset_data || !data.dataset_data.data) {
        throw new Error(`No data available for symbol ${symbol}`);
      }

      const columnNames = data.dataset_data.column_names;
      const dateIndex = columnNames.indexOf('Date');
      const openIndex = columnNames.indexOf('Open');
      const highIndex = columnNames.indexOf('High');
      const lowIndex = columnNames.indexOf('Low');
      const closeIndex = columnNames.indexOf('Close');
      const volumeIndex = columnNames.indexOf('Volume');
      
      const entries: StockHistoryEntry[] = data.dataset_data.data.map((item: any[]) => ({
        date: item[dateIndex],
        open: item[openIndex],
        high: item[highIndex],
        low: item[lowIndex],
        close: item[closeIndex],
        volume: volumeIndex !== -1 ? item[volumeIndex] : undefined,
        timestamp: new Date(item[dateIndex]).getTime(),
        midday: (item[highIndex] + item[lowIndex]) / 2
      }));

      return {
        symbol: symbol,
        entries: entries.reverse(), // Quandl returns newest first, reverse for chronological order
        currency: 'USD',
        source: 'quandl'
      };
    } catch (error) {
      Logger.error(`Quandl API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`Quandl: Intraday data not available for ${symbol} - using daily data instead`);
    
    // Quandl WIKI database doesn't provide intraday data
    // Fall back to daily data for the requested period
    return this.getHistory(symbol, days);
  }
}