import { BaseStockAPIService } from './BaseStockAPIService';
import {
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * Quandl API Service Provider
 * Implements the IStockAPIService interface with Quandl API
 * API Documentation: https://docs.quandl.com/docs
 * Note: Quandl is now part of Nasdaq Data Link
 */
export class QuandlAPIService extends BaseStockAPIService {
  protected readonly baseUrl = 'https://data.nasdaq.com/api/v3';
  protected readonly providerName = 'Quandl';

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`Quandl: Getting current price for ${symbol}`);
    
    try {
      // Quandl requires dataset specification, using EOD (End of Day) data from WIKI database
      // For current price, we get the latest data point
      const dataset = `WIKI/${symbol}`;
      const url = `${this.baseUrl}/datasets/${dataset}/data.json?rows=1&api_key=${this.apiKey}`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);
      
      if (data.quandl_error) {
        throw new Error(`Quandl API error: ${data.quandl_error.message}`);
      }

      if (!data.dataset_data?.data || data.dataset_data.data.length === 0) {
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
        timestamp: this.parseTimestamp(latestData[dateIndex]),
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
      const { startDateStr, endDateStr } = this.calculateDateRange(days);
      
      const url = `${this.baseUrl}/datasets/${dataset}/data.json?start_date=${startDateStr}&end_date=${endDateStr}&api_key=${this.apiKey}`;
      const data = await this.makeRequest(url);
      
      this.checkForAPIErrors(data);
      
      if (data.quandl_error) {
        throw new Error(`Quandl API error: ${data.quandl_error.message}`);
      }

      if (!data.dataset_data?.data) {
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
        timestamp: this.parseTimestamp(item[dateIndex]),
        midday: this.calculateMidday(item[highIndex], item[lowIndex])
      }));

      // Quandl returns newest first, reverse for chronological order
      const reversedEntries = [...entries].reverse();

      return {
        symbol: symbol,
        entries: reversedEntries,
        data: reversedEntries, // Add data property for compatibility
        currency: 'USD'
      };
    } catch (error) {
      Logger.error(`Quandl API request failed: ${error}`);
      throw error;
    }
  }

  // Use the default implementation from BaseStockAPIService
  // async getHistory30Days(symbol: string): Promise<StockHistory> {
  //   return this.getHistory(symbol, 30);
  // }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`Quandl: Intraday data not available for ${symbol} - using daily data instead`);
    
    // Quandl WIKI database doesn't provide intraday data
    // Fall back to daily data for the requested period
    return this.getHistory(symbol, days);
  }
}