import { fetchAssetDefinitions } from '../slices/domain';
import Logger from '@service/shared/logging/Logger/logger';
import type { AppStore, RootState } from '../config/storeConfig';
import { markStoreHydrated } from '../slices/cache';

/**
 * Store Initialization Service
 * Handles post-creation store setup and data loading
 * Separated for better organization and testability
 */
export class StoreInitializationService {
  
  /**
   * Initialize store after creation with persisted state
   */
  static initializeWithPersistedState(store: AppStore): void {
    Logger.cache('Store created with persisted state, initializing...');
    
    // Mark store as hydrated first
    store.dispatch(markStoreHydrated());
    
    // Schedule cache validation and asset definitions loading
    setTimeout(() => {
      // Load AssetDefinitions from DB after store hydration
      (store.dispatch as any)(fetchAssetDefinitions());
      
      Logger.cache('Store initialization with persisted state completed');
    }, 0);
  }

  /**
   * Initialize store without persisted state (fresh start)
   */
  static initializeWithoutPersistedState(store: AppStore): void {
    Logger.infoRedux('Store created without persisted state, initializing...');
    
    // Mark store as hydrated (empty state is also hydrated)
    store.dispatch(markStoreHydrated());
    
    // Load AssetDefinitions from DB
    (store.dispatch as any)(fetchAssetDefinitions());
    
    Logger.cache('Store initialization without persisted state completed');
  }

  /**
   * Setup store subscription for persistence
   */
  static setupStorePersistence(store: AppStore, persistenceCallback: (state: RootState) => void): void {
    const originalSubscribe = store.subscribe;
    
    // Override subscribe to add persistence logic
    store.subscribe = (listener: () => void) => {
      return originalSubscribe(() => {
        // Call persistence callback with current state
        const state = store.getState();
        persistenceCallback(state);
        
        // Call original listener
        listener();
      });
    };
    
    Logger.cache('Store persistence subscription established');
  }

  /**
   * Setup development tools
   */
  static setupDevelopmentTools(store: AppStore): void {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).__REDUX_STORE__ = store;
      Logger.infoRedux('Development tools configured');
    }
  }
}
