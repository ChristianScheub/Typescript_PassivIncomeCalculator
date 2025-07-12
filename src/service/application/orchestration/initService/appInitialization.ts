import { AppDispatch, RootState } from "@/store/index";
import { calculateFinancialSummary, calculateAssetFocusData } from "@/store/slices/domain/transactionsSlice"; // MIGRATED: Now in consolidated cache
import Logger from "@/service/shared/logging/Logger/logger";
import { isFinancialSummaryAllZero } from "@/utils/isFinancialSummaryValid";
import { fetchAssetDefinitions } from '@/store/slices/domain';
import { fetchTransactions,calculatePortfolioData } from '@/store/slices/domain';
import { fetchLiabilities } from '@/store/slices/domain';
import { fetchExpenses } from '@/store/slices/domain';
import { fetchIncome } from '@/store/slices/domain';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

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
    // Cast dispatch to ThunkDispatch for AsyncThunk actions
    const thunkDispatch = dispatch as ThunkDispatch<RootState, unknown, AnyAction>;
    let state = getState();

    // Step 0: Ensure all master data is loaded
    const needsTransactions = !state.transactions.items || state.transactions.items.length === 0;
    const needsAssetDefinitions = !state.assetDefinitions.items || state.assetDefinitions.items.length === 0;
    const needsLiabilities = !state.liabilities.items || state.liabilities.items.length === 0;
    const needsExpenses = !state.expenses.items || state.expenses.items.length === 0;
    const needsIncome = !state.income.items || state.income.items.length === 0;

    if (needsTransactions) {
      Logger.info('AppInitialization: Transactions missing, loading from DB...');
      await thunkDispatch(fetchTransactions()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Transactions loaded: ${state.transactions.items.length}`);
    }
    if (needsAssetDefinitions) {
      Logger.info('AppInitialization: Asset definitions missing, loading from DB...');
      await thunkDispatch(fetchAssetDefinitions()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Asset definitions loaded: ${state.assetDefinitions.items.length}`);
    }
    if (needsLiabilities) {
      Logger.info('AppInitialization: Liabilities missing, loading from DB...');
      await thunkDispatch(fetchLiabilities()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Liabilities loaded: ${state.liabilities.items.length}`);
    }
    if (needsExpenses) {
      Logger.info('AppInitialization: Expenses missing, loading from DB...');
      await thunkDispatch(fetchExpenses()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Expenses loaded: ${state.expenses.items.length}`);
    }
    if (needsIncome) {
      Logger.info('AppInitialization: Income missing, loading from DB...');
      await thunkDispatch(fetchIncome()).unwrap();
      state = getState();
      Logger.info(`AppInitialization: Income loaded: ${state.income.items.length}`);
    }

    // Step 1: Check if portfolio cache needs to be computed
    await this._ensurePortfolioCache(thunkDispatch, getState);

    // Step 2: Ensure financial summary is computed
    await this._ensureFinancialSummary(thunkDispatch, getState);

    // Step 3: Ensure asset focus data is computed
    await this._ensureAssetFocusData(thunkDispatch, getState);

    // Step 4: Initialize LLM model
    await this._initializeLLMModel();

    // Step 5: Wait a tick to allow all state updates to propagate
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  private async _ensurePortfolioCache(
    dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
    getState: () => RootState
  ): Promise<void> {
    const state = getState();
    const { transactions, assetDefinitions, assetCategories } = state;

    // Check if wir die nötigen Daten haben
    const hasTransactions = transactions.items && transactions.items.length > 0;
    const hasAssetDefinitions =
      assetDefinitions.items && assetDefinitions.items.length > 0;

    // Wenn wir Transaktionen haben, aber keinen gültigen Cache, berechnen
    const needsPortfolioCalculation =
      hasTransactions && !transactions.cache;

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
    } else if (transactions.cache) {
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
    dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
    getState: () => RootState
  ): Promise<void> {
    const state = getState();
    const { transactions } = state;

    const hasAllZeroFinancialSummary =
      transactions.cache?.financialSummary &&
      isFinancialSummaryAllZero(transactions.cache.financialSummary);

    if (hasAllZeroFinancialSummary) {
      Logger.warn(
        "AppInitialization: Financial summary is all zero with data present, triggering recalculation"
      );

      try {
        // Get the required data from state for the new consolidated calculateFinancialSummary
        const currentState = getState();
        const liabilities = currentState.liabilities?.items || [];
        const expenses = currentState.expenses?.items || [];
        const income = currentState.income?.items || [];
        
        await dispatch(calculateFinancialSummary({ liabilities, expenses, income })).unwrap();
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
    } else if (transactions.cache?.financialSummary) {
      Logger.info("AppInitialization: Financial summary already available");
    } else {
      Logger.info(
        "AppInitialization: No financial data found, skipping financial summary calculation"
      );
    }
  }

  private async _ensureAssetFocusData(
    dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
    getState: () => RootState
  ): Promise<void> {
    const state = getState();
    const { transactions, assetDefinitions } = state;

    // Check if we have assets or asset definitions
    const hasAssets = transactions.items && transactions.items.length > 0;
    const hasAssetDefinitions = assetDefinitions.items && assetDefinitions.items.length > 0;
    
    // Check if we already have valid asset focus data
    const hasValidAssetFocusData = transactions.cache?.assetFocusData && 
      transactions.cache.assetFocusData.assetsWithValues &&
      transactions.cache.assetFocusData.assetsWithValues.length > 0;

    if ((hasAssets || hasAssetDefinitions) && !hasValidAssetFocusData) {
      Logger.info("AppInitialization: Asset focus data missing or empty, triggering calculation");
      try {
        await dispatch(calculateAssetFocusData()).unwrap();
        Logger.info("AppInitialization: Asset focus data calculation completed");
      } catch (error) {
        Logger.error(
          "AppInitialization: Asset focus data calculation failed: " +
            JSON.stringify(error)
        );
        // Don't throw - app can still work without asset focus data
      }
    } else if (hasValidAssetFocusData) {
      Logger.info("AppInitialization: Asset focus data already available");
    } else {
      Logger.info(
        "AppInitialization: No assets or asset definitions found, skipping asset focus data calculation"
      );
    }
  }

  private async _initializeLLMModel(): Promise<void> {
    try {
      Logger.info("AppInitialization: LLM model initialization skipped - models are loaded on-demand");
      // Note: Models are now loaded on-demand via the settings page
      // No automatic model loading at app startup to improve performance
    } catch (error) {
      Logger.error(
        "AppInitialization: LLM model initialization failed: " +
          JSON.stringify(error)
      );
      // Don't throw - app can still work without LLM
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
