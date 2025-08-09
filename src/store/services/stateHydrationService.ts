import Logger from '@service/shared/logging/Logger/logger';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * State Hydration Service
 * Handles loading and transforming persisted state from localStorage
 * Separated from store creation for better maintainability
 */
export class StateHydrationService {
  private static readonly STORAGE_KEY = 'StrictFinance';
  private static readonly MAX_STORAGE_SIZE = 10 * 1024 * 1024; // 10MB limit
  private static readonly LEGACY_KEYS = [
    'stock_api_enabled',
    'dividend_api_enabled', 
    'selected_stock_api_provider',
    'finnhub_api_key',
    'yahoo_api_key',
    'alpha_vantage_api_key',
    'selected_divi_api_provider',
    'divi_finnhub_api_key',
    'divi_yahoo_api_key',
    'divi_alpha_vantage_api_key',
    'dashboard_mode',
    'asset_focus_time_range'
  ];

  /**
   * Get value from localStorage with error handling
   */
  static getStorageValue(key: string, defaultValue?: string): string | undefined {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return defaultValue;
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      Logger.error(`Failed to get localStorage value for key "${key}": ${error}`);
      return defaultValue;
    }
  }

  /**
   * Set value in localStorage with error handling and size validation
   */
  static setStorageValue(key: string, value: string): boolean {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
      // Check storage size before setting
      const totalSize = this.getStorageSize();
      if (totalSize + new Blob([value]).size > this.MAX_STORAGE_SIZE) {
        Logger.warn(`Storage size limit exceeded for key "${key}"`);
        return false;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      Logger.error(`Failed to set localStorage value for key "${key}": ${error}`);
      return false;
    }
  }

  /**
   * Remove value from localStorage with error handling
   */
  static removeStorageValue(key: string): boolean {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      Logger.error(`Failed to remove localStorage value for key "${key}": ${error}`);
      return false;
    }
  }

  /**
   * Get total localStorage size
   */
  static getStorageSize(): number {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return 0;
      let total = 0;
      for (const key in localStorage) {
        if (Object.hasOwn(localStorage, key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      Logger.error(`Failed to calculate storage size: ${error}`);
      return 0;
    }
  }

  /**
   * Validate state structure before loading
   */
  static validateStateStructure(state: unknown): boolean {
    if (!state || typeof state !== 'object') {
      Logger.warn('Invalid state structure: not an object');
      return false;
    }

    // Basic validation - but no size limits as these can be legitimate
    // We just check for obvious corruption or invalid data
    const s = state as Record<string, unknown>;
    if (s.transactions && typeof s.transactions === 'object' && (s.transactions as Record<string, unknown>).cache && typeof (s.transactions as Record<string, unknown>).cache !== 'object') {
      Logger.warn('State validation failed: invalid transactions.cache structure');
      return false;
    }

    return true;
  }

  /**
   * Clean up legacy localStorage keys
   */
  static cleanupLegacyStorage(): void {
    Logger.infoRedux('Cleaning up legacy localStorage keys');
    this.LEGACY_KEYS.forEach(key => {
      if (this.getStorageValue(key)) {
        Logger.infoRedux(`Removing legacy key: ${key}`);
        this.removeStorageValue(key);
      }
    });
  }

  /**
   * Load persisted state from localStorage with validation
   */
  static loadPersistedState() {
    try {
      Logger.infoRedux('Loading state from localStorage');
      const serializedState = this.getStorageValue(this.STORAGE_KEY);
      
      if (serializedState === null || serializedState === undefined) {
        Logger.infoRedux('No persisted state found in localStorage');
        return undefined;
      }

      const state = JSON.parse(serializedState);
      
      // Validate state structure
      if (!this.validateStateStructure(state)) {
        Logger.warn('State validation failed, returning undefined');
        return undefined;
      }

      const transformedState = this.transformPersistedState(state);
      
      // Clean up legacy keys after successful load
      this.cleanupLegacyStorage();
      
      return transformedState;
      
    } catch (err) {
      Logger.error('Error loading state from localStorage: ' + JSON.stringify(err));
      return undefined;
    }
  }

  /**
   * Transform and validate persisted state structure
   */
  private static transformPersistedState(state: Record<string, unknown>) {
    // Transform other state slices
    const s = state as Record<string, unknown>;
    const transactions = (s.transactions ?? {}) as Record<string, unknown>;
    const assetCategories = (s.assetCategories ?? {}) as Record<string, unknown>;
    const liabilities = (s.liabilities ?? {}) as Record<string, unknown>;
    const expenses = (s.expenses ?? {}) as Record<string, unknown>;
    const income = (s.income ?? {}) as Record<string, unknown>;
    const customAnalytics = (s.customAnalytics ?? {}) as Record<string, unknown>;
    const snackbar = (s.snackbar ?? {}) as Record<string, unknown>;
    const transformedState = {
      // Transactions werden NICHT mehr aus localStorage geladen (zu groß, aus DB geladen)
      transactions: {
        items: [],
        status: 'idle' as Status,
        error: null,
        cache: transactions.cache || undefined,
        lastCalculated: undefined,
        calculationMetadata: {
          lastCalculated: '',
          totalValue: 0,
          totalInvestment: 0,
          totalReturn: 0,
          totalReturnPercentage: 0,
          assetDefinitions: [],
          categories: [],
          categoryOptions: [],
          categoryAssignments: []
        }
      },
      // assetDefinitions NICHT mehr aus dem Storage laden, sondern leer initialisieren
      assetDefinitions: {
        items: [],
        status: 'idle' as Status,
        error: null
      },
      assetCategories: this.transformAssetCategoriesState(assetCategories),
      liabilities: this.transformSimpleState(liabilities, 'liabilities'),
      expenses: this.transformSimpleState(expenses, 'expenses'),
      income: this.transformSimpleState(income, 'income'),
      customAnalytics: this.transformCustomAnalyticsState(customAnalytics),
      forecast: s.forecast || {},
      config: this.transformConfigState(s), // Unified config transformation
      snackbar: this.transformSnackbarState(snackbar),
    };

    Logger.infoRedux('State transformation completed');
    return transformedState;
  }

  /**
   * Transform asset categories state
   */
  private static transformAssetCategoriesState(categoriesData: Record<string, unknown>) {
    return {
      categories: categoriesData?.categories || [],
      categoryOptions: categoriesData?.categoryOptions || [],
      categoryAssignments: categoriesData?.categoryAssignments || [],
      status: 'idle' as Status,
      error: null
    };
  }

  /**
   * Transform simple state slices (liabilities, expenses, income)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static transformSimpleState(data: Record<string, unknown>, _sliceName: string) {
    return {
      items: data?.items || [],
      status: 'idle' as Status,
      error: null
    };
  }

  /**
   * Transform custom analytics state
   */
  private static transformCustomAnalyticsState(analyticsData: Record<string, unknown>) {
    return {
      charts: analyticsData?.charts || [],
      isConfigPanelOpen: false,
      editingChartId: null
    };
  }

  /**
   * Transform unified config state (replaces API, dividend API, AI config, dashboard settings)
   */
  private static transformConfigState(state: Record<string, unknown>) {
    // Check if we have the new unified config structure
    const configData = state.config as Record<string, unknown> | undefined;
    
    // If we have the new unified config, use it directly with minimal transformation
    if (configData && configData.apis) {
      return {
        ...configData,
        status: 'idle',
        error: null,
      };
    }
    
    // Fall back to legacy transformation for backwards compatibility
    const apiData = state.apiConfig as Record<string, unknown> | undefined;
    const dividendApiData = state.dividendApiConfig as Record<string, unknown> | undefined;
    const aiData = state.aiConfig as Record<string, unknown> | undefined;
    const dashboardData = state.dashboardSettings as Record<string, unknown> | undefined;
    
    return {
      apis: {
        stock: {
          enabled: apiData?.isEnabled ?? (this.getStorageValue('stock_api_enabled') === 'true'),
          selectedProvider: apiData?.selectedProvider ?? ((this.getStorageValue('selected_stock_api_provider') as string) || 'finnhub'),
          apiKeys: apiData?.apiKeys || {
            finnhub: this.getStorageValue('finnhub_api_key') || undefined,
            yahoo: this.getStorageValue('yahoo_api_key') || undefined,
            alpha_vantage: this.getStorageValue('alpha_vantage_api_key') || undefined,
          },
        },
        dividend: {
          enabled: dividendApiData?.enabled ?? (this.getStorageValue('dividend_api_enabled') === 'true'),
          selectedProvider: dividendApiData?.selectedProvider ?? (this.getStorageValue('selected_divi_api_provider') || 'finnhub'),
          apiKeys: dividendApiData?.apiKeys || {
            finnhub: this.getStorageValue('divi_finnhub_api_key') || undefined,
            yahoo: this.getStorageValue('divi_yahoo_api_key') || undefined,
          },
        },
        ai: {
          enabled: aiData?.isAIEnabled ?? false,
          selectedModelId: aiData?.selectedModelId ?? 'tinyllama',
          modelStatus: aiData?.modelStatus ?? 'unloaded',
          autoLoadModel: aiData?.autoLoadModel ?? false,
          lastUsedModel: aiData?.lastUsedModel ?? null,
          preferences: aiData?.preferences || {
            maxTokens: 512,
            temperature: 0.7,
            autoGenerateInsights: true,
            showAIRecommendations: true,
          },
        },
      },
      dashboard: {
        defaultView: dashboardData?.defaultView ?? 'grid',
        compactMode: dashboardData?.compactMode ?? false,
        showPerformanceIndicators: dashboardData?.showPerformanceIndicators ?? true,
        autoRefreshInterval: dashboardData?.autoRefreshInterval ?? 300,
        hiddenSections: dashboardData?.hiddenSections ?? [],
        customLayout: dashboardData?.customLayout ?? {},
        assetFocus: {
          timeRange: typeof dashboardData?.assetFocus === 'object' && dashboardData?.assetFocus !== null && 'timeRange' in dashboardData.assetFocus
            ? (dashboardData.assetFocus as { timeRange?: string }).timeRange ?? '1M'
            : '1M',
          mode: typeof dashboardData?.assetFocus === 'object' && dashboardData?.assetFocus !== null && 'mode' in dashboardData.assetFocus
            ? (dashboardData.assetFocus as { mode?: string }).mode ?? 'smartSummary'
            : 'smartSummary',
        },
      },
      general: {
        theme: typeof dashboardData?.theme === 'string' && (['light', 'dark', 'auto'] as const).includes(dashboardData.theme as 'light' | 'dark' | 'auto')
          ? (dashboardData.theme as 'light' | 'dark' | 'auto')
          : 'auto',
        // Ensure MUI always gets a valid theme (never 'auto')
        muiTheme: typeof dashboardData?.theme === 'string' && (['light', 'dark'] as const).includes(dashboardData.theme as 'light' | 'dark')
          ? (dashboardData.theme as 'light' | 'dark')
          : 'light',
        language: 'en',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'de-DE',
      },
      status: 'idle',
      error: null,
    };
  }

  /**
   * Transform snackbar state
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static transformSnackbarState(_snackbarData: Record<string, unknown>) {
    return {
      messages: [],
      open: false
    };
  }
}

export default StateHydrationService;
