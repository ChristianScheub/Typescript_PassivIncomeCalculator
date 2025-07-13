import { createStoreConfig, type AppStore } from './config/storeConfig';
import { StateHydrationService } from './services/stateHydrationService';
import { StatePersistenceService } from './services/statePersistenceService';
import { StoreInitializationService } from './services/storeInitializationService';

// Load persisted state
const persistedState = StateHydrationService.loadPersistedState();

// Create the store with clean configuration
export const store: AppStore = createStoreConfig(persistedState);

// Initialize store based on whether we have persisted state
if (persistedState) {
  StoreInitializationService.initializeWithPersistedState(store);
} else {
  StoreInitializationService.initializeWithoutPersistedState(store);
}

// Debug: Log config after hydration
if (persistedState && persistedState.config && persistedState.config.dashboard) {
   
  console.info('[Hydration] Dashboard assetFocus nach Laden:', persistedState.config.dashboard.assetFocus);
}

// Setup state persistence with throttling
StoreInitializationService.setupStorePersistence(store, (state) => {
  StatePersistenceService.saveState(state);
});

// Setup development tools
StoreInitializationService.setupDevelopmentTools(store);

// Helper to get the store instance for use outside React
export const getStore = () => store;

// Re-export types from storeConfig to maintain single source of truth
export type { RootState, AppStore, AppDispatch, AppThunk } from './config/storeConfig';

// Export StoreState as an alias for RootState for backward compatibility
export type { RootState as StoreState } from './config/storeConfig';
