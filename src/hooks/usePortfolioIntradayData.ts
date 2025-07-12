import { useMemo, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { calculatePortfolioIntradayDataDirect } from '@/store/slices/cache';

/**
 * Simplified hook that only manages portfolio intraday data
 * No longer stores individual asset prices in Redux - only aggregated portfolio values
 * Much more performant and focused on what the UI actually needs
 */
export function usePortfolioIntradayData(): Array<{ date: string; value: number; timestamp: string }> {
  const dispatch = useAppDispatch();
  const portfolioCache = useAppSelector(state => state.transactions.cache);
  const assetDefinitions = useAppSelector(state => state.assetDefinitions.items);
  const isHydrated = useAppSelector(state => !!state.transactions.cache);

  const intradayDataObj = portfolioCache?.intradayData;
  const portfolioIntradayData = intradayDataObj?.data || [];
  const portfolioIntradayStatus = intradayDataObj ? 'succeeded' : 'idle';

  // Load portfolio intraday data from IndexedDB on first hydration
  useEffect(() => {
    if (
      isHydrated &&
      portfolioCache?.positions && 
      portfolioIntradayData.length === 0 && 
      portfolioIntradayStatus === 'idle'
    ) {
      // Try to load from IndexedDB first
      // TODO: Implement loadPortfolioIntradayFromDB in new architecture
      // dispatch(loadPortfolioIntradayFromDB({
      //   dateRange: { start: fiveDaysAgo, end: today }
      // }));
    }
  }, [dispatch, portfolioCache, portfolioIntradayData.length, portfolioIntradayStatus, isHydrated]);

  // If we don't have data in IndexedDB, calculate fresh data directly
  useEffect(() => {
    if (
      isHydrated &&
      portfolioCache?.positions && 
      portfolioCache.positions.length > 0 &&
      assetDefinitions.length > 0 &&
      portfolioIntradayData.length === 0 &&
      portfolioIntradayStatus === 'idle'
    ) {
      dispatch(calculatePortfolioIntradayDataDirect({
        portfolioCacheId: 'default'
      }) as any);
    }
  }, [
    dispatch, 
    portfolioCache, 
    assetDefinitions, 
    portfolioIntradayData.length,
    portfolioIntradayStatus,
    isHydrated
  ]);

  // Auto-save to IndexedDB when data changes
  useEffect(() => {
    if (
      portfolioIntradayData.length > 0 && 
      portfolioIntradayStatus === 'succeeded'
    ) {
      // Save to IndexedDB in background
      // TODO: Implement savePortfolioIntradayToDB in new architecture
      // dispatch(savePortfolioIntradayToDB(portfolioIntradayData));
    }
  }, [dispatch, portfolioIntradayData, portfolioIntradayStatus]);

  // Return cached data if available, empty array if loading/error
  return useMemo(() => {
    if (portfolioIntradayStatus === 'succeeded') {
      return portfolioIntradayData;
    }
    return [];
  }, [portfolioIntradayData, portfolioIntradayStatus]);
}
