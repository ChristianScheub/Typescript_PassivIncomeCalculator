import { AppDispatch, RootState } from '../index';
import { calculatePortfolioData } from '../slices/transactionsSlice';
import { calculateFinancialSummary } from '../slices/calculatedDataSlice';
import Logger from '@/service/shared/logging/Logger/logger';

/**
 * Central initialization logic for the application
 * Ensures all necessary data is loaded and caches are computed on app start
 */
export class AppInitializationService {
  private static instance: AppInitializationService;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  static getInstance(): AppInitializationService {
    if (!AppInitializationService.instance) {
      AppInitializationService.instance = new AppInitializationService();
    }
    return AppInitializationService.instance;
  }

  /**
   * Initialize the application with proper data loading and cache computation
   */
  async initialize(dispatch: AppDispatch, getState: () => RootState): Promise<void> {
    // Return existing promise if initialization is already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.isInitialized) {
      return Promise.resolve();
    }

    Logger.info('AppInitialization: Starting application initialization');

    this.initializationPromise = this._performInitialization(dispatch, getState);
    
    try {
      await this.initializationPromise;
      this.isInitialized = true;
      Logger.info('AppInitialization: Application initialization completed successfully');
    } catch (error) {
      Logger.error('AppInitialization: Failed to initialize application: ' + JSON.stringify(error));
      this.initializationPromise = null; // Allow retry
      throw error;
    }

    return this.initializationPromise;
  }

  private async _performInitialization(dispatch: AppDispatch, getState: () => RootState): Promise<void> {
    const state = getState();
    
    // Step 1: Check if portfolio cache needs to be computed
    await this._ensurePortfolioCache(dispatch, state);
    
    // Step 2: Ensure financial summary is computed
    await this._ensureFinancialSummary(dispatch, state);
    
    // Step 3: Wait a tick to allow all state updates to propagate
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  private async _ensurePortfolioCache(dispatch: AppDispatch, state: RootState): Promise<void> {
    const { transactions, assetDefinitions, assetCategories } = state;
    
    // Check if we have the necessary data to compute portfolio cache
    const hasTransactions = transactions.items && transactions.items.length > 0;
    const hasAssetDefinitions = assetDefinitions.items && assetDefinitions.items.length > 0;
    
    // If we have transactions but no valid portfolio cache, compute it
    const needsPortfolioCalculation = hasTransactions && 
      (!transactions.portfolioCacheValid || !transactions.portfolioCache);

    if (needsPortfolioCalculation && hasAssetDefinitions) {
      Logger.info('AppInitialization: Portfolio cache invalid or missing, triggering calculation');
      
      const categoryData = {
        categories: assetCategories.categories || [],
        categoryOptions: assetCategories.categoryOptions || [],
        categoryAssignments: assetCategories.categoryAssignments || []
      };

      try {
        await dispatch(calculatePortfolioData({ 
          assetDefinitions: assetDefinitions.items,
          categoryData 
        })).unwrap();
        Logger.info('AppInitialization: Portfolio cache calculation completed');
      } catch (error) {
        Logger.error('AppInitialization: Portfolio cache calculation failed: ' + JSON.stringify(error));
        // Don't throw - app can still work without portfolio cache
      }
    } else if (hasTransactions && !hasAssetDefinitions) {
      Logger.warn('AppInitialization: Transactions exist but no asset definitions found');
    } else if (transactions.portfolioCacheValid) {
      Logger.info('AppInitialization: Portfolio cache is valid, skipping calculation');
    } else {
      Logger.info('AppInitialization: No transactions found, skipping portfolio calculation');
    }
  }

  private async _ensureFinancialSummary(dispatch: AppDispatch, state: RootState): Promise<void> {
    const { transactions, liabilities, expenses, income, calculatedData } = state;
    
    // Check if we need to calculate financial summary
    const hasAnyFinancialData = 
      (transactions.items && transactions.items.length > 0) ||
      (liabilities.items && liabilities.items.length > 0) ||
      (expenses.items && expenses.items.length > 0) ||
      (income.items && income.items.length > 0);

    const needsFinancialSummary = hasAnyFinancialData && !calculatedData.financialSummary;

    if (needsFinancialSummary) {
      Logger.info('AppInitialization: Financial summary missing, triggering calculation');
      
      try {
        await dispatch(calculateFinancialSummary()).unwrap();
        Logger.info('AppInitialization: Financial summary calculation completed');
      } catch (error) {
        Logger.error('AppInitialization: Financial summary calculation failed: ' + JSON.stringify(error));
        // Don't throw - app can still work without financial summary
      }
    } else if (calculatedData.financialSummary) {
      Logger.info('AppInitialization: Financial summary already available');
    } else {
      Logger.info('AppInitialization: No financial data found, skipping financial summary calculation');
    }
  }

  /**
   * Reset the initialization state (useful for testing or data clearing)
   */
  reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
    Logger.info('AppInitialization: Reset initialization state');
  }

  /**
   * Check if the application has been initialized
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

export const appInitializationService = AppInitializationService.getInstance();
