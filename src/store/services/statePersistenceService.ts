import Logger from '@service/shared/logging/Logger/logger';
import { StateHydrationService } from './stateHydrationService';

/**
 * State Persistence Service
 * Handles saving state to localStorage with optimizations
 * Separated from store for better maintainability and testability
 * 
 * CRITICAL: Only persists summary data and cache, NOT raw transactions or assetDefinitions
 */
export class StatePersistenceService {
  private static readonly STORAGE_KEY = 'StrictFinance';
  private static readonly THROTTLE_DELAY = 1000; // 1 second throttle
  private static saveTimeout: NodeJS.Timeout | null = null;

  /**
   * Save state to localStorage with throttling and size validation
   */
  static saveState(state: any): void {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Throttle localStorage saves
    this.saveTimeout = setTimeout(() => {
      try {
        const stateToSave = this.prepareStateForSaving(state);
        
        // Validate size before saving
        const serialized = JSON.stringify(stateToSave);
        const size = new Blob([serialized]).size;
        
        if (size > 5 * 1024 * 1024) { // 5MB limit
          Logger.warn(`State too large to save (${Math.round(size / 1024)}KB), skipping persistence`);
          return;
        }
        
        // Check if data is empty
        const isEmpty = this.isStateEmpty(state);
        
        if (isEmpty) {
          StateHydrationService.removeStorageValue(this.STORAGE_KEY);
          Logger.infoRedux('Removed empty state from localStorage');
        } else {
          const success = StateHydrationService.setStorageValue(this.STORAGE_KEY, serialized);
          if (success) {
            Logger.infoRedux(`State saved to localStorage successfully (${Math.round(size / 1024)}KB)`);
          } else {
            Logger.warn('Failed to save state to localStorage');
          }
        }
      } catch (err) {
        Logger.error('Error saving state to localStorage: ' + JSON.stringify(err));
      }
    }, this.THROTTLE_DELAY);
  }

  /**
   * Prepare state for saving by selecting only necessary data
   * CRITICAL: Transactions and AssetDefinitions are NOT persisted to prevent localStorage overflow
   * They are loaded from DB on app start
   */
  private static prepareStateForSaving(state: any) {
    // Validate and fix lastCalculated if missing from transactions cache
    let assetFocusDataToSave = state.transactions?.cache?.assetFocusData;
    if (assetFocusDataToSave && !assetFocusDataToSave.lastCalculated) {
      Logger.warn('Persist: assetFocusData.lastCalculated fehlt, setze auf jetzt!');
      assetFocusDataToSave = { ...assetFocusDataToSave, lastCalculated: new Date().toISOString() };
    }
    
    let financialSummaryToSave = state.transactions?.cache?.financialSummary;
    if (financialSummaryToSave && !financialSummaryToSave.lastCalculated) {
      Logger.warn('Persist: financialSummary.lastCalculated fehlt, setze auf jetzt!');
      financialSummaryToSave = { ...financialSummaryToSave, lastCalculated: new Date().toISOString() };
    }

    Logger.infoRedux(`Persist: Speichere consolidated cache | assetFocusDataLastCalculated=${assetFocusDataToSave?.lastCalculated} | financialSummaryLastCalculated=${financialSummaryToSave?.lastCalculated}`);
    
    // DEBUG: Log den zu speichernden State (inkl. config)
    Logger.infoRedux(`[Persist] config zu speichern: ${JSON.stringify(state.config)}`);
    
    // IMPORTANT: Only persist summary data and cache, NOT raw transactions or assetDefinitions
    return {
      // Transactions werden NICHT mehr persistiert (zu groß, aus DB geladen)
      // transactions: { items: [] }, // Leeres Array um State-Struktur zu erhalten
      
      // assetDefinitions wird NICHT mehr gespeichert! (zu groß, wird aus DB geladen)
      assetCategories: {
        categories: state.assetCategories?.categories || [],
        categoryOptions: state.assetCategories?.categoryOptions || [],
        categoryAssignments: state.assetCategories?.categoryAssignments || []
      },
      liabilities: { items: state.liabilities?.items || [] },
      expenses: { items: state.expenses?.items || [] },
      income: { items: state.income?.items || [] },
      customAnalytics: { charts: state.customAnalytics?.charts || [] },
      forecast: state.forecast || {},
      config: state.config || {}, // Unified config instead of separate API configs
      // snackbar wird NICHT persistiert (temporärer Zustand)
      // Persist only cache data from consolidated transactions slice
      transactions: {
        cache: {
          assetFocusData: assetFocusDataToSave,
          financialSummary: financialSummaryToSave,
          history: state.transactions?.cache?.history || {},
          intradayData: state.transactions?.cache?.intradayData || null,
          metadata: state.transactions?.cache?.metadata || {}
        }
      }
    };
  }

  /**
   * Check if state is empty and should be removed from localStorage
   * Since transactions are not persisted, we check other meaningful data
   */
  private static isStateEmpty(state: any): boolean {
    const hasLiabilities = (state.liabilities?.items?.length || 0) > 0;
    const hasExpenses = (state.expenses?.items?.length || 0) > 0;
    const hasIncome = (state.income?.items?.length || 0) > 0;
    const hasCategories = (state.assetCategories?.categories?.length || 0) > 0;
    const hasCalculatedData = state.transactions?.cache?.assetFocusData || state.transactions?.cache?.financialSummary;
    
    return !hasLiabilities && !hasExpenses && !hasIncome && !hasCategories && !hasCalculatedData;
  }

  /**
   * Clear all persisted state
   */
  static clearPersistedState(): void {
    StateHydrationService.removeStorageValue(this.STORAGE_KEY);
    Logger.infoRedux('Cleared all persisted state from localStorage');
  }

  /**
   * Get storage size information
   */
  static getStorageInfo(): { key: string; size: number; exists: boolean } {
    const serializedState = StateHydrationService.getStorageValue(this.STORAGE_KEY);
    return {
      key: this.STORAGE_KEY,
      size: serializedState ? new Blob([serializedState]).size : 0,
      exists: serializedState !== null && serializedState !== undefined
    };
  }
}
