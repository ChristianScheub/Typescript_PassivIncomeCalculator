import { IStockAPIService } from '../interfaces/IStockAPIService';
import { 
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';

const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Alpha Vantage API Service Provider
 * Implements the simplified IStockAPIService interface
 */
export class AlphaVantageAPIService implements IStockAPIService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    Logger.info('Initialized AlphaVantageAPIService with simplified interface');
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.info(`Alpha Vantage: Getting current price for ${symbol}`);
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
    try {
      const response = await CapacitorHttp.get({ url });
      if (response.status !== 200) {
        throw new Error(`Alpha Vantage API error! status: ${response.status}`);
      }
      // Refactored to use optional chaining for concise and readable code
      const quote = response.data?.["Global Quote"];
      if (!quote?.["05. price"]) {
        throw new Error(`No price data available for ${symbol}`);
      }
      return {
        symbol: quote["01. symbol"] || symbol,
        price: parseFloat(quote["05. price"]),
        currency: 'USD',
        timestamp: new Date(quote["07. latest trading day"]).getTime(),
        change: quote["09. change"] ? parseFloat(quote["09. change"]) : undefined,
        changePercent: quote["10. change percent"] ? parseFloat(quote["10. change percent"].replace('%','')) : undefined
      };
    } catch (error) {
      Logger.error(`Alpha Vantage API request failed: ${error}`);
      throw error;
    }
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    Logger.info(`Alpha Vantage: Getting intraday history for ${symbol}, days=${days}`);
    // Use 5min interval, full output for up to 30 days
    const interval = '5min';
    const outputsize = days > 5 ? 'full' : 'compact';
    const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`;
    try {
      const response = await CapacitorHttp.get({ url });
      if (response.status !== 200) {
        throw new Error(`Alpha Vantage API error! status: ${response.status}`);
      }
      const series = response.data?.[`Time Series (${interval})`];
      if (!series) throw new Error('No intraday data found');
      const entries: StockHistoryEntry[] = Object.entries(series).map(([date, values]: [string, any]) => ({
        date: date.split(' ')[0],
        timestamp: new Date(date).getTime(),
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        midday: (parseFloat(values["2. high"]) + parseFloat(values["3. low"])) / 2,
        volume: parseFloat(values["5. volume"])
      }));
      // Sort by timestamp ascending, defensiv gegen undefined
      const safeEntries = entries.filter(e => typeof e.timestamp === 'number' && !isNaN(e.timestamp));
      safeEntries.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
      return {
        symbol: symbol,
        entries: safeEntries,
        data: safeEntries,
        currency: 'USD',
      };
    } catch (error) {
      Logger.error(`Alpha Vantage intraday API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.info(`Alpha Vantage: Getting ${days} days history for ${symbol}`);
    // Use TIME_SERIES_DAILY for daily history
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=full&apikey=${this.apiKey}`;
    try {
      const response = await CapacitorHttp.get({ url });
      if (response.status !== 200) {
        throw new Error(`Alpha Vantage API error! status: ${response.status}`);
      }
      const series = response.data["Time Series (Daily)"];
      if (!series) throw new Error('No daily history data found');
      let entries: StockHistoryEntry[] = Object.entries(series).map(([date, values]: [string, any]) => ({
        date,
        timestamp: new Date(date).getTime(),
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        midday: (parseFloat(values["2. high"]) + parseFloat(values["3. low"])) / 2,
        volume: parseFloat(values["5. volume"])
      }));
      // Sort by timestamp ascending, defensiv gegen undefined
      entries = entries.filter(e => typeof e.timestamp === 'number' && !isNaN(e.timestamp))
        .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
      // Only return the last N days
      if (days > 0) {
        entries = entries.slice(-days);
      }
      return {
        symbol: symbol,
        entries,
        data: entries,
        currency: 'USD',
      };
    } catch (error) {
      Logger.error(`Alpha Vantage daily history API request failed: ${error}`);
      throw error;
    }
  }

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }
}