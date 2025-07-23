import { useAppSelector, useAppDispatch } from './redux';
import { useEffect, useRef, useMemo, useState } from 'react';
import { AssetDefinition, Transaction } from '@/types/domains/assets/entities';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import portfolioHistoryService, { PortfolioIntradayPoint } from '@/service/infrastructure/sqlLitePortfolioHistory';
import {
  setPortfolioIntradayData,
  setPortfolioIntradayStatus,
  setPortfolioIntradayError
} from '@/store/slices/cache';
import Logger from '@/service/shared/logging/Logger/logger';
import PortfolioHistoryWorker from '../workers/portfolioHistoryWorker.ts?worker';

// --- Worker Singleton ---
let portfolioHistoryWorker: Worker | null = null;
function getPortfolioHistoryWorker() {
  if (!portfolioHistoryWorker) {
    portfolioHistoryWorker = new PortfolioHistoryWorker();
  }
  return portfolioHistoryWorker;
}

/**
 * Generic utility to recalculate portfolio history and intraday data using the worker and persist results.
 * Returns: { intraday, history }
 */
export async function recalculatePortfolioHistoryAndIntraday({ assetDefinitions, portfolioPositions }: { assetDefinitions: AssetDefinition[]; portfolioPositions: PortfolioPosition[] }) {
  // history is PortfolioHistoryPoint[] (not PortfolioIntradayPoint[])
  return new Promise<{ intraday: PortfolioIntradayPoint[]; history: import('@/types/domains/portfolio/performance').PortfolioHistoryPoint[] }>((resolve, reject) => {
    const worker = getPortfolioHistoryWorker();
    worker.postMessage({
      type: 'calculateAll',
      params: { assetDefinitions, portfolioPositions }
    });
    const handleWorkerMessage = async (event: MessageEvent) => {
      const { type, intraday, history, error } = event.data || {};
      if (type === 'resultAll') {
        await Promise.all([
          portfolioHistoryService.bulkAddPortfolioIntradayData(intraday),
          portfolioHistoryService.bulkAddPortfolioHistory(history)
        ]);
        Logger.infoService('✅ Bulk persisted intraday and history data from worker');
        worker.removeEventListener('message', handleWorkerMessage);
        resolve({ intraday, history });
      } else if (type === 'error') {
        Logger.error('❌ Worker error: ' + error);
        worker.removeEventListener('message', handleWorkerMessage);
        // Ensure rejection reason is always an Error object
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error(typeof error === 'string' ? error : JSON.stringify(error)));
        }
      }
    };
    worker.addEventListener('message', handleWorkerMessage);
  });
}

/**
 * Hook for accessing portfolio intraday data with proper Redux integration
 * - Now uses a Web Worker for all calculations
 * - Updates Redux after DB loads for better performance
 * - Batched operations for better performance
 */
