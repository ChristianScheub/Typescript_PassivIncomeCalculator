import { FinancialMetrics, FinancialReport, FinnhubBasicFinancials } from '../types';
import Logger from '../../Logger/logger';
import { fetchFromFinnhub } from '../utils/fetch';

/**
 * Get key financial metrics using Finnhub basic financials
 */
export const getFinancialMetrics = async (symbol: string): Promise<FinancialMetrics> => {
  try {
    Logger.infoService(`Fetching financial metrics for ${symbol}`);
    
    const response: FinnhubBasicFinancials = await fetchFromFinnhub('/stock/metric', {
      symbol: symbol,
      metric: 'all'
    });

    if (!response?.metric) {
      throw new Error(`No financial metrics found for symbol: ${symbol}`);
    }

    const metrics = response.metric;

    return {
      dividendYield: metrics.dividendYieldIndicatedAnnual || 0,
      eps: metrics.eps || 0,
      peRatio: metrics.peBasicExclExtraTTM || 0,
      bookValue: metrics.bookValue || 0,
      beta: metrics.beta || 1,
      debtToEquity: 0, // Not available in Finnhub basic metrics
      operatingMargin: 0, // Not available in Finnhub basic metrics
      returnOnEquity: 0, // Not available in Finnhub basic metrics
      currentRatio: metrics.currentRatio || 0,
      quickRatio: 0 // Not available in Finnhub basic metrics
    };
  } catch (error) {
    Logger.error(`Error fetching financial metrics for ${symbol}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch financial metrics for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get detailed financial reports
 * Note: Finnhub provides financial data through different endpoints
 * This is a simplified implementation - full financial reports require premium access
 */
export const getFinancialReports = async (symbol: string): Promise<FinancialReport> => {
  try {
    Logger.infoService(`Fetching financial reports for ${symbol}`);
    
    // Note: Finnhub's financials endpoint requires premium subscription
    // This is a placeholder implementation
    Logger.infoService(`Financial reports for ${symbol} require premium Finnhub subscription`);
    
    return {
      incomeStatement: [{
        revenue: 0,
        operatingIncome: 0,
        netIncome: 0
      }],
      balanceSheet: [{
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0
      }],
      cashFlow: [{
        operatingCashFlow: 0,
        investingCashFlow: 0,
        financingCashFlow: 0
      }],
      period: 'annual'
    };
  } catch (error) {
    Logger.error(`Error fetching financial reports for ${symbol}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch financial reports for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
