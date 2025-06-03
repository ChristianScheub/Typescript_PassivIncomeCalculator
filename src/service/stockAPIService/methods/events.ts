import { StockEvents } from '../types';
import Logger from '../../Logger/logger';
import { fetchFromFinnhub } from '../utils/fetch';

/**
 * Get upcoming and recent stock events
 * Note: Finnhub provides limited event data in free tier
 */
export const getStockEvents = async (symbol: string): Promise<StockEvents> => {
  try {
    Logger.infoService(`Fetching stock events for ${symbol}`);
    
    // Try to get earnings calendar data
    let earningsData: any = null;
    try {
      const today = new Date();
      const fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const toDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead
      
      earningsData = await fetchFromFinnhub('/calendar/earnings', {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
        symbol: symbol
      });
    } catch (earningsError) {
      Logger.infoService(`Could not fetch earnings data for ${symbol}: ${earningsError}`);
    }

    // Parse earnings data if available
    let nextEarningsDate: string | undefined;
    if (earningsData?.earningsCalendar && earningsData.earningsCalendar.length > 0) {
      const upcomingEarnings = earningsData.earningsCalendar.find((earning: any) => 
        new Date(earning.date) > new Date()
      );
      nextEarningsDate = upcomingEarnings?.date;
    }

    return {
      nextEarningsDate,
      nextDividendDate: undefined, // Not available in Finnhub free tier
      nextExDividendDate: undefined, // Not available in Finnhub free tier
      lastDividendDate: undefined, // Not available in Finnhub free tier
      lastDividendAmount: undefined, // Not available in Finnhub free tier
      annualMeetingDate: undefined // Not available in Finnhub free tier
    };
  } catch (error) {
    Logger.error(`Error fetching stock events for ${symbol}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch stock events for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
