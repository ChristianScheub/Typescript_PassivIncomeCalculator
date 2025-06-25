import { AppDispatch, RootState } from "../../../../store/index";
import { calculatePortfolioData } from "../../../../store/slices/transactionsSlice";
import { calculateFinancialSummary } from "../../../../store/slices/calculatedDataSlice";
import Logger from "@/service/shared/logging/Logger/logger";
import { isFinancialSummaryAllZero } from "@/utils/isFinancialSummaryValid";
import { fetchAssetDefinitions } from '../../../../store/slices/assetDefinitionsSlice';
import { fetchTransactions } from '../../../../store/slices/transactionsSlice';
import { fetchLiabilities } from '../../../../store/slices/liabilitiesSlice';
import { fetchExpenses } from '../../../../store/slices/expensesSlice';
import { fetchIncome } from '../../../../store/slices/incomeSlice';

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
  async initialize(
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> {
    // Return existing promise if initialization is already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.isInitialized) {
      return Promise.resolve();
    }

    Logger.info("AppInitialization: Starting application initialization");

    this.initializationPromise = this._performInitialization(
      dispatch,
      getState
    );

    try {
      await this.initializationPromise;
      this.isInitialized = true;
      Logger.info(
        "AppInitialization: Application initialization completed successfully"
      );
    } catch (error) {
      Logger.error(
        "AppInitialization: Failed to initialize application: " +
          JSON.stringify(error)
      );
      this.initializationPromise = null; // Allow retry
      throw error;
    }

    return this.initializationPromise;
  }

  private async _performInitialization(
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> {
    let state = getState();

    // Step 0: Ensure all master data is loaded
    const needsTransactions = !state.transactions.items || state.transactions.items.length === 0;
    const needsAssetDefinitions = !state.assetDefinitions.items || state.assetDefinitions.items.length === 0;
    const needsLiabilities = !state.liabilities.items || state.liabilities.items.length === 0;
    const needsExpenses = !state.expenses.items || state.expenses.items.length === 0;
    const needsIncome = !state.income.items || state.income.items.length === 0;

    if (needsTransactions) {
      Logger.info('AppInitialization: Transactions missing, loading from DB...');
      await dispatch(fetchTransactions()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Transactions loaded: ${state.transactions.items.length}`);
    }
    if (needsAssetDefinitions) {
      Logger.info('AppInitialization: Asset definitions missing, loading from DB...');
      await dispatch(fetchAssetDefinitions()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Asset definitions loaded: ${state.assetDefinitions.items.length}`);
    }
    if (needsLiabilities) {
      Logger.info('AppInitialization: Liabilities missing, loading from DB...');
      await dispatch(fetchLiabilities()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Liabilities loaded: ${state.liabilities.items.length}`);
    }
    if (needsExpenses) {
      Logger.info('AppInitialization: Expenses missing, loading from DB...');
      await dispatch(fetchExpenses()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Expenses loaded: ${state.expenses.items.length}`);
    }
    if (needsIncome) {
      Logger.info('AppInitialization: Income missing, loading from DB...');
      await dispatch(fetchIncome()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Income loaded: ${state.income.items.length}`);
    }

    // Step 1: Check if portfolio cache needs to be computed
    await this._ensurePortfolioCache(dispatch, state);

    // Step 2: Ensure financial summary is computed
    await this._ensureFinancialSummary(dispatch, state);

    // Step 3: Wait a tick to allow all state updates to propagate
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  private async _ensurePortfolioCache(
    dispatch: AppDispatch,
    state: RootState
  ): Promise<void> {
    const { transactions, assetDefinitions, assetCategories } = state;

    // Check if we have the necessary data to compute portfolio cache
    const hasTransactions = transactions.items && transactions.items.length > 0;
    const hasAssetDefinitions =
      assetDefinitions.items && assetDefinitions.items.length > 0;

    // If we have transactions but no valid portfolio cache, compute it
    const needsPortfolioCalculation =
      hasTransactions &&
      (!transactions.portfolioCacheValid || !transactions.portfolioCache);

    if (needsPortfolioCalculation && hasAssetDefinitions) {
      Logger.info(
        "AppInitialization: Portfolio cache invalid or missing, triggering calculation"
      );

      const categoryData = {
        categories: assetCategories.categories || [],
        categoryOptions: assetCategories.categoryOptions || [],
        categoryAssignments: assetCategories.categoryAssignments || [],
      };

      try {
        await dispatch(
          calculatePortfolioData({
            assetDefinitions: assetDefinitions.items,
            categoryData,
          })
        ).unwrap();
        Logger.info("AppInitialization: Portfolio cache calculation completed");
      } catch (error) {
        Logger.error(
          "AppInitialization: Portfolio cache calculation failed: " +
            JSON.stringify(error)
        );
        // Don't throw - app can still work without portfolio cache
      }
    } else if (hasTransactions && !hasAssetDefinitions) {
      Logger.warn(
        "AppInitialization: Transactions exist but no asset definitions found"
      );
    } else if (transactions.portfolioCacheValid) {
      Logger.info(
        "AppInitialization: Portfolio cache is valid, skipping calculation"
      );
    } else {
      Logger.info(
        "AppInitialization: No transactions found, skipping portfolio calculation"
      );
    }
  }

  private async _ensureFinancialSummary(
    dispatch: AppDispatch,
    state: RootState
  ): Promise<void> {
    const { calculatedData } = state;

    const hasAllZeroFinancialSummary =
      calculatedData.financialSummary &&
      isFinancialSummaryAllZero(calculatedData.financialSummary);

    if (hasAllZeroFinancialSummary) {
      Logger.warn(
        "AppInitialization: Financial summary is all zero with data present, triggering recalculation"
      );

      try {
        await dispatch(calculateFinancialSummary()).unwrap();
        Logger.info(
          "AppInitialization: Financial summary calculation completed"
        );
      } catch (error) {
        Logger.error(
          "AppInitialization: Financial summary calculation failed: " +
            JSON.stringify(error)
        );
        // Don't throw - app can still work without financial summary
      }
    } else if (calculatedData.financialSummary) {
      Logger.info("AppInitialization: Financial summary already available");
    } else {
      Logger.info(
        "AppInitialization: No financial data found, skipping financial summary calculation"
      );
    }
  }

  /**
   * Reset the initialization state (useful for testing or data clearing)
   */
  reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
    Logger.info("AppInitialization: Reset initialization state");
  }

  /**
   * Check if the application has been initialized
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

export const appInitializationService = AppInitializationService.getInstance();
