import { useMemo, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { PriceHistoryEntry } from '@/types/domains/assets';
import { calculateIntradayData, calculatePortfolioIntradayData } from '@/store/slices/intradayDataSlice';

/**
 * Hook to extract intraday data from asset definitions
 * Returns minute-level price entries for the last 5 days from all assets
 * Uses Redux store with localStorage persistence for caching
 */
export function useIntradayData(): PriceHistoryEntry[] {
  const dispatch = useAppDispatch();
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { 
    intradayEntries, 
    intradayEntriesStatus, 
    intradayEntriesError 
  } = useAppSelector(state => state.intradayData);

  useEffect(() => {
    // Only calculate if we have asset definitions and not currently loading
    if (assetDefinitions.length > 0 && intradayEntriesStatus === 'idle') {
      dispatch(calculateIntradayData(assetDefinitions));
    }
  }, [dispatch, assetDefinitions, intradayEntriesStatus]);

  // Return cached data if available, empty array if loading/error
  return useMemo(() => {
    if (intradayEntriesStatus === 'succeeded') {
      return intradayEntries;
    }
    if (intradayEntriesStatus === 'failed') {
      console.error('Failed to load intraday data:', intradayEntriesError);
    }
    return [];
  }, [intradayEntries, intradayEntriesStatus, intradayEntriesError]);
}

/**
 * Hook to get aggregated portfolio value for each intraday timestamp
 * Combines multiple assets' intraday data into portfolio-level data points
 * Uses Redux store with localStorage persistence for caching
 */
export function useIntradayPortfolioData(): Array<{ date: string; value: number; timestamp: string }> {
  const dispatch = useAppDispatch();
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const intradayEntries = useIntradayData(); // This will handle intraday data loading
  
  const { 
    portfolioIntradayData, 
    portfolioIntradayStatus, 
    portfolioIntradayError 
  } = useAppSelector(state => state.intradayData);

  useEffect(() => {
    // Only calculate if we have all required data and not currently loading
    if (
      portfolioCache?.positions && 
      portfolioCache.positions.length > 0 &&
      assetDefinitions.length > 0 &&
      intradayEntries.length > 0 &&
      portfolioIntradayStatus === 'idle'
    ) {
      dispatch(calculatePortfolioIntradayData({
        portfolioPositions: portfolioCache.positions,
        portfolioCacheId: portfolioCache.id || 'default',
        assetDefinitions,
        intradayEntries
      }));
    }
  }, [
    dispatch, 
    portfolioCache, 
    assetDefinitions, 
    intradayEntries, 
    portfolioIntradayStatus
  ]);

  // Return cached data if available, empty array if loading/error
  return useMemo(() => {
    if (portfolioIntradayStatus === 'succeeded') {
      return portfolioIntradayData;
    }
    if (portfolioIntradayStatus === 'failed') {
      console.error('Failed to load portfolio intraday data:', portfolioIntradayError);
    }
    return [];
  }, [portfolioIntradayData, portfolioIntradayStatus, portfolioIntradayError]);
}