export function usePortfolioIntradayView(): Array<{ date: string; value: number; timestamp: string }> {
  const dispatch = useAppDispatch();
  const { cache: portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const isHydrated = useAppSelector(state => !!state.transactions.cache);

  // Korrigierte Selektoren für Intraday-Daten
  const intradayDataObj = portfolioCache?.intradayData;
  const portfolioIntradayData = Array.isArray(intradayDataObj?.data) ? intradayDataObj.data : [];
  const portfolioIntradayStatus = intradayDataObj ? 'succeeded' : 'idle';

  // Use ref to prevent infinite loops - tracks if we've already attempted to load
  const hasAttemptedLoad = useRef(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) {
      hasAttemptedLoad.current = false;
      return;
    }
    if (!portfolioCache || !Array.isArray(portfolioCache.positions) || assetDefinitions.length === 0) {
      return;
    }
    if (portfolioIntradayData.length > 0) {
      Logger.infoService('📂 Using portfolio intraday data from Redux cache');
      return;
    }
    if (isLoadingRef.current) {
      return;
    }
    if (hasAttemptedLoad.current) {
      return;
    }
    hasAttemptedLoad.current = true;
    isLoadingRef.current = true;

    const loadPortfolioIntradayData = async () => {
      Logger.infoService('📂 Loading portfolio intraday data from IndexedDB...');
      try {
        dispatch(setPortfolioIntradayStatus('loading'));
        dispatch(setPortfolioIntradayError(null));
        // Get last 5 days range (batch operation)
        const today = new Date();
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(today.getDate() - 5);
        const startDate = fiveDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        // Try DB first
        const dbData = await portfolioHistoryService.getPortfolioIntradayByDateRange(startDate, endDate);
        if (dbData.length > 0) {
          Logger.infoService(`📂 Loaded ${dbData.length} portfolio intraday points from IndexedDB`);
          const transformedData = dbData.map(point => ({
            date: point.date,
            value: point.value, // Use 'value' instead of 'totalValue' for PortfolioIntradayPoint
            timestamp: point.timestamp
          }));
          dispatch(setPortfolioIntradayData(transformedData));
          dispatch(setPortfolioIntradayStatus('succeeded'));
          Logger.infoService(`✅ Updated Redux with ${transformedData.length} portfolio intraday points`);
        } else {
          // No data in DB, trigger calculation via worker
          Logger.infoService('🔄 No portfolio intraday data in IndexedDB, triggering worker calculation...');
          const worker = getPortfolioHistoryWorker();
          worker.postMessage({
            type: 'calculateIntraday',
            params: {
              assetDefinitions,
              portfolioPositions: portfolioCache.positions
            }
          });
          const handleWorkerMessage = async (event: MessageEvent) => {
            const { type, data, error } = event.data || {};
            if (type === 'resultIntraday') {
              // Save to DB
              await portfolioHistoryService.bulkAddPortfolioIntradayData(data);
              dispatch(setPortfolioIntradayData(data));
              dispatch(setPortfolioIntradayStatus('succeeded'));
              Logger.infoService('✅ Portfolio intraday data calculated and saved via worker');
              worker.removeEventListener('message', handleWorkerMessage);
            } else if (type === 'error') {
              dispatch(setPortfolioIntradayError(error || 'Worker error'));
              dispatch(setPortfolioIntradayStatus('failed'));
              Logger.error('❌ Worker error: ' + error);
              worker.removeEventListener('message', handleWorkerMessage);
            }
            isLoadingRef.current = false;
          };
          worker.addEventListener('message', handleWorkerMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        Logger.error('❌ Failed to load portfolio intraday data: ' + errorMessage);
        dispatch(setPortfolioIntradayError(errorMessage));
        dispatch(setPortfolioIntradayStatus('failed'));
        isLoadingRef.current = false;
      }
    };
    loadPortfolioIntradayData();
  }, [
    isHydrated,
    portfolioCache?.positions?.length,
    portfolioCache?.positions,
    portfolioCache, // Add missing dependency
    assetDefinitions.length,
    assetDefinitions,
    portfolioIntradayStatus,
    portfolioIntradayData.length,
    dispatch
  ]);

  useEffect(() => {
    const resetAttempt = () => {
      if (hasAttemptedLoad.current) {
        Logger.infoService('🔄 Resetting portfolio intraday load attempt due to data changes');
        hasAttemptedLoad.current = false;
      }
    };
    const timeoutId = setTimeout(resetAttempt, 200);
    return () => clearTimeout(timeoutId);
  }, [assetDefinitions.length]);

  return portfolioIntradayData;
}

/**
 * Hook for accessing portfolio history data (daily snapshots) with time range support
 * Supports different time ranges: 1D, 1W, 1M, 3M, 6M, 1Y, All
 * Returns data in the format expected by PortfolioHistoryView
 * Data is loaded directly from IndexedDB (no Redux cache)
 *
 * Now uses the worker for calculation and bulk DB persistence if data is missing.
 */
export function usePortfolioHistoryView(timeRange?: string): Array<{ date: string; totalValue: number; change: number; changePercentage: number }> {
  // --- Stable selectors and memoized dependencies ---
  const portfolioCache = useAppSelector((state: import('@/store').RootState) => state.transactions.cache);
  const assetDefinitions = useAppSelector(state => state.assetDefinitions.items);
  const isHydrated = useAppSelector(state => !!state.transactions.cache);
  const dispatch = useAppDispatch();

  // Wrap allowedRanges in useMemo to prevent dependency changes
  const allowedRanges = useMemo(() => ['1D', '5D', '1W', '1M', '3M', '1Y', 'ALL'] as const, []);
  type AllowedRange = typeof allowedRanges[number];

  // Memoize initialHistory to avoid recalculating on every render
  const initialHistory = useMemo(() => {
    if (
      portfolioCache &&
      timeRange &&
      allowedRanges.includes(timeRange as AllowedRange) &&
      portfolioCache.history &&
      portfolioCache.history[timeRange as AllowedRange]
    ) {
      const cacheEntry = portfolioCache.history[timeRange as AllowedRange];
      if (cacheEntry && Array.isArray(cacheEntry.data)) {
        return cacheEntry.data.map((point: { date: string; totalValue: number; totalReturn: number; totalReturnPercentage: number }) => ({
          date: point.date,
          totalValue: point.totalValue,
          change: point.totalReturn,
          changePercentage: point.totalReturnPercentage
        }));
      }
    }
    return [];
  }, [portfolioCache, timeRange, allowedRanges]);

  // State holds the final mapped structure for PortfolioHistoryView
  type PortfolioHistoryViewPoint = { date: string; totalValue: number; change: number; changePercentage: number };
  const [portfolioHistoryData, setPortfolioHistoryData] = useState<PortfolioHistoryViewPoint[]>(initialHistory);
  const isLoadingRef = useRef(false);

  // ALWAYS call all hooks in the same order - memoize values BEFORE any conditionals
  const positionsLength = useMemo(() => portfolioCache?.positions?.length ?? 0, [portfolioCache?.positions]);
  const assetDefinitionsLength = useMemo(() => assetDefinitions?.length ?? 0, [assetDefinitions]);

  // Defensive: Only return [] AFTER all hooks are called
  const shouldReturnEmpty = !portfolioCache || !Array.isArray(portfolioCache.positions);

  useEffect(() => {
    if (shouldReturnEmpty || !timeRange || !isHydrated) {
      return;
    }
    if (!portfolioCache?.positions || assetDefinitionsLength === 0) {
      return;
    }
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;

    async function getHistoryFromDbOrRecalculate(startDateStr: string, endDateStr: string) {
      // Try to get PortfolioHistoryPoint[] from DB
      const dbData = await portfolioHistoryService.getPortfolioHistoryByDateRange(startDateStr, endDateStr);
      if (dbData.length > 0) {
        Logger.infoService(`📂 Loaded ${dbData.length} portfolio history points from IndexedDB for ${timeRange}`);
        return dbData.map((point) => ({
          date: point.date,
          totalValue: point.totalValue,
          change: point.totalReturn,
          changePercentage: point.totalReturnPercentage
        }));
      } else {
        Logger.infoService(`⚠️ No portfolio history data in IndexedDB for ${timeRange}, triggering worker calculation...`);
        if (!portfolioCache?.positions) {
          Logger.infoService('❌ Cannot trigger worker calculation - missing portfolio positions');
          return [];
        }
        // Use the generic utility, which returns intraday: PortfolioIntradayPoint[], history: PortfolioHistoryPoint[]
        const { intraday, history } = await recalculatePortfolioHistoryAndIntraday({ assetDefinitions, portfolioPositions: portfolioCache.positions });
        // Redux-Update für Intraday
        dispatch(setPortfolioIntradayData(intraday));
        dispatch(setPortfolioIntradayStatus('succeeded'));
        // Update local state for history (PortfolioHistoryPoint[])
        return history.map((point) => ({
          date: point.date,
          totalValue: point.totalValue,
          change: point.totalReturn,
          changePercentage: point.totalReturnPercentage
        }));
      }
    }

    const loadPortfolioHistoryData = async () => {
      try {
        if (timeRange === '1W') {
          try {
            const today = new Date();
            const days = 7;
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - (days - 1));
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = today.toISOString().split('T')[0];
            const result = await getCombined1WHistory(startDateStr, endDateStr, portfolioHistoryService);
            // Map CombinedHistoryPoint[] to PortfolioHistoryViewPoint[]
            setPortfolioHistoryData(result.map(item => {
              // If item has a 'value' property (intraday/daily), use it; else, fallback to totalValue
              if ('value' in item && typeof item.value === 'number' && !isNaN(item.value)) {
                return {
                  date: item.date,
                  totalValue: item.value,
                  change: 0,
                  changePercentage: 0
                };
              } else if ('totalValue' in item && typeof item.totalValue === 'number' && !isNaN(item.totalValue)) {
                return {
                  date: item.date,
                  totalValue: item.totalValue,
                  change: 0,
                  changePercentage: 0
                };
              } else {
                return {
                  date: item.date,
                  totalValue: 0,
                  change: 0,
                  changePercentage: 0
                };
              }
            }));
          } catch (error) {
            Logger.error('Error in 1W history: ' + (error instanceof Error ? error.message : String(error)));
            setPortfolioHistoryData([]);
          }
        } else {
          Logger.infoService(`📂 Loading portfolio history data from IndexedDB for timeRange: ${timeRange}...`);
          const today = new Date();
          let daysBack;
          switch (timeRange) {
            case '1D': daysBack = 1; break;
            case '5D': daysBack = 5; break;
            case '1M': daysBack = 30; break;
            case '3M': daysBack = 90; break;
            case '6M': daysBack = 180; break;
            case '1Y': case '1J': daysBack = 365; break;
            case 'ALL': case 'All': case 'Max': {
              const dbData = await portfolioHistoryService.getAll('portfolioHistory');
              Logger.infoService(`📂 Loaded ${dbData.length} ALL portfolio history points from DB (full range)`);
              setPortfolioHistoryData(dbData.map(point => ({
                date: point.date,
                totalValue: point.totalValue,
                change: point.totalReturn,
                changePercentage: point.totalReturnPercentage
              })));
              isLoadingRef.current = false;
              return;
            }
            default: daysBack = 30;
          }
          const startDate = new Date(today);
          startDate.setDate(today.getDate() - daysBack);
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = today.toISOString().split('T')[0];
          const data = await getHistoryFromDbOrRecalculate(startDateStr, endDateStr);
          setPortfolioHistoryData(data);
        }
      } catch (error) {
        Logger.error(`❌ Failed to load portfolio history data for ${timeRange}: ` + (error instanceof Error ? error.message : String(error)));
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadPortfolioHistoryData();
  }, [
    timeRange,
    isHydrated,
    positionsLength,
    assetDefinitionsLength,
    assetDefinitions,
    portfolioCache?.positions,
    dispatch,
    shouldReturnEmpty,
    // Only include stable references
  ]);

  // Return data based on time range with proper structure for PortfolioHistoryView
  // For 1W, just return value as totalValue, and 0 for change fields (intraday granularity)
  const transformedData = useMemo(() => {
    if (!timeRange) {
      return [];
    }
    // All ranges: already mapped to correct structure
    return portfolioHistoryData;
  }, [timeRange, portfolioHistoryData]);

  // Return early only AFTER all hooks have been called
  if (shouldReturnEmpty) {
    return [];
  }

  return transformedData;
}

/**
 * Hook to trigger recalculation when assets change
 * (Simplified version without Redux dependencies)
 */
export function usePortfolioHistoryRecalculation() {
  const { cache: portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);

  const triggerRecalculation = async () => {
    if (!portfolioCache?.positions || !assetDefinitions) {
      Logger.infoService('⚠️ Cannot trigger recalculation - missing portfolio or asset definitions');
      return;
    }
    Logger.infoService('🔄 Manually triggering portfolio history recalculation...');
    try {
      await recalculatePortfolioHistoryAndIntraday({
        assetDefinitions,
        portfolioPositions: portfolioCache.positions
      });
      Logger.infoService('✅ Portfolio history recalculation completed');
    } catch (error) {
      Logger.error('❌ Portfolio history recalculation failed: ' + JSON.stringify(error));
      throw error;
    }
  };

  return { triggerRecalculation };
}

// --- Helper: Combine 1W History ---
interface CombinedHistoryPoint {
  date: string;
  value: number;
  transactions: Transaction[];
  type: 'intraday' | 'daily';
}

async function getCombined1WHistory(
  startDateStr: string,
  endDateStr: string,
  portfolioHistoryService: typeof import('@/service/infrastructure/sqlLitePortfolioHistory').default
): Promise<CombinedHistoryPoint[]> {
  const [intraday, daily] = await Promise.all([
    portfolioHistoryService.getPortfolioIntradayByDateRange(startDateStr, endDateStr),
    portfolioHistoryService.getPortfolioHistoryByDateRange(startDateStr, endDateStr)
  ]);
  // Map daily data by date
  const dailyByDate: Record<string, { date: string; totalValue: number }> = {};
  daily.forEach((point) => {
    dailyByDate[point.date] = { date: point.date, totalValue: point.totalValue };
  });
  // Map intraday data by date (collect all points per day)
  const intradayByDate: Record<string, Array<{ date: string; value: number; timestamp: string }>> = {};
  intraday.forEach((point: { date: string; value: number; timestamp: string }) => {
    if (!intradayByDate[point.date]) intradayByDate[point.date] = [];
    intradayByDate[point.date].push(point);
  });
  const days = 7;
  const result: CombinedHistoryPoint[] = [];
  const startDate = new Date(startDateStr);
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    // Alle Intraday-Minutenpunkte für diesen Tag übernehmen
    if (intradayByDate[dateStr]) {
      const sortedPoints = intradayByDate[dateStr].toSorted((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      sortedPoints.forEach(point => {
        result.push({
          date: point.timestamp,
          value: typeof point.value === 'number' && !isNaN(point.value) ? point.value : 0,
          transactions: [],
          type: 'intraday'
        });
      });
    }
    // Zusätzlich den Daily-Wert (sofern vorhanden)
    if (dailyByDate[dateStr]) {
      result.push({
        date: dateStr + 'T23:59:59',
        value: typeof dailyByDate[dateStr].totalValue === 'number' && !isNaN(dailyByDate[dateStr].totalValue) ? dailyByDate[dateStr].totalValue : 0,
        transactions: [],
        type: 'daily'
      });
    }
  }
  return result;
}