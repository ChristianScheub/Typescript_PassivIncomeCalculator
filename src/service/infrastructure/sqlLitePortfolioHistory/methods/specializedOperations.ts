import { dbOperations } from './dbOperations';
import { 
  PortfolioIntradayPoint, 
  PortfolioHistoryPoint 
} from '../interfaces/IPortfolioHistoryService';

const specializedOperations = {
  // Portfolio data specialized methods
  async getPortfolioIntradayByDateRange(startDate: string, endDate: string): Promise<PortfolioIntradayPoint[]> {
    try {
      const allData = await dbOperations.getAll('portfolioIntradayData') as PortfolioIntradayPoint[];
      return allData.filter(point => point.date >= startDate && point.date <= endDate);
    } catch (error) {
      console.error('Error getting portfolio intraday by date range:', error);
      return [];
    }
  },

  async getPortfolioHistoryByDateRange(startDate: string, endDate: string): Promise<PortfolioHistoryPoint[]> {
    try {
      const allData = await dbOperations.getAll('portfolioHistory') as PortfolioHistoryPoint[];
      return allData.filter(point => point.date >= startDate && point.date <= endDate);
    } catch (error) {
      console.error('Error getting portfolio history by date range:', error);
      return [];
    }
  },

  // Bulk operations - use upsert to avoid duplicate key errors
  async bulkAddPortfolioIntradayData(data: PortfolioIntradayPoint[]): Promise<void> {
    try {
      await dbOperations.bulkUpsert('portfolioIntradayData', data);
    } catch (error) {
      console.error('Error bulk adding portfolio intraday data:', error);
      throw error;
    }
  },

  async bulkUpsertPortfolioIntradayData(data: PortfolioIntradayPoint[]): Promise<void> {
    try {
      await dbOperations.bulkUpsert('portfolioIntradayData', data);
    } catch (error) {
      console.error('Error bulk upserting portfolio intraday data:', error);
      throw error;
    }
  },

  async bulkAddPortfolioHistory(data: PortfolioHistoryPoint[]): Promise<void> {
    try {
      await dbOperations.bulkUpsert('portfolioHistory', data);
    } catch (error) {
      console.error('Error bulk adding portfolio history:', error);
      throw error;
    }
  },

  async bulkUpsertPortfolioHistory(data: PortfolioHistoryPoint[]): Promise<void> {
    try {
      await dbOperations.bulkUpsert('portfolioHistory', data);
    } catch (error) {
      console.error('Error bulk upserting portfolio history:', error);
      throw error;
    }
  },

  // Data management
  async clearOldData(beforeDate: string): Promise<void> {
    try {
      const portfolioIntradayData = await dbOperations.getAll('portfolioIntradayData') as PortfolioIntradayPoint[];
      const portfolioHistoryData = await dbOperations.getAll('portfolioHistory') as PortfolioHistoryPoint[];
      
      const oldPortfolioIntraday = portfolioIntradayData.filter(point => point.date < beforeDate);
      const oldPortfolioHistory = portfolioHistoryData.filter(point => point.date < beforeDate);
      
      for (const point of oldPortfolioIntraday) {
        await dbOperations.remove('portfolioIntradayData', point.timestamp);
      }
      
      for (const point of oldPortfolioHistory) {
        await dbOperations.remove('portfolioHistory', point.date);
      }
      
      console.log(`Cleared ${oldPortfolioIntraday.length} old portfolio intraday points and ${oldPortfolioHistory.length} old portfolio history points`);
    } catch (error) {
      console.error('Error clearing old data:', error);
      throw error;
    }
  },

  async getDataSizeInfo(): Promise<{ totalEntries: number; oldestDate: string; newestDate: string }> {
    try {
      const portfolioIntradayCount = await dbOperations.count('portfolioIntradayData');
      const portfolioHistoryCount = await dbOperations.count('portfolioHistory');
      
      const allPortfolioIntraday = await dbOperations.getAll('portfolioIntradayData') as PortfolioIntradayPoint[];
      const allPortfolioHistory = await dbOperations.getAll('portfolioHistory') as PortfolioHistoryPoint[];
      
      const allDates = [
        ...allPortfolioIntraday.map(p => p.date),
        ...allPortfolioHistory.map(p => p.date)
      ].filter(Boolean).sort();
      
      return {
        totalEntries: portfolioIntradayCount + portfolioHistoryCount,
        oldestDate: allDates[0] || '',
        newestDate: allDates[allDates.length - 1] || ''
      };
    } catch (error) {
      console.error('Error getting data size info:', error);
      return { totalEntries: 0, oldestDate: '', newestDate: '' };
    }
  }
};

export { specializedOperations };
export default specializedOperations;
