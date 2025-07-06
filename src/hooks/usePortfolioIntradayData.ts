import { useMemo, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { 
  calculatePortfolioIntradayDataDirect,
  loadPortfolioIntradayFromDB,
  savePortfolioIntradayToDB
} from '@/store/slices/cache';

/**
 * Simplified hook that only manages portfolio intraday data
 * No longer stores individual asset prices in Redux - only aggregated portfolio values
 * Much more performant and focused on what the UI actually needs
 */
export function usePortfolioIntradayData(): Array<{ date: string; value: number; timestamp: string }> {
  const dispatch = useAppDispatch();
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { isHydrated } = useAppSelector(state => state.calculatedData);
  
  const { 
    portfolioIntradayData, 
    portfolioIntradayStatus, 
    portfolioIntradayError 
  } = useAppSelector(state => state.portfolioIntraday);

  // Load portfolio intraday data from IndexedDB on first hydration
  useEffect(() => {
    console.log('🔍 usePortfolioIntradayData load effect triggered:', {
      isHydrated,
      portfolioPositionsLength: portfolioCache?.positions?.length || 0,
      portfolioIntradayDataLength: portfolioIntradayData.length,
      portfolioIntradayStatus
    });
    
    if (
      isHydrated &&
      portfolioCache?.positions && 
      portfolioIntradayData.length === 0 && 
      portfolioIntradayStatus === 'idle'
    ) {
      console.log('📥 Loading portfolio intraday data from IndexedDB...');
      // Try to load from IndexedDB first
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      dispatch(loadPortfolioIntradayFromDB({
        dateRange: { start: fiveDaysAgo, end: today }
      }));
    }
  }, [dispatch, portfolioCache, portfolioIntradayData.length, portfolioIntradayStatus, isHydrated]);

  // If we don't have data in IndexedDB, calculate fresh data directly
  useEffect(() => {
    console.log('🔍 usePortfolioIntradayData calculate effect triggered:', {
      isHydrated,
      portfolioPositionsLength: portfolioCache?.positions?.length || 0,
      assetDefinitionsLength: assetDefinitions.length,
      portfolioIntradayDataLength: portfolioIntradayData.length,
      portfolioIntradayStatus,
      portfolioIntradayError,
      conditionCheck: {
        isHydrated,
        hasPortfolioPositions: portfolioCache?.positions && portfolioCache.positions.length > 0,
        hasAssetDefinitions: assetDefinitions.length > 0,
        noPortfolioData: portfolioIntradayData.length === 0,
        statusCheck: portfolioIntradayStatus === 'idle' || 
                    (portfolioIntradayStatus === 'failed' && portfolioIntradayError?.includes('database')),
        overallCondition: isHydrated &&
          portfolioCache?.positions && 
          portfolioCache.positions.length > 0 &&
          assetDefinitions.length > 0 &&
          portfolioIntradayData.length === 0 &&
          (portfolioIntradayStatus === 'idle' || 
           (portfolioIntradayStatus === 'failed' && portfolioIntradayError?.includes('database')))
      }
    });
    
    if (
      isHydrated &&
      portfolioCache?.positions && 
      portfolioCache.positions.length > 0 &&
      assetDefinitions.length > 0 &&
      portfolioIntradayData.length === 0 &&
      (portfolioIntradayStatus === 'idle' || 
       (portfolioIntradayStatus === 'failed' && portfolioIntradayError?.includes('database')))
    ) {
      console.log('🔄 Calculating portfolio intraday data directly (no individual asset storage)...');
      dispatch(calculatePortfolioIntradayDataDirect({
        portfolioPositions: portfolioCache.positions,
        portfolioCacheId: portfolioCache.id || 'default',
        assetDefinitions
      }));
    } else {
      console.log('❌ Conditions not met for portfolio intraday calculation');
    }
  }, [
    dispatch, 
    portfolioCache, 
    assetDefinitions, 
    portfolioIntradayData.length,
    portfolioIntradayStatus,
    portfolioIntradayError,
    isHydrated
  ]);

  // Auto-save to IndexedDB when data changes
  useEffect(() => {
    console.log('🔍 usePortfolioIntradayData save effect triggered:', {
      portfolioIntradayDataLength: portfolioIntradayData.length,
      status: portfolioIntradayStatus
    });
    
    if (
      portfolioIntradayData.length > 0 && 
      portfolioIntradayStatus === 'succeeded'
    ) {
      console.log('💾 SAVING portfolio intraday data to IndexedDB...');
      // Save to IndexedDB in background
      dispatch(savePortfolioIntradayToDB(portfolioIntradayData));
    }
  }, [dispatch, portfolioIntradayData, portfolioIntradayStatus]);

  // Return cached data if available, empty array if loading/error
  return useMemo(() => {
    if (portfolioIntradayStatus === 'succeeded') {
      console.log(`✅ Returning ${portfolioIntradayData.length} portfolio intraday data points`);
      return portfolioIntradayData;
    }
    if (portfolioIntradayStatus === 'failed') {
      console.error('Failed to load portfolio intraday data:', portfolioIntradayError);
    }
    return [];
  }, [portfolioIntradayData, portfolioIntradayStatus, portfolioIntradayError]);
}
