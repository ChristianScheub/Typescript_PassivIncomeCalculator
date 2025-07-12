import { IStockAPIService } from '../interfaces/IStockAPIService';
import { 
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';
import exchangeService from '@service/domain/financial/exchange/exchangeService';

const BASE_URL = 'https://finnhub.io/api/v1';

// Finnhub specific types for API responses
interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  t: number[]; // Timestamps
  v: number[]; // Volume data
  s: string; // Status
}

/**
 * Finnhub API Service Provider
 * Implements the simplified IStockAPIService interface using Finnhub API
 */
export class FinnhubAPIService implements IStockAPIService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized FinnhubAPIService with simplified interface');
  }

  /**
   * Fetch data from Finnhub API
   */
  private async fetchFromAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    // Add API key
    url.searchParams.append('token', this.apiKey);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await CapacitorHttp.get({
        url: url.toString(),
        headers: {},
      });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}: ${response.data}`);
      }

      return response.data;
    } catch (error) {
      Logger.error(`Finnhub API request failed: ${error}`);
      throw error;
    }
  }

  /**
   * Convert price from USD to EUR if needed using exchangeService
   */
  private async convertPrice(priceUSD: number): Promise<number> {
    try {
      const currency = this.getCurrency();
      if (currency === 'USD') {
        return priceUSD;
      }
      
      // Use the integrated exchangeService instead of Finnhub API
      const usdToEurRate = await exchangeService.getExchangeRate();
      const priceEUR = priceUSD * usdToEurRate;
      
      Logger.info(`Converted price: ${priceUSD} USD -> ${priceEUR.toFixed(4)} EUR (rate: ${usdToEurRate})`);
      return priceEUR;
    } catch (error) {
      Logger.error(`Currency conversion failed: ${error}`);
      return priceUSD; // Return original price if conversion fails
    }
  }

  /**
   * Get currency from local storage
   */
  private getCurrency(): 'EUR' | 'USD' {
    return (localStorage.getItem('stock_currency') as 'EUR' | 'USD') || 'EUR';
  }

  /**
   * Calculate midday price from high and low
   */
  private calculateMiddayPrice(high: number, low: number): number {
    // Use average of high and low as midday approximation
    return (high + low) / 2;
  }

  /**
   * Get current stock price
   */
  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    try {
      Logger.info(`Getting current price for: ${symbol}`);
      
      const quote = await this.fetchFromAPI<FinnhubQuote>('/quote', {
        symbol: symbol
      });

      if (!quote.c) {
        throw new Error(`No price data available for ${symbol}`);
      }

      const price = await this.convertPrice(quote.c);
      const change = quote.d ? await this.convertPrice(quote.d) : undefined;

      return {
        symbol: symbol,
        price: price,
        currency: this.getCurrency(),
        timestamp: quote.t * 1000, // Convert to milliseconds
        change: change,
        changePercent: quote.dp
      };
    } catch (error) {
      Logger.error(`Failed to get current price for ${symbol}: ${error}`);
      throw error;
    }
  }

  /**
   * Get historical stock data for specified number of days
   */
  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    try {
      Logger.info(`Getting ${days} days of history for: ${symbol}`);
      
      // Validate days parameter
      if (days < 1 || days > 365) {
        throw new Error('Days parameter must be between 1 and 365');
      }

      const toTimestamp = Math.floor(Date.now() / 1000);
      const fromTimestamp = toTimestamp - (days * 24 * 60 * 60);

      const candles = await this.fetchFromAPI<FinnhubCandle>('/stock/candle', {
        symbol: symbol,
        resolution: 'D',
        from: fromTimestamp.toString(),
        to: toTimestamp.toString()
      });

      if (candles.s !== 'ok' || !candles.t || candles.t.length === 0) {
        throw new Error(`No historical data available for ${symbol}`);
      }

      const historyData: StockHistoryEntry[] = [];
      
      for (let i = 0; i < candles.t.length; i++) {
        const timestamp = candles.t[i] * 1000; // Convert to milliseconds
        const date = new Date(timestamp).toISOString().split('T')[0];
        
        const open = await this.convertPrice(candles.o[i]);
        const close = await this.convertPrice(candles.c[i]);
        const high = await this.convertPrice(candles.h[i]);
        const low = await this.convertPrice(candles.l[i]);
        const midday = this.calculateMiddayPrice(high, low);
        const convertedMidday = await this.convertPrice(midday);

        historyData.push({
          date: date,
          timestamp: timestamp,
          open: open,
          high: await this.convertPrice(candles.h[i]),
          low: await this.convertPrice(candles.l[i]),
          close: close,
          midday: convertedMidday,
          volume: candles.v[i]
        });
      }

      return {
        symbol: symbol,
        entries: historyData,
        data: historyData, // For API compatibility
        currency: this.getCurrency()
      };
    } catch (error) {
      Logger.error(`Failed to get history for ${symbol}: ${error}`);
      throw error;
    }
  }

  /**
   * Get 30 days of historical stock data
   */
  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }

  /**
   * Get intraday stock data (1-minute intervals for current day)
   * TODO: Implement intraday data fetching for Finnhub API
   */
  async getIntradayHistory(symbol: string): Promise<StockHistory> {
    Logger.warn(`Finnhub intraday history not implemented for ${symbol} - nothing happened, nothing implemented`);
    // TODO: Implement Finnhub intraday API call
    
    // Return empty history for now
    return {
      symbol,
      entries: [],
      data: [],
      currency: 'USD',
    };
  }

}