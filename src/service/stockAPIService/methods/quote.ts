import Logger from '../../Logger/logger';
import { fetchFromFinnhub, convertPrice } from '../utils/fetch';
import { FinnhubQuote, StockQuote } from '../types';

/**
 * Get real-time stock quote for a symbol
 */
export const getQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    Logger.infoService(`Getting quote for symbol: ${symbol}`);

    const response: FinnhubQuote = await fetchFromFinnhub('/quote', { symbol: symbol });

    // Convert prices from USD to EUR if needed
    const convertedPrice = await convertPrice(response.c);
    const convertedChange = await convertPrice(response.d);
    const convertedPreviousClose = await convertPrice(response.pc);
    const convertedHigh = await convertPrice(response.h);
    const convertedLow = await convertPrice(response.l);
    const convertedOpen = await convertPrice(response.o);

    // Map Finnhub response to our application's StockQuote type
    const quote: StockQuote = {
      symbol: symbol, // Keep original symbol
      price: convertedPrice,
      change: convertedChange,
      changePercent: response.dp, // Percentage doesn't need conversion
      previousClose: convertedPreviousClose,
      high: convertedHigh,
      low: convertedLow,
      open: convertedOpen,
      timestamp: response.t,
      tradingDay: new Date().toISOString().split('T')[0] // Current date as trading day
    };

    Logger.infoService(`Quote fetched successfully for ${symbol}: ${quote.price}`);
    return quote;
  } catch (error) {
    Logger.error(`Error fetching quote for ${symbol}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch quote for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get real-time quote data for multiple stocks
 */
export const getQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  try {
    Logger.infoService(`Fetching quotes for symbols: ${symbols.join(',')}`);
    
    // Fetch quotes for all symbols in parallel
    const promises = symbols.map(symbol => getQuote(symbol));
    const quotes = await Promise.all(promises);
    
    Logger.infoService(`Quotes fetched successfully for ${symbols.length} symbols`);
    return quotes;
  } catch (error) {
    Logger.error(`Error fetching quotes for ${symbols.join(',')}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch quotes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
