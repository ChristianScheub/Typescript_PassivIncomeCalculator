import { CachedDividends } from '@/types/domains/assets';

/**
 * Interface for handling cache updates from calculation services
 * This allows services to notify higher-level components about cache updates
 * without creating tight coupling to specific store implementations
 */
export interface CacheUpdateHandler {
  /**
   * Called when an asset calculation result should be cached
   */
  updateAssetCache(assetId: string, cachedDividends: CachedDividends): void;
}

/**
 * Simple in-memory cache update handler for testing or standalone use
 */
export class InMemoryCacheUpdateHandler implements CacheUpdateHandler {
  private readonly cache = new Map<string, CachedDividends>();

  updateAssetCache(assetId: string, cachedDividends: CachedDividends): void {
    this.cache.set(assetId, cachedDividends);
    console.log(`Cache updated for asset ${assetId}:`, cachedDividends);
  }

  getCache(assetId: string): CachedDividends | undefined {
    return this.cache.get(assetId);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * No-op cache handler for cases where caching is not needed
 */
export class NoOpCacheUpdateHandler implements CacheUpdateHandler {
  updateAssetCache(_assetId: string, _cachedDividends: CachedDividends): void {
    // Do nothing
  }
}

export default CacheUpdateHandler;
