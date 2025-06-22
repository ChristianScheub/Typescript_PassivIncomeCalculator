import { useEffect, useState } from 'react';
import { useAppDispatch,useAppSelector } from './redux';
import { appInitializationService } from '../store/initialization/appInitialization';
import { store } from '../store';
import Logger from '@/service/shared/logging/Logger/logger';

interface UseAppInitializationResult {
  isInitialized: boolean;
  isInitializing: boolean;
  initializationError: string | null;
}

/**
 * Hook to handle application initialization
 * Ensures all necessary data is loaded and caches are computed before components can safely render
 */
export const useAppInitialization = (): UseAppInitializationResult => {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  // Track if store is hydrated from localStorage
  const isStoreHydrated = useAppSelector(state => state.calculatedData.isHydrated);
  
  // Track initialization status
  const [isInitialized, setIsInitialized] = useState(
    appInitializationService.getInitializationStatus()
  );

  useEffect(() => {
    // Only start initialization once the store is hydrated from localStorage
    if (!isStoreHydrated) {
      Logger.info('useAppInitialization: Waiting for store hydration');
      return;
    }

    // Skip if already initialized or currently initializing
    if (isInitialized || isInitializing) {
      return;
    }

    Logger.info('useAppInitialization: Starting app initialization');
    setIsInitializing(true);
    setInitializationError(null);

    appInitializationService
      .initialize(dispatch, () => store.getState())
      .then(() => {
        Logger.info('useAppInitialization: App initialization completed successfully');
        setIsInitialized(true);
        setIsInitializing(false);
      })
      .catch((error) => {
        Logger.error('useAppInitialization: App initialization failed: ' + JSON.stringify(error));
        setInitializationError(error?.message || 'Initialization failed');
        setIsInitializing(false);
      });
  }, [dispatch, isStoreHydrated, isInitialized, isInitializing]);

  return {
    isInitialized,
    isInitializing,
    initializationError
  };
};
