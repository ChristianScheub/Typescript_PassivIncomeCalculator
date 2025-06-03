// Finnhub API Types
export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface FinnhubBasicFinancials {
  symbol: string;
  metricType: string;
  metric: {
    "10DayAverageTradingVolume": number;
    "13WeekPriceReturnDaily": number;
    "26WeekPriceReturnDaily": number;
    "3MonthAverageTradingVolume": number;
    "52WeekHigh": number;
    "52WeekLow": number;
    "52WeekLowDate": string;
    "52WeekHighDate": string;
    "52WeekPriceReturnDaily": number;
    "5DayPriceReturnDaily": number;
    beta: number;
    dividendYieldIndicatedAnnual: number;
    peBasicExclExtraTTM: number;
    eps: number;
    bookValue: number;
    currentRatio: number;
  };
}

export interface FinnhubSymbolSearch {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

export interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubForexQuote {
  c: number; // Current exchange rate
  d: number; // Change
  dp: number; // Percent change
  h: number; // High rate of the day
  l: number; // Low rate of the day
  o: number; // Open rate of the day
  pc: number; // Previous close rate
  t: number; // Timestamp
}

// Mapped types for our application
export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  tradingDay: string;
}

export interface StockHistoricalData {
  symbol: string;
  timestamp: number[];
  closePrices: number[];
  volumes: number[];
  dividends: Record<number, number>;
  splits: Record<number, number>;
}

export interface CompanyProfile {
  industry: string;
  sector: string;
  country: string;
  description: string;
  fullTimeEmployees: number;
  website: string;
  officers: {
    name: string;
    title: string;
    age?: number;
  }[];
}

export interface FinancialMetrics {
  dividendYield: number;
  eps: number;
  peRatio: number;
  bookValue: number;
  beta: number;
  debtToEquity: number;
  operatingMargin: number;
  returnOnEquity: number;
  currentRatio: number;
  quickRatio: number;
}

export interface FinancialReport {
  incomeStatement: {
    revenue: number;
    operatingIncome: number;
    netIncome: number;
  }[];
  balanceSheet: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  }[];
  cashFlow: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
  }[];
  period: 'annual' | 'quarterly';
}

export interface StockEvents {
  nextEarningsDate?: string;
  nextDividendDate?: string;
  nextExDividendDate?: string;
  lastDividendDate?: string;
  lastDividendAmount?: number;
  annualMeetingDate?: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  isin?: string;
  wkn?: string;
}

export interface OptionData {
  expirationDates: string[];
  options: {
    calls: OptionContract[];
    puts: OptionContract[];
  };
}

interface OptionContract {
  strike: number;
  lastPrice: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
  impliedVolatility: number;
}

export interface StockNews {
  title: string;
  link: string;
  publisher: string;
  publishedDate: string;
  summary: string;
}
