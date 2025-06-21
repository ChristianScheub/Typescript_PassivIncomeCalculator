import { IStockAPIService } from '../interfaces/IStockAPIService';
import {
  StockExchange,
  StockPrice,
  StockHistory,
  StockHistoryEntry
} from '@/types/domains/assets/';
import Logger from "@/service/shared/logging/Logger/logger";
import { CapacitorHttp } from '@capacitor/core';

/**
 * Yahoo Finance API Service Provider (Capacitor + Typescript)
 * Implementiert das IStockAPIService Interface mit echten API-Aufrufen (ohne API-Key)
 */
export class YahooAPIService implements IStockAPIService {
  // Basis-URL für Chart-Daten
  private static readonly baseUrl = 'https://query2.finance.yahoo.com/v8/finance/chart';


  private async fetchChart(symbol: string, interval: string, range: string): Promise<any> {
    if (!symbol || !interval || !range) {
      throw new Error('Symbol, interval, and range are required parameters');
    }

    const encodedSymbol = encodeURIComponent(symbol.trim().toUpperCase());
    const url = `${YahooAPIService.baseUrl}/${encodedSymbol}?interval=${interval}&range=${range}`;
    
    Logger.infoAPI(`Fetching chart data from Yahoo Finance API`, 
      { url, symbol: encodedSymbol, interval, range }
    );

    try {
      const res = await CapacitorHttp.get({
        url,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      });

      Logger.infoAPI(`Received chart data response for ${symbol}`, null, { 
        status: res.status, 
        hasData: !!res.data,
        hasChart: !!res.data?.chart,
        hasResult: !!res.data?.chart?.result,
        resultLength: res.data?.chart?.result?.length || 0
      });

      if (res.status !== 200 || !res.data.chart?.result?.[0]) {
        Logger.error(`No chart data available for ${symbol} - Status: ${res.status}, Data: ${JSON.stringify(res.data)}`);
        throw new Error(`No chart data available for ${symbol}`);
      }

      return res.data.chart.result[0];
    } catch (error) {
      Logger.error(`Fehler beim Abrufen der Chart-Daten für ${symbol}: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async getStockExchanges(symbol: string): Promise<StockExchange[]> {
    const url = `https://finance.yahoo.com/_finance_doubledown/api/resource/searchassist?searchTerm=${encodeURIComponent(symbol)}`;
    Logger.infoAPI(`Getting stock exchanges from Yahoo Finance`, { url, symbol });

    try {
      const res = await CapacitorHttp.get({
        url,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      });

      Logger.infoAPI(`Received exchange data response for ${symbol}`, null, res.data);

      if (!res.data.items) {
        Logger.warn(`No exchange data found for ${symbol}`);
        return [];
      }

      const exchanges: StockExchange[] = res.data.items
        .filter((item: any) => item.symbol.toLowerCase().startsWith(symbol.toLowerCase()))
        .map((item: any) => ({
          code: item.symbol,
          name: item.exchange ?? '',
          country: item.market ?? '',
          timezone: '',
          // Additional API compatibility fields
          symbol: item.symbol,
          suffix: item.symbol.replace(symbol, ''),
          exchangeName: item.exchange ?? '',
          market: item.market ?? '',
          currency: item.currency ?? '',
        }));

      Logger.infoService(`Found ${exchanges.length} exchanges for ${symbol}`);
      return exchanges;
    } catch (error) {
      Logger.error(`Error fetching stock exchanges for ${symbol}: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async getCurrentStockPrice(symbol: string): Promise<StockPrice> {
    Logger.infoAPI(`Getting current price from Yahoo Finance`, { symbol });

    // Validate symbol format
    if (!symbol) {
      Logger.error('Stock symbol is required for getting current price');
      throw new Error('Stock symbol is required');
    }

    try {
      const chart = await this.fetchChart(symbol, '1m', '1d');

      if (!chart.meta) {
        Logger.error(`No metadata available for ${symbol}`);
        throw new Error(`No metadata available for ${symbol}`);
      }

      if (chart.meta.regularMarketPrice === undefined || chart.meta.regularMarketPrice === null) {
        Logger.error(`Current price not available for ${symbol}. Exchange might be closed or symbol might be invalid.`);
        throw new Error(`Current price not available for ${symbol}. Exchange might be closed or symbol might be invalid.`);
      }

      const price: StockPrice = {
        symbol,
        price: chart.meta.regularMarketPrice,
        currency: chart.meta.currency ?? 'USD',
        timestamp: chart.meta.regularMarketTime * 1000,
        change: chart.meta.chartPreviousClose ? chart.meta.regularMarketPrice - chart.meta.chartPreviousClose : undefined,
        changePercent: chart.meta.chartPreviousClose ? ((chart.meta.regularMarketPrice - chart.meta.chartPreviousClose) / chart.meta.chartPreviousClose) * 100 : undefined,
      };

      Logger.infoAPI(`Current price data for ${symbol}`, null, price);
      return price;
    } catch (error) {
      Logger.error(`Error getting current price for ${symbol}: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async getHistory(symbol: string, days: number): Promise<StockHistory> {
    Logger.infoAPI(`Getting ${days} days history from Yahoo Finance`, { symbol, days });

    try {
      const chart = await this.fetchChart(symbol, '1d', `${days}d`);

      const timestamps: number[] = chart.timestamp;
      const quote = chart.indicators.quote[0];
      const currency = chart.meta.currency ?? 'USD';

      // Wir nehmen Open, Close und für Midday den Mittelwert von Open und Close (Yahoo liefert keine 12 Uhr Daten)
      const data: StockHistoryEntry[] = timestamps.map((t, i) => {
        const open = quote.open[i];
        const close = quote.close[i];
        const midday = (open + close) / 2;
        return {
          date: new Date(t * 1000).toISOString().split('T')[0],
          timestamp: t * 1000,
          open,
          high: open, // Yahoo liefert keine high/low, verwende open als Fallback
          low: close, // Yahoo liefert keine high/low, verwende close als Fallback
          close,
          midday,
          volume: quote.volume ? quote.volume[i] : undefined,
        };
      });

      const history: StockHistory = {
        symbol,
        entries: data,
        data, // For API compatibility
        currency,
      };

      Logger.infoAPI(`Historical data for ${symbol} (${days} days)`, null, {
        entriesCount: data.length,
        firstDate: data[0]?.date,
        lastDate: data[data.length - 1]?.date,
      });

      return history;
    } catch (error) {
      Logger.error(`Error getting history for ${symbol}: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async getHistory30Days(symbol: string): Promise<StockHistory> {
    return this.getHistory(symbol, 30);
  }

  async getIntradayHistory(symbol: string, days: number = 1): Promise<StockHistory> {
    // Clamp days to valid range (1-5)
    const validDays = Math.max(1, Math.min(5, days));
    const period = `${validDays}d`;
    
    Logger.infoAPI(`Getting intraday history (1-minute intervals) from Yahoo Finance for ${validDays} days`, { symbol, days: validDays });

    try {
      Logger.infoAPI(`Fetching chart data for ${symbol} with 1m interval for ${period} period`);
      const chart = await this.fetchChart(symbol, '1m', period);
      Logger.infoAPI(`Received chart data for ${symbol}`, null, { 
        hasData: !!chart, 
        hasTimestamp: !!chart?.timestamp, 
        timestampLength: chart?.timestamp?.length || 0,
        hasIndicators: !!chart?.indicators,
        hasQuote: !!chart?.indicators?.quote?.[0]
      });
      
      if (!chart || !chart.timestamp || !chart.indicators || !chart.indicators.quote || chart.timestamp.length === 0) {
        Logger.warn(`No intraday data available for ${symbol}`);
        return {
          symbol,
          entries: [],
          data: [],
          currency: chart?.meta?.currency ?? 'USD',
        };
      }

      const timestamps: number[] = chart.timestamp;
      const quote = chart.indicators.quote[0];
      const currency = chart.meta.currency ?? 'USD';

      // Erstelle 1-Minuten-Daten für die letzten X Tage
      const data: StockHistoryEntry[] = timestamps.map((t, i) => {
        const open = quote.open[i];
        const close = quote.close[i];
        const midday = (open + close) / 2;
        return {
          date: new Date(t * 1000).toISOString(), // Keep full timestamp for intraday data
          timestamp: t * 1000,
          open,
          high: quote.high ? quote.high[i] : open, // Yahoo liefert high/low bei 1m Daten
          low: quote.low ? quote.low[i] : close,
          close,
          midday,
          volume: quote.volume ? quote.volume[i] : undefined,
        };
      }).filter(entry => entry.open !== null && entry.close !== null); // Filter out null values

      const history: StockHistory = {
        symbol,
        entries: data,
        data, // For API compatibility
        currency,
      };

      Logger.infoAPI(`Intraday data for ${symbol}`, null, {
        entriesCount: data.length,
        firstTimestamp: data[0]?.timestamp,
        lastTimestamp: data[data.length - 1]?.timestamp,
        sampleEntry: data[0],
      });

      return history;
    } catch (error) {
      Logger.error(`Error getting intraday history for ${symbol}: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
