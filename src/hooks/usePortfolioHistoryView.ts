import { useAppSelector, useAppDispatch } from './redux';
import { useEffect, useRef, useMemo, useState } from 'react';
import portfolioHistoryService from '@/service/infrastructure/sqlLitePortfolioHistory';
import PortfolioHistoryCalculationService from '@/service/application/portfolioHistoryCalculation/PortfolioHistoryCalculationService';
import { 
  setPortfolioIntradayData, 
  setPortfolioIntradayStatus,
  setPortfolioIntradayError 
} from '@/store/slices/portfolioIntradaySlice';
import Logger from '@/service/shared/logging/Logger/logger';

/**
 * Hook for accessing portfolio intraday data with proper Redux integration
 * - Prevents infinite loops by tracking loading state
 * - Updates Redux after DB loads for better performance
 * - Batched operations for better performance
 */
export function usePortfolioIntradayView(): Array<{ date: string; value: number; timestamp: string }> {
  const dispatch = useAppDispatch();
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { isHydrated } = useAppSelector(state => state.calculatedData);
  
  // Get data from portfolioIntraday Redux slice
  const portfolioIntradayData = useAppSelector(state => state.portfolioIntraday?.portfolioIntradayData || []);
  const portfolioIntradayStatus = useAppSelector(state => state.portfolioIntraday?.portfolioIntradayStatus || 'idle');
  
  // Use ref to prevent infinite loops - tracks if we've already attempted to load
  const hasAttemptedLoad = useRef(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Reset attempt flag when hydration state or dependencies change significantly
    if (!isHydrated) {
      hasAttemptedLoad.current = false;
      return;
    }

    // Don't proceed if we don't have required data
    if (!portfolioCache?.positions || assetDefinitions.length === 0) {
      return;
    }

    // Prevent infinite loops - if we already have data in Redux, don't reload
    if (portfolioIntradayData.length > 0) {
      Logger.infoService('📂 Using portfolio intraday data from Redux cache');
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current || portfolioIntradayStatus === 'loading') {
      return;
    }

    // Prevent infinite loops - only attempt load once per session
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
        
        // BATCH OPERATION: Get all data at once from DB
        const dbData = await portfolioHistoryService.getPortfolioIntradayByDateRange(startDate, endDate);
        
        if (dbData.length > 0) {
          Logger.infoService(`📂 Loaded ${dbData.length} portfolio intraday points from IndexedDB`);
          
          // Transform to expected format
          const transformedData = dbData.map(point => ({
            date: point.date,
            value: point.value,
            timestamp: point.timestamp
          }));
          
          // UPDATE REDUX: This prevents the infinite loop!
          dispatch(setPortfolioIntradayData(transformedData));
          dispatch(setPortfolioIntradayStatus('succeeded'));
          
          Logger.infoService(`✅ Updated Redux with ${transformedData.length} portfolio intraday points`);
          
        } else {
          // No data in DB, trigger calculation
          Logger.infoService('🔄 No portfolio intraday data in IndexedDB, triggering calculation...');
          
          await PortfolioHistoryCalculationService.calculateAndSavePortfolioHistory({
            assetDefinitions,
            portfolioPositions: portfolioCache.positions
          });
          
          // After calculation, load again from DB (batch operation)
          const newDbData = await portfolioHistoryService.getPortfolioIntradayByDateRange(startDate, endDate);
          
          if (newDbData.length > 0) {
            Logger.infoService(`📂 Loaded ${newDbData.length} portfolio intraday points after calculation`);
            
            const transformedData = newDbData.map(point => ({
              date: point.date,
              value: point.value,
              timestamp: point.timestamp
            }));
            
            // UPDATE REDUX: Critical to prevent infinite loop
            dispatch(setPortfolioIntradayData(transformedData));
            dispatch(setPortfolioIntradayStatus('succeeded'));
            
          } else {
            // No data even after calculation
            dispatch(setPortfolioIntradayStatus('succeeded')); // Prevent retry
            Logger.infoService('⚠️ No portfolio intraday data available even after calculation');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        Logger.error('❌ Failed to load portfolio intraday data: ' + errorMessage);
        
        dispatch(setPortfolioIntradayError(errorMessage));
        dispatch(setPortfolioIntradayStatus('failed'));
      } finally {
        isLoadingRef.current = false;
      }
    };

    // Execute async load
    loadPortfolioIntradayData();
  }, [
    isHydrated, 
    portfolioCache?.positions?.length, // Only length to avoid object reference changes
    assetDefinitions.length, // Only length to avoid array reference changes
    portfolioIntradayStatus, // Watch status to prevent concurrent loads
    dispatch
    // NOTE: Removed portfolioIntradayData.length from dependencies to prevent re-triggers after data loads
  ]);

  // Reset attempt flag when portfolio or assets change significantly
  useEffect(() => {
    // Only reset if portfolio cache validity changes or asset count changes significantly
    const resetAttempt = () => {
      if (hasAttemptedLoad.current) {
        Logger.infoService('🔄 Resetting portfolio intraday load attempt due to data changes');
        hasAttemptedLoad.current = false;
      }
    };
    
    // Debounce the reset to avoid excessive resets during rapid state changes
    const timeoutId = setTimeout(resetAttempt, 200);
    return () => clearTimeout(timeoutId);
  }, [portfolioCache?.portfolioCacheValid, assetDefinitions.length]);

  // Return data from Redux
  return portfolioIntradayData;
}

