import { IStockAPIService } from '../interfaces/IStockAPIService';
import { 
  StockExchange,
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from '../../../../../shared/logging/Logger/logger';
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

interface FinnhubSymbolSearch {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
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
   * Get possible stock exchanges (suffixes) for a symbol
   */
  async getStockExchanges(symbol: string): Promise<StockExchange[]> {
    try {
      Logger.info(`Getting stock exchanges for symbol: ${symbol}`);
      
      // Search for the symbol to find available exchanges
      const searchResult = await this.fetchFromAPI<FinnhubSymbolSearch>('/search', {
        q: symbol
      });

      const exchanges: StockExchange[] = [];
      
      if (searchResult.result && searchResult.result.length > 0) {
        // Filter results that match our symbol
        const matchingResults = searchResult.result.filter(result => 
          result.symbol.toUpperCase().includes(symbol.toUpperCase()) ||
          result.displaySymbol.toUpperCase().includes(symbol.toUpperCase())
        );

        for (const result of matchingResults) {
          // Extract exchange suffix from display symbol
          const parts = result.displaySymbol.split('.');
          const suffix = parts.length > 1 ? parts[parts.length - 1] : '';
          
          exchanges.push({
            code: result.symbol,
            name: this.getExchangeName(suffix),
            country: this.getExchangeCountry(suffix),
            timezone: '',
            // API compatibility fields
            symbol: result.symbol,
            suffix: suffix,
            exchangeName: this.getExchangeName(suffix),
            market: result.type || 'Stock',
            currency: this.getExchangeCurrency(suffix)
          });
        }
      }

      // Add common exchanges if none found
      if (exchanges.length === 0) {
        exchanges.push(
          {
            code: `${symbol}.US`,
            name: 'NASDAQ/NYSE',
            country: 'USA',
            timezone: 'America/New_York',
            // API compatibility fields
            symbol: `${symbol}.US`,
            suffix: 'US',
            exchangeName: 'NASDAQ/NYSE',
            market: 'Stock',
            currency: 'USD'
          },
          {
            code: `${symbol}.DE`,
            name: 'XETRA',
            country: 'Germany',
            timezone: 'Europe/Berlin',
            // API compatibility fields
            symbol: `${symbol}.DE`,
            suffix: 'DE',
            exchangeName: 'XETRA',
            market: 'Stock',
            currency: 'EUR'
          }
        );
      }

      Logger.info(`Found ${exchanges.length} exchanges for ${symbol}`);
      return exchanges;
    } catch (error) {
      Logger.error(`Failed to get stock exchanges for ${symbol}: ${error}`);
      throw error;
    }
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
   * Get exchange name from suffix
   */
  private getExchangeName(suffix: string): string {
    const exchangeMap: Record<string, string> = {
      'US': 'NASDAQ/NYSE',
      'DE': 'XETRA',
      'L': 'London Stock Exchange',
      'PA': 'Euronext Paris',
      'AS': 'Euronext Amsterdam',
      'MI': 'Borsa Italiana',
      'SW': 'SIX Swiss Exchange',
      'T': 'Tokyo Stock Exchange',
      'HK': 'Hong Kong Exchange',
      'AX': 'Australian Securities Exchange'
    };
    
    return exchangeMap[suffix] || `Exchange (${suffix})`;
  }

  /**
   * Get currency for exchange suffix
   */
  private getExchangeCurrency(suffix: string): string {
    const currencyMap: Record<string, string> = {
      'US': 'USD',
      'DE': 'EUR',
      'L': 'GBP',
      'PA': 'EUR',
      'AS': 'EUR',
      'MI': 'EUR',
      'SW': 'CHF',
      'T': 'JPY',
      'HK': 'HKD',
      'AX': 'AUD'
    };
    
    return currencyMap[suffix] || 'USD';
  }

  /**
   * Get country for exchange suffix
   */
  private getExchangeCountry(suffix: string): string {
    const countryMap: Record<string, string> = {
      'US': 'USA',
      'DE': 'Germany', 
      'L': 'UK',
      'PA': 'France',
      'AS': 'Netherlands',
      'MI': 'Italy',
      'SW': 'Switzerland',
      'T': 'Japan',
      'HK': 'Hong Kong',
      'AX': 'Australia'
    };
    
    return countryMap[suffix] || 'Unknown';
  }
}