import { 
  StockQuote,
  StockHistoricalData,
  CompanyProfile,
  FinancialMetrics,
  FinancialReport,
  StockEvents,
  StockSearchResult,
  OptionData,
  StockNews
} from '../types';

export interface IStockAPIService {
  // Current market data
  getQuote: (symbol: string) => Promise<StockQuote>;
  getQuotes: (symbols: string[]) => Promise<StockQuote[]>;

  // Historical data
  getHistoricalData: (symbol: string, range: string, interval: string) => Promise<StockHistoricalData>;

  // Company information
  getCompanyProfile: (symbol: string) => Promise<CompanyProfile>;

  // Financial data
  getFinancialMetrics: (symbol: string) => Promise<FinancialMetrics>;
  getFinancialReports: (symbol: string) => Promise<FinancialReport>;

  // Events and calendar
  getStockEvents: (symbol: string) => Promise<StockEvents>;

  // Search functionality
  searchStocks: (query: string) => Promise<StockSearchResult[]>;

  // Options data
  getOptionsData: (symbol: string) => Promise<OptionData>;

  // News
  getStockNews: (symbol: string) => Promise<StockNews[]>;
}
