import { dbOperations } from './dbOperations';
import { 
  PortfolioIntradayPoint 
} from '../interfaces/IPortfolioHistoryService';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';
import Logger from '@/service/shared/logging/Logger/logger';

interface PortfolioHistoryExportData {
  version: string;
  timestamp: string;
  data: {
    portfolioIntradayData: PortfolioIntradayPoint[];
    portfolioHistory: PortfolioHistoryPoint[];
  };
}

export const importExportOperations = {
  async exportData(): Promise<string> {
    try {
      const portfolioIntradayData = await dbOperations.getAll('portfolioIntradayData') as PortfolioIntradayPoint[];
      const portfolioHistory = await dbOperations.getAll('portfolioHistory') as PortfolioHistoryPoint[];

      const exportData: PortfolioHistoryExportData = {
        version: '2.0.0', // Updated version since we removed intradayEntries
        timestamp: new Date().toISOString(),
        data: {
          portfolioIntradayData,
          portfolioHistory
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting portfolio history data:', error);
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async importData(jsonData: string): Promise<void> {
    try {
      const importData: PortfolioHistoryExportData = JSON.parse(jsonData);
      
      // Validate the data structure
      if (!importData.data || !importData.version) {
        throw new Error('Invalid export data format');
      }

      // Clear existing data (optional - you might want to merge instead)
      Logger.infoService('Clearing existing portfolio history data...');
      await dbOperations.clearStore('portfolioIntradayData');
      await dbOperations.clearStore('portfolioHistory');

      // Import portfolio intraday data
      if (importData.data.portfolioIntradayData?.length > 0) {
        Logger.infoService(`Importing ${importData.data.portfolioIntradayData.length} portfolio intraday points...`);
        await dbOperations.bulkAdd('portfolioIntradayData', importData.data.portfolioIntradayData);
      }

      // Import portfolio history
      if (importData.data.portfolioHistory?.length > 0) {
        Logger.infoService(`Importing ${importData.data.portfolioHistory.length} portfolio history points...`);
        await dbOperations.bulkAdd('portfolioHistory', importData.data.portfolioHistory);
      }

      Logger.infoService('Portfolio history data import completed successfully');
    } catch (error) {
      console.error('Error importing portfolio history data:', error);
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
