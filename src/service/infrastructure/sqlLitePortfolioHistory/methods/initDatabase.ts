import { openDB } from 'idb';
import { PortfolioHistoryDB } from '../interfaces/IPortfolioHistoryService';
import Logger from '@/service/shared/logging/Logger/logger';

const DB_NAME = 'portfolio-history';
const DB_VERSION = 2; // Increased version to remove intradayEntries store

export const initPortfolioHistoryDatabase = async () => {
  return openDB<PortfolioHistoryDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      Logger.infoService(`Portfolio History Database upgrade: ${oldVersion} → ${newVersion}`);
      
      // Create stores for version 1
      if (oldVersion < 1) {
        Logger.infoService('Creating portfolio history stores for version 1');
        
        // Portfolio intraday data store
        const portfolioIntradayStore = db.createObjectStore('portfolioIntradayData', { keyPath: 'timestamp' });
        portfolioIntradayStore.createIndex('by-date', 'date');
        portfolioIntradayStore.createIndex('by-timestamp', 'timestamp');
        
        // Portfolio history store
        const portfolioHistoryStore = db.createObjectStore('portfolioHistory', { keyPath: 'date' });
        portfolioHistoryStore.createIndex('by-date', 'date');
        portfolioHistoryStore.createIndex('by-value', 'value');
      }
      
      // Clean up intradayEntries store for version 2
      if (oldVersion < 2) {
        Logger.infoService('Removing intradayEntries store for version 2');
        
        // Delete the intradayEntries store if it exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((db.objectStoreNames as any).contains('intradayEntries')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (db as any).deleteObjectStore('intradayEntries');
          Logger.infoService('intradayEntries store removed successfully');
        }
        
        // Ensure portfolio stores use correct keyPath
        if (!db.objectStoreNames.contains('portfolioIntradayData')) {
          const portfolioIntradayStore = db.createObjectStore('portfolioIntradayData', { keyPath: 'timestamp' });
          portfolioIntradayStore.createIndex('by-date', 'date');
          portfolioIntradayStore.createIndex('by-timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('portfolioHistory')) {
          const portfolioHistoryStore = db.createObjectStore('portfolioHistory', { keyPath: 'date' });
          portfolioHistoryStore.createIndex('by-date', 'date');
          portfolioHistoryStore.createIndex('by-value', 'value');
        }
      }
      
      Logger.infoService('Portfolio History Database upgrade completed successfully');
    },
  });
};
