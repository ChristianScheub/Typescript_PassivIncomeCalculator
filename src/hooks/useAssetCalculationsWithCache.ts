import { useAppDispatch } from './redux';
import { AssetCalculationStoreService } from '@/service/domain/assets/calculations/assetCalculatorStoreService';
import { Asset } from '@/types/domains/assets/entities';
import { useMemo } from 'react';

/**
 * Hook that provides cache-aware asset calculations with automatic cache updates
 * This ensures that calculated values (including 0 values) are cached for performance
 */
export const useAssetCalculationsWithCache = () => {
  const dispatch = useAppDispatch();
  
  const calculationService = useMemo(() => {
    return new AssetCalculationStoreService(dispatch);
  }, [dispatch]);
  
  const calculateAssetMonthlyIncomeWithCache = (asset: Asset): number => {
    return calculationService.calculateAssetMonthlyIncomeWithCacheUpdate(asset);
  };
  
  const calculateTotalMonthlyAssetIncomeWithCache = (assets: Asset[]): number => {
    return calculationService.calculateTotalMonthlyAssetIncomeWithCacheUpdate(assets);
  };
  
  return {
    calculateAssetMonthlyIncomeWithCache,
    calculateTotalMonthlyAssetIncomeWithCache,
  };
};

export default useAssetCalculationsWithCache;
