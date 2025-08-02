import Logger from "@/service/shared/logging/Logger/logger";
import cacheRefreshService from '@/service/application/orchestration/cacheRefreshService';

/**
 * Central initialization logic for the application
 * Uses the same mechanism as pull-to-refresh to ensure UI updates properly
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
  async initialize(): Promise<void> {
    // Return existing promise if initialization is already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.isInitialized) {
      return Promise.resolve();
    }

    Logger.info("AppInitialization: Starting application initialization");

    this.initializationPromise = this._performInitialization();

    try {
      await this.initializationPromise;
      this.isInitialized = true;
      Logger.info(
        "AppInitialization: Application initialization completed successfully"
      );
    } catch (error) {
      Logger.errorStack(
        "AppInitialization: Failed to initialize application: ",
        error instanceof Error ? error : new Error(String(error))
      );
      this.initializationPromise = null; // Allow retry
      throw error;
    }

    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    Logger.info("AppInitialization: Using same mechanism as pull-to-refresh for consistent UI updates");
    
    try {
      // Use the same complete cache refresh as pull-to-refresh
      // This ensures all Redux stores are updated and all containers get UI updates
      await cacheRefreshService.refreshAllCaches();
      Logger.info("AppInitialization: Complete cache refresh completed successfully");
      
      // Wait a tick to allow all state updates to propagate
      await new Promise((resolve) => setTimeout(resolve, 0));
    } catch (error) {
      Logger.error("AppInitialization: Cache refresh failed: " + JSON.stringify(error));
      throw error;
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

  /**
   * Recalculate all caches after data has been loaded (for pull-to-refresh scenarios)
   * This method now just delegates to the same refreshAllCaches service
   */
  async recalculateCaches(): Promise<void> {
    Logger.info("AppInitialization: Starting cache recalculation using refreshAllCaches");

    try {
      // Use the same complete cache refresh as pull-to-refresh and app initialization
      await cacheRefreshService.refreshAllCaches();
      Logger.info("AppInitialization: Cache recalculation completed successfully");
    } catch (error) {
      Logger.error("AppInitialization: Cache recalculation failed: " + JSON.stringify(error));
      throw error;
    }
  }
}

export const appInitializationService = AppInitializationService.getInstance();
