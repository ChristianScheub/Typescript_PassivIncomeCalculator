import { StockSearchResult, FinnhubSymbolSearch } from '../types';
import Logger from '../../Logger/logger';
import { fetchFromFinnhub } from '../utils/fetch';

/**
 * Search for stocks by name or symbol
 */
export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  try {
    Logger.infoService(`Searching stocks with query: ${query}`);
    
    // For search, we don't format the symbol as users might search for different exchanges
    const response: FinnhubSymbolSearch = await fetchFromFinnhub('/search', { q: query });

    if (!response?.result || response.result.length === 0) {
      Logger.infoService(`No search results found for query: ${query}`);
      return [];
    }

    // Map Finnhub response to our application's StockSearchResult type
    const results: StockSearchResult[] = response.result.map((item) => ({
      symbol: item.symbol,
      name: item.description,
      exchange: item.displaySymbol.split(':')[0] || 'UNKNOWN', // Extract exchange from displaySymbol
      type: item.type,
    }));

    Logger.infoService(`Search completed for ${query}, found ${results.length} results`);
    return results;
  } catch (error) {
    Logger.error(`Error searching stocks with query ${query}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to search stocks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
