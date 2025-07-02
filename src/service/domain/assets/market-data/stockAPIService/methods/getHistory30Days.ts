import { StockHistory } from '@/types/domains/assets/';
import { store } from '@/store';
import { StockAPIProvider } from '@/types/shared/base/enums';
import { FinnhubAPIService } from '../providers/FinnhubAPIService';
import { YahooAPIService } from '../providers/YahooAPIService';
import { AlphaVantageAPIService } from '../providers/AlphaVantageAPIService';

export async function getHistory30Days(symbol: string): Promise<StockHistory> {
  const { selectedProvider, apiKeys } = store.getState().apiConfig;

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
    default:
      throw new Error('Kein unterstützter Stock API Provider ausgewählt!');
  }
}