/**
 * Hook for accessing portfolio history data (daily snapshots) with time range support
 * Supports different time ranges: 1D, 1W, 1M, 3M, 6M, 1Y, All
 * Returns data in the format expected by PortfolioHistoryView
 * Data is loaded directly from IndexedDB (no Redux cache)
 */
export function usePortfolioHistoryView(timeRange?: string): Array<{ date: string; value: number; transactions: Array<any> }> {
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { isHydrated } = useAppSelector(state => state.calculatedData);
  
  // State for storing data directly (no Redux)
  const [portfolioHistoryData, setPortfolioHistoryData] = useState<Array<{ date: string; value: number; change: number; changePercentage: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use ref to prevent infinite loops
  const isLoadingRef = useRef(false);

  // Load data from DB for time ranges other than 1D/1W
  useEffect(() => {
    if (!timeRange || timeRange === '1D' || !isHydrated) {
      return;
    }

    if (!portfolioCache?.positions || assetDefinitions.length === 0) {
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    const loadPortfolioHistoryData = async () => {
      try {
        if (timeRange === '1W') {
          // Kombinierte 1W-Logik: Hole Intraday- und Tagesdaten für die letzten 7 Tage
          const today = new Date();
          const days = 7;
          const startDate = new Date(today);
          startDate.setDate(today.getDate() - (days - 1));
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = today.toISOString().split('T')[0];

          // Hole beide Datenquellen parallel
          const [intraday, daily] = await Promise.all([
            portfolioHistoryService.getPortfolioIntradayByDateRange(startDateStr, endDateStr),
            portfolioHistoryService.getPortfolioHistoryByDateRange(startDateStr, endDateStr)
          ]);

          // Mappe Intraday nach Datum für schnellen Zugriff
          const intradayByDate: Record<string, { date: string; value: number; timestamp: string }> = {};
          intraday.forEach(point => {
            // Nur den letzten Wert pro Tag nehmen (höchster timestamp)
            if (!intradayByDate[point.date] || (intradayByDate[point.date].timestamp < point.timestamp)) {
              intradayByDate[point.date] = point;
            }
          });

          // Mappe Tagesdaten nach Datum
          const dailyByDate: Record<string, { date: string; value: number }> = {};
          daily.forEach(point => {
            dailyByDate[point.date] = point;
          });

          // Baue lückenlose Historie für die letzten 7 Tage
          const result: Array<{ date: string; value: number; transactions: Array<any> }> = [];
          for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            if (intradayByDate[dateStr]) {
              result.push({
                date: dateStr,
                value: typeof intradayByDate[dateStr].value === 'number' && !isNaN(intradayByDate[dateStr].value) ? intradayByDate[dateStr].value : 0,
                transactions: []
              });
            } else if (dailyByDate[dateStr]) {
              result.push({
                date: dateStr,
                value: typeof dailyByDate[dateStr].value === 'number' && !isNaN(dailyByDate[dateStr].value) ? dailyByDate[dateStr].value : 0,
                transactions: []
              });
            } else {
              // Kein Wert vorhanden, setze 0
              result.push({ date: dateStr, value: 0, transactions: [] });
            }
          }
          setPortfolioHistoryData(result as any);
        } else {
          // ...bestehende Logik für andere Zeitbereiche...
          Logger.infoService(`📂 Loading portfolio history data from IndexedDB for timeRange: ${timeRange}...`);
          // Calculate date range based on timeRange
          const today = new Date();
          let daysBack = 30; // Default for 1M
          switch (timeRange) {
            case '1M': daysBack = 30; break;
            case '3M': daysBack = 90; break;
            case '6M': daysBack = 180; break;
            case '1Y': case '1J': daysBack = 365; break;
            case 'ALL': case 'All': case 'Max': daysBack = 365 * 5; break;
            default: daysBack = 30;
          }
          const startDate = new Date(today);
          startDate.setDate(today.getDate() - daysBack);
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = today.toISOString().split('T')[0];
          // BATCH OPERATION: Get data from DB
          const dbData = await portfolioHistoryService.getPortfolioHistoryByDateRange(startDateStr, endDateStr);
          if (dbData.length > 0) {
            Logger.infoService(`📂 Loaded ${dbData.length} portfolio history points from IndexedDB for ${timeRange}`);
            setPortfolioHistoryData(dbData.map(point => ({
              date: point.date,
              value: point.value,
              change: point.totalReturn,
              changePercentage: point.totalReturnPercentage
            })));
          } else {
            Logger.infoService(`🔄 No portfolio history data in IndexedDB for ${timeRange}, triggering calculation...`);
            await PortfolioHistoryCalculationService.calculateAndSavePortfolioHistory({
              assetDefinitions,
              portfolioPositions: portfolioCache.positions
            });
            const newDbData = await portfolioHistoryService.getPortfolioHistoryByDateRange(startDateStr, endDateStr);
            if (newDbData.length > 0) {
              Logger.infoService(`📂 Loaded ${newDbData.length} portfolio history points after calculation for ${timeRange}`);
              setPortfolioHistoryData(newDbData.map(point => ({
                date: point.date,
                value: point.value,
                change: point.totalReturn,
                changePercentage: point.totalReturnPercentage
              })));
            }
          }
        }
      } catch (error) {
        Logger.error(`❌ Failed to load portfolio history data for ${timeRange}: ` + (error instanceof Error ? error.message : String(error)));
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    };

    loadPortfolioHistoryData();
  }, [timeRange, isHydrated, portfolioCache?.positions?.length, assetDefinitions.length]);

  // Return data based on time range with proper structure for PortfolioHistoryView
  const transformedData = useMemo(() => {
    if (!timeRange) {
      return [];
    }
    // Für 1W direkt die kombinierten Daten zurückgeben
    if (timeRange === '1W') {
      return portfolioHistoryData.map((item: any) => ({
        date: item.date,
        value: typeof item.value === 'number' && !isNaN(item.value) ? item.value : 0,
        transactions: []
      }));
    }

    // Debug logging
    Logger.info(`🔍 DEBUG portfolioHistoryView for ${timeRange}: portfolioHistoryDataLength=${portfolioHistoryData.length}`);
    if (portfolioHistoryData.length > 0) {
      Logger.info(`🔍 DEBUG first 3 items: ${JSON.stringify(portfolioHistoryData.slice(0, 3).map((item: any) => ({ date: item.date, value: item.value, type: typeof item.value })))}`);
    }

    // Transform portfolioHistoryData to the format expected by PortfolioHistoryView
    const transformed = portfolioHistoryData.map((item: any) => ({
      date: item.date,
      value: typeof item.value === 'number' && !isNaN(item.value) ? item.value : 0,
      transactions: [] // Empty array as no transaction-level data is stored in daily snapshots
    }));

    Logger.info(`🔍 DEBUG transformed data for ${timeRange}: transformedLength=${transformed.length}`);
    if (transformed.length > 0) {
      Logger.info(`🔍 DEBUG first 3 transformed: ${JSON.stringify(transformed.slice(0, 3))}`);
    }

    return transformed;
  }, [timeRange, portfolioHistoryData]);

  return transformedData;
}

/**
 * Hook to trigger recalculation when assets change
 * (Simplified version without Redux dependencies)
 */
export function usePortfolioHistoryRecalculation() {
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);

  const triggerRecalculation = async () => {
    if (!portfolioCache?.positions || !assetDefinitions) {
      Logger.infoService('⚠️ Cannot trigger recalculation - missing portfolio or asset definitions');
      return;
    }

    Logger.infoService('🔄 Manually triggering portfolio history recalculation...');
    
    try {
      await PortfolioHistoryCalculationService.calculateAndSavePortfolioHistory({
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
