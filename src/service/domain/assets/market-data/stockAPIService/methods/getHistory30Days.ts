import { StockHistory } from '@/types/domains/assets/';
import { store } from '@/store';
import { StockAPIProvider } from '@/types/shared/base/enums';
import { FinnhubAPIService } from '../providers/FinnhubAPIService';
import { YahooAPIService } from '../providers/YahooAPIService';
import { AlphaVantageAPIService } from '../providers/AlphaVantageAPIService';
import { IEXCloudAPIService } from '../providers/IEXCloudAPIService';
import { TwelveDataAPIService } from '../providers/TwelveDataAPIService';
import { QuandlAPIService } from '../providers/QuandlAPIService';
import { EODHistoricalDataAPIService } from '../providers/EODHistoricalDataAPIService';
import { PolygonIOAPIService } from '../providers/PolygonIOAPIService';

export async function getHistory30Days(symbol: string): Promise<StockHistory> {
  const { selectedProvider, apiKeys } = store.getState().config.apis.stock;

  switch (selectedProvider) {
    case StockAPIProvider.FINNHUB: {
      const apiKey = apiKeys[StockAPIProvider.FINNHUB];
      if (!apiKey) throw new Error('Finnhub API-Key fehlt!');
      const service = new FinnhubAPIService(apiKey);
      return service.getHistory30Days(symbol);
    }
    case StockAPIProvider.YAHOO: {
      const service = new YahooAPIService();
      return service.getHistory30Days(symbol);
    }
    case StockAPIProvider.ALPHA_VANTAGE: {
      const apiKey = apiKeys[StockAPIProvider.ALPHA_VANTAGE];
      if (!apiKey) throw new Error('Alpha Vantage API-Key fehlt!');
      const service = new AlphaVantageAPIService(apiKey);
      return service.getHistory30Days(symbol);
    }
    case StockAPIProvider.IEX_CLOUD: {
      const apiKey = apiKeys[StockAPIProvider.IEX_CLOUD];
      if (!apiKey) throw new Error('IEX Cloud API-Key fehlt!');
      const service = new IEXCloudAPIService(apiKey);
      return service.getHistory30Days(symbol);
    }
    case StockAPIProvider.TWELVE_DATA: {
      const apiKey = apiKeys[StockAPIProvider.TWELVE_DATA];
      if (!apiKey) throw new Error('Twelve Data API-Key fehlt!');
      const service = new TwelveDataAPIService(apiKey);
      return service.getHistory30Days(symbol);
    }
    case StockAPIProvider.QUANDL: {
      const apiKey = apiKeys[StockAPIProvider.QUANDL];
      if (!apiKey) throw new Error('Quandl API-Key fehlt!');
      const service = new QuandlAPIService(apiKey);
      return service.getHistory30Days(symbol);
    }
    case StockAPIProvider.EOD_HISTORICAL_DATA: {
      const apiKey = apiKeys[StockAPIProvider.EOD_HISTORICAL_DATA];
      if (!apiKey) throw new Error('EOD Historical Data API-Key fehlt!');
      const service = new EODHistoricalDataAPIService(apiKey);
      return service.getHistory30Days(symbol);
    }
    case StockAPIProvider.POLYGON_IO: {
      const apiKey = apiKeys[StockAPIProvider.POLYGON_IO];
      if (!apiKey) throw new Error('Polygon.io API-Key fehlt!');
      const service = new PolygonIOAPIService(apiKey);
      return service.getHistory30Days(symbol);
    }
    default:
      throw new Error('Kein unterstützter Stock API Provider ausgewählt!');
  }
}
