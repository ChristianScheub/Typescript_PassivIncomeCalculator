import { createStoreConfig, type AppStore } from './config/storeConfig';
import { StateHydrationService } from './services/stateHydrationService';
import { StatePersistenceService } from './services/statePersistenceService';
import { StoreInitializationService } from './services/storeInitializationService';
import { hydrateStore } from './actions/hydrateAction';
import { Logger } from '@/service';

// Load persisted state
const persistedState = StateHydrationService.loadPersistedState();

// Create the store without preloaded state to avoid type issues
export const store: AppStore = createStoreConfig();

// Initialize store based on whether we have persisted state
if (persistedState) {
  // Debug: Log what's being hydrated
  Logger.infoRedux('[Store] Hydrating with config:'+ persistedState.config);
  
  // Dispatch hydration action to trigger all extraReducers
  store.dispatch(hydrateStore(persistedState as never));
  StoreInitializationService.initializeWithPersistedState(store);
  
} else {
  Logger.infoRedux('[Store] No persisted state found');
  StoreInitializationService.initializeWithoutPersistedState(store);
}

// Debug: Log config after hydration
if (persistedState?.config?.dashboard) {
  Logger.infoRedux('[Hydration] Dashboard assetFocus nach Laden: ' + persistedState.config.dashboard?.assetFocus);
}

// Setup state persistence with throttling
StoreInitializationService.setupStorePersistence(store, (state) => {
  StatePersistenceService.saveState(state);
});

// Setup development tools
StoreInitializationService.setupDevelopmentTools(store);

// Helper to get the store instance for use outside React
export const getStore = () => store;
