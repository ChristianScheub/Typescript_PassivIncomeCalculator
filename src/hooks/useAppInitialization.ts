import { useEffect, useState } from 'react';
import { useAppDispatch } from './redux';
import { appInitializationService } from '../service/application/orchestration/initService/appInitialization';
import { store } from '@/store';
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
  // Use a simple timeout-based approach for robustness
  const [isStoreReady, setIsStoreReady] = useState(false);
  
  useEffect(() => {
    // Use a minimal delay to ensure the store initialization has completed
    // This prevents infinite waiting on empty databases
    const timer = setTimeout(() => {
      setIsStoreReady(true);
    }, 100); // 100ms should be sufficient for store initialization
    
    return () => clearTimeout(timer);
  }, []);
  
  // Track initialization status
  const [isInitialized, setIsInitialized] = useState(
    appInitializationService.getInitializationStatus()
  );

  useEffect(() => {
    // Only start initialization once the store is ready
    if (!isStoreReady) {
      Logger.info('useAppInitialization: Waiting for store to be ready');
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
  }, [dispatch, isStoreReady, isInitialized, isInitializing]);

  return {
    isInitialized,
    isInitializing,
    initializationError
  };
};
