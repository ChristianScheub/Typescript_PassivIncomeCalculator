import { IStockAPIService } from './interfaces/IStockAPIService';
import Logger from '../Logger/logger';
import { getQuote, getQuotes } from './methods/quote';
import { getHistoricalData } from './methods/historical';
import { getCompanyProfile } from './methods/profile';
import { getFinancialMetrics, getFinancialReports } from './methods/financials';
import { getStockEvents } from './methods/events';
import { searchStocks } from './methods/search';
import { getOptionsData } from './methods/options';
import { getStockNews } from './methods/news';

/**
 * Service for interacting with Yahoo Finance API
 */
class StockAPIService implements IStockAPIService {
  // Current market data
  getQuote = getQuote;
  getQuotes = getQuotes;

  // Historical data
  getHistoricalData = getHistoricalData;

  // Company information
  getCompanyProfile = getCompanyProfile;

  // Financial data
  getFinancialMetrics = getFinancialMetrics;
  getFinancialReports = getFinancialReports;

  // Events and calendar
  getStockEvents = getStockEvents;

  // Search functionality
  searchStocks = searchStocks;

  // Options data
  getOptionsData = getOptionsData;

  // News
  getStockNews = getStockNews;

  constructor() {
    Logger.info('Initialized StockAPIService');
  }
}

// Create singleton instance
let stockAPIServiceInstance: StockAPIService | null = null;

export const createStockAPIService = (): StockAPIService => {
  if (!stockAPIServiceInstance) {
    stockAPIServiceInstance = new StockAPIService();
  }
  return stockAPIServiceInstance;
};

export const getStockAPIService = (): StockAPIService | null => {
  return stockAPIServiceInstance;
};
