import { IStockAPIService } from '../interfaces/IStockAPIService';
import {
  StockPrice,
  StockHistory
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';

/**
 * Base abstract class for Stock API Service providers
 * Contains common functionality to reduce code duplication
 */
export abstract class BaseStockAPIService implements IStockAPIService {
  protected apiKey: string;
  protected abstract readonly baseUrl: string;
  protected abstract readonly providerName: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
    Logger.info(`Initialized ${this.providerName}APIService`);
  }

  /**
   * Calculate start and end dates for a given number of days
   */
  protected calculateDateRange(days: number): { startDate: Date; endDate: Date; startDateStr: string; endDateStr: string } {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return { startDate, endDate, startDateStr, endDateStr };
  }

  /**
   * Common HTTP request wrapper with error handling
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async makeRequest(url: string): Promise<any> {
    try {
      const response = await CapacitorHttp.get({ url });
      
      if (response.status !== 200) {
        throw new Error(`${this.providerName} API error! status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      Logger.error(`${this.providerName} API request failed: ${error}`);
      throw error;
    }
  }

  /**
   * Check for common API error patterns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected checkForAPIErrors(data: any): void {
    // Check for common error patterns
    if (data.error) {
      throw new Error(`${this.providerName} API error: ${data.error}`);
    }
    
    if (data.code && data.message) {
      throw new Error(`${this.providerName} API error: ${data.message}`);
    }
    
    if (data.status && data.status !== 'OK' && data.status !== 'ok') {
      throw new Error(`${this.providerName} API error: ${data.error || 'Unknown error'}`);
    }
  }

  /**
   * Calculate midday price from high and low
   */
  protected calculateMidday(high: number, low: number): number {
    return (high + low) / 2;
  }

  /**
   * Parse date string and return timestamp
   */
  protected parseTimestamp(dateStr: string): number {
    return new Date(dateStr).getTime();
  }

  /**
   * Default implementation for getHistory30Days
   */
  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }

  // Abstract methods that must be implemented by concrete classes
  abstract getCurrentStockPrice(symbol: string): Promise<StockPrice>;
  abstract getHistory(symbol: string, days: number): Promise<StockHistory>;
  abstract getIntradayHistory(symbol: string, days?: number): Promise<StockHistory>;
}