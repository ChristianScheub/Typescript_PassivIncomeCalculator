import { useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from './redux';
import { usePortfolioHistoryRecalculation } from './usePortfolioHistoryView';
import { AssetDefinition } from '@/types/domains/assets';
import Logger from '@/service/shared/logging/Logger/logger';

/**
 * Hook that automatically triggers portfolio history recalculation
 * when asset definitions or their price history changes
 */
export function useAutoPortfolioHistoryUpdate() {
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { cache: portfolioCache } = useAppSelector(state => state.transactions);
  const isHydrated = useAppSelector(state => !!state.transactions.cache);
  
  const { triggerRecalculation } = usePortfolioHistoryRecalculation();
  
  // Track previous asset definitions hash to detect changes
  const previousHashRef = useRef<string>('');
  const hasInitializedRef = useRef(false);
  
  // Create hash from asset definitions and their price history
  const createAssetDefinitionsHash = useCallback(() => {
    if (!assetDefinitions || assetDefinitions.length === 0) return '';
    
    const hashInput = assetDefinitions
      .map((asset: AssetDefinition) => `${asset.id}-${asset.ticker || 'NO_TICKER'}-${JSON.stringify(asset.priceHistory || [])}`)
      .sort()
      .join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }, [assetDefinitions]);
  
  useEffect(() => {
    if (!isHydrated || !portfolioCache?.positions || assetDefinitions.length === 0) {
      return;
    }
    
    const currentHash = createAssetDefinitionsHash();
    
    // Skip if hash hasn't changed
    if (currentHash === previousHashRef.current) {
      return;
    }
    
    // Skip initial load completely - let usePortfolioIntradayView handle first load from DB
    if (!hasInitializedRef.current) {
      previousHashRef.current = currentHash;
      hasInitializedRef.current = true;
      Logger.infoService('🔄 Auto-update initialized - will monitor for asset definition changes');
      return;
    }
    
    Logger.infoService('🔄 Asset definitions changed after initialization, triggering portfolio history recalculation...');
    
    // Trigger recalculation asynchronously
    const performRecalculation = async () => {
      try {
        await triggerRecalculation();
        previousHashRef.current = currentHash;
        Logger.infoService('✅ Portfolio history auto-update completed');
      } catch (error) {
        Logger.error('❌ Portfolio history auto-update failed: ' + JSON.stringify(error));
      }
    };
    
    // Debounce the recalculation to avoid excessive calls
    const timeoutId = setTimeout(performRecalculation, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [isHydrated, assetDefinitions, portfolioCache, triggerRecalculation, createAssetDefinitionsHash]);
}

export default useAutoPortfolioHistoryUpdate;
