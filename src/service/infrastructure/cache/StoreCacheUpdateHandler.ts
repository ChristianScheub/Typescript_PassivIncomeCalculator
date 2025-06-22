import { CacheUpdateHandler } from '../../shared/cache/CacheUpdateHandler';
import { updateAssetCache } from '@/store/slices/transactionsSlice';
import { CachedDividends } from '@/types/domains/assets';
import Logger from '@/service/shared/logging/Logger/logger';
import type { AppDispatch } from '@/store';

/**
 * Store-based cache update handler that integrates with Redux store
 */
export class StoreCacheUpdateHandler implements CacheUpdateHandler {
  constructor(private dispatch: AppDispatch) {}

  updateAssetCache(assetId: string, cachedDividends: CachedDividends): void {
    this.dispatch(updateAssetCache({
      assetId,
      cachedDividends
    }));
    
    Logger.cache(`Extended asset cache via store for asset ${assetId} with monthly income: ${cachedDividends.monthlyAmount}`);
  }
}

export default StoreCacheUpdateHandler;
