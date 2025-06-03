import { StockNews, FinnhubNews } from '../types';
import Logger from '../../Logger/logger';
import { fetchFromFinnhub } from '../utils/fetch';

/**
 * Get latest news for a stock
 */
export const getStockNews = async (symbol: string): Promise<StockNews[]> => {
  try {
    Logger.infoService(`Fetching news for ${symbol}`);
    
    // Get current date and 7 days ago for date range
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response: FinnhubNews[] = await fetchFromFinnhub('/company-news', {
      symbol: symbol,
      from: fromDate,
      to: toDate
    });

    if (!response || response.length === 0) {
      Logger.infoService(`No news found for symbol: ${symbol}`);
      return [];
    }

    // Map Finnhub news to our StockNews format
    const news: StockNews[] = response.map((item: FinnhubNews) => ({
      title: item.headline,
      link: item.url,
      publisher: item.source,
      publishedDate: new Date(item.datetime * 1000).toISOString(),
      summary: item.summary
    }));

    Logger.infoService(`News fetched successfully for ${symbol}, found ${news.length} articles`);
    return news;
  } catch (error) {
    Logger.error(`Error fetching news for ${symbol}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch news for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
