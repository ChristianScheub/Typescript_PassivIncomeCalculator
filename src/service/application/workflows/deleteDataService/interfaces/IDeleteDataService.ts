export interface DeleteDataService {
    // Methods for clearing specific data
    clearAssetDefinitions(): Promise<void>;
    clearPriceHistory(): Promise<void>;
    clearAssetTransactions(): Promise<void>;
    clearDebts(): Promise<void>;
    clearExpenses(): Promise<void>;
    clearIncome(): Promise<void>;
    clearAllData(): Promise<void>;
    clearPartialData(): Promise<void>;
    clearPortfolioHistory(): Promise<void>;
    clearReduxCacheOnly(dispatch: (action: { type: string; payload?: unknown }) => void): Promise<void>;
}
