import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchAssets, 
  addAsset, 
  updateAsset, 
  deleteAsset, 
  calculatePortfolioData,
  selectAssets,
  selectAssetsStatus,
  selectPortfolioCache,
  selectPortfolioCacheValid,
  selectPortfolioTotals,
  selectSortedAssets
} from '../../store/slices/transactionsSlice';
import { fetchAssetDefinitions } from '../../store/slices/assetDefinitionsSlice';
import { AssetsView } from '../../view/portfolio-hub/assets/AssetsView';
import { Asset } from '../../types';
import { useTranslation } from 'react-i18next';
import Logger from '../../service/Logger/logger';
import PortfolioAnalyticsContainer from '../analytics/PortfolioAnalyticsContainer';
import calculatorService from '../../service/calculatorService';
import AssetDefinitionsContainer from './AssetDefinitionsContainer';
import AssetCalendarContainer from './AssetCalendarContainer';
import { AssetCategoryContainer } from './AssetCategoryContainer';
import { PortfolioHistoryContainer } from './PortfolioHistoryContainer';

const AssetsContainer: React.FC<{ onBack?: () => void; initialAction?: string }> = ({ onBack, initialAction }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  // Use new selectors for better performance
  const assets = useAppSelector(selectAssets);
  const status = useAppSelector(selectAssetsStatus);
  const portfolioCache = useAppSelector(selectPortfolioCache);
  const portfolioCacheValid = useAppSelector(selectPortfolioCacheValid);
  const portfolioTotals = useAppSelector(selectPortfolioTotals);
  const sortedAssets = useAppSelector(selectSortedAssets);
  
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions || { items: [] });
  
  // Get category data from Redux store
  const { categories, categoryOptions, categoryAssignments } = useAppSelector(state => state.assetCategories || {
    categories: [],
    categoryOptions: [],
    categoryAssignments: []
  });
  
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isShowingDefinitions, setIsShowingDefinitions] = useState(false);
  const [isShowingCalendar, setIsShowingCalendar] = useState(false);
  const [isShowingCategories, setIsShowingCategories] = useState(false);
  const [isShowingAnalytics, setIsShowingAnalytics] = useState(false);
  const [isShowingPortfolioHistory, setIsShowingPortfolioHistory] = useState(false);

  // Handle initial action to open forms directly
  useEffect(() => {
    if (initialAction === 'addTransaction') {
      setIsAddingAsset(true);
    }
  }, [initialAction]);

  useEffect(() => {
    if (status === 'idle') {
      Logger.info('Fetching assets');
      dispatch(fetchAssets());
    }
    
    // Also fetch asset definitions
    dispatch(fetchAssetDefinitions());
    
    // Dividend cache service initialization removed (now integrated in calculatorService)
  }, [dispatch, status]);

  // Calculate portfolio data when needed (with caching)
  useEffect(() => {
    if (assets.length > 0 && assetDefinitions.length > 0 && !portfolioCacheValid) {
      Logger.info('Calculating portfolio data');
      dispatch(calculatePortfolioData({ 
        assetDefinitions, 
        categoryData: { categories, categoryOptions, categoryAssignments } 
      }));
    }
  }, [assets.length, assetDefinitions.length, portfolioCacheValid, dispatch, categories, categoryOptions, categoryAssignments]);

  // Extract values from cached totals
  const { totalAssetValue, monthlyAssetIncome, annualAssetIncome } = useMemo(() => {
    return {
      totalAssetValue: portfolioTotals?.totalValue || 0,
      monthlyAssetIncome: portfolioTotals?.monthlyIncome || 0,
      annualAssetIncome: portfolioTotals?.annualIncome || 0
    };
  }, [portfolioTotals]);

  // Portfolio data for the view (using cached data or fallback)
  const portfolioData = useMemo(() => {
    if (portfolioCache) {
      return {
        positions: portfolioCache.positions,
        totals: portfolioCache.totals,
        metadata: {
          lastCalculated: portfolioCache.lastCalculated,
          assetCount: assets.length,
          definitionCount: assetDefinitions.length,
          positionCount: portfolioCache.positions.length
        }
      };
    }
    
    const defaultTotals = {
      totalValue: 0,
      totalInvestment: 0,
      totalReturn: 0,
      totalReturnPercentage: 0,
      monthlyIncome: 0,
      annualIncome: 0,
      positionCount: 0,
      transactionCount: 0
    };
    
    return {
      positions: [],
      totals: portfolioTotals || defaultTotals,
      metadata: {
        lastCalculated: new Date().toISOString(),
        assetCount: assets.length,
        definitionCount: assetDefinitions.length,
        positionCount: 0
      }
    };
  }, [portfolioCache, portfolioTotals, assets.length, assetDefinitions.length]);

  const handleAddAsset = async (data: any) => {
    try {
      Logger.info('Adding new asset transaction' + " - " + JSON.stringify(data));
      
      // Ensure transactionType is set, default to 'buy'
      const transactionData = {
        ...data,
        transactionType: data.transactionType || 'buy'
      };
      
      await dispatch(addAsset(transactionData));
      setIsAddingAsset(false);
      
    } catch (error) {
      Logger.error('Failed to add asset transaction' + " - " + JSON.stringify(error as Error));
    }
  };

  // Helper: Calculate stock value and differences
  function updateStockValueFields(data: any) {
    if (data.type === 'stock' && data.purchaseQuantity && data.purchasePrice) {
      // Note: currentPrice is now stored in AssetDefinition, not in transaction
      // This function only calculates purchase-related values for transactions
      const purchaseValue = data.purchaseQuantity * data.purchasePrice;
      data.value = purchaseValue; // Transaction value is based on purchase data
      
      // Value differences will be calculated at portfolio level using AssetDefinition.currentPrice
      Logger.info(`Transaction value calculated from purchase data: ${data.purchaseQuantity} × ${data.purchasePrice} = ${purchaseValue}`);
    }
  }

  const handleUpdateAsset = async (data: any) => {
    if (!editingAsset) return;
    try {
      Logger.info('Updating asset transaction' + " - " + JSON.stringify({ id: editingAsset.id, data }));
      
      // Ensure transactionType is preserved, default to 'buy'
      const transactionData = {
        ...data,
        transactionType: data.transactionType || editingAsset.transactionType || 'buy'
      };
      
      updateStockValueFields(transactionData);
      await dispatch(updateAsset({ ...transactionData, id: editingAsset.id }));
      setEditingAsset(null);
    } catch (error) {
      Logger.error('Failed to update asset transaction' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      try {
        Logger.info('Deleting asset' + " - " + JSON.stringify({ id }));
        await dispatch(deleteAsset(id));
      } catch (error) {
        Logger.error('Failed to delete asset' + " - " + JSON.stringify(error as Error));
      }
    }
  };

  const getAssetTypeLabel = useCallback((type: string): string => {
    return t(`assets.types.${type}`);
  }, [t]);

  // Cache-Miss-Handling: Nach jedem Render Cache für fehlende/ungültige Assets nachziehen
  // Optimiert: Läuft nur wenn sich assets ändern oder Portfolio-Cache invalidiert wird
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    if (portfolioCacheValid) return; // Skip wenn Portfolio-Cache gültig ist
    
    Logger.info('Checking and updating asset dividend caches');
    
    // Sammle erst alle Assets die ein Cache-Update benötigen
    const assetsNeedingUpdate = assets.filter(asset => {
      if (!calculatorService.calculateAssetMonthlyIncomeWithCache) return false;
      const result = calculatorService.calculateAssetMonthlyIncomeWithCache(asset);
      return !result.cacheHit && result.cacheDataToUpdate;
    });

    if (assetsNeedingUpdate.length > 0) {
      Logger.info(`Updating dividend cache for ${assetsNeedingUpdate.length} assets`);
      
      // Führe Updates nur für die benötigten Assets durch
      assetsNeedingUpdate.forEach(asset => {
        if (!calculatorService.calculateAssetMonthlyIncomeWithCache) return;
        const result = calculatorService.calculateAssetMonthlyIncomeWithCache(asset);
        if (!result.cacheHit && result.cacheDataToUpdate) {
          // TODO: Handle dividend cache update if needed in new architecture
          // const cachedDividends = createCachedDividends(
          //   result.cacheDataToUpdate.monthlyAmount,
          //   result.cacheDataToUpdate.annualAmount,
          //   result.cacheDataToUpdate.monthlyBreakdown,
          //   asset
          // );
          // dispatch(updateAssetDividendCache({ assetId: asset.id, cachedDividends }));
        }
      });
    }
  }, [assets.length, portfolioCacheValid, dispatch]); // Dependency auf asset length und cache validity



  const handleNavigateToDefinitions = () => {
    Logger.info('Navigating to asset definitions');
    setIsShowingDefinitions(true);
  };

  const handleNavigateToCalendar = () => {
    Logger.info('Navigating to asset calendar');
    setIsShowingCalendar(true);
  };

  const handleNavigateToCategories = () => {
    Logger.info('Navigating to asset categories');
    setIsShowingCategories(true);
  };

  const handleNavigateToAnalytics = () => {
    Logger.info('Navigating to portfolio analytics');
    setIsShowingAnalytics(true);
  };

  const handleNavigateToPortfolioHistory = () => {
    Logger.info('Navigating to portfolio history');
    setIsShowingPortfolioHistory(true);
  };

  const handleBackToAssets = () => {
    Logger.info('Returning to assets main view');
    setIsShowingDefinitions(false);
    setIsShowingCalendar(false);
    setIsShowingCategories(false);
    setIsShowingAnalytics(false);
    setIsShowingPortfolioHistory(false);
  };

  // If showing definitions, render the definitions container instead
  if (isShowingDefinitions) {
    return (
      <AssetDefinitionsContainer 
        onBack={handleBackToAssets}
      />
    );
  }

  // If showing calendar, render the calendar container instead
  if (isShowingCalendar) {
    return (
      <AssetCalendarContainer 
        onBack={handleBackToAssets}
      />
    );
  }

  // If showing categories, render the categories container instead
  if (isShowingCategories) {
    return (
      <AssetCategoryContainer 
        onBack={handleBackToAssets}
      />
    );
  }

  // If showing analytics, render the analytics container instead
  if (isShowingAnalytics) {
    return (
      <PortfolioAnalyticsContainer 
        onBack={handleBackToAssets}
      />
    );
  }

  // If showing portfolio history, render the portfolio history container instead
  if (isShowingPortfolioHistory) {
    return (
      <PortfolioHistoryContainer 
        assets={assets}
        assetDefinitions={assetDefinitions}
        totalInvestment={portfolioTotals?.totalInvestment || 0}
        currentValue={portfolioTotals?.totalValue || 0}
        onBack={handleBackToAssets}
      />
    );
  }

  return (
    <AssetsView
      assets={sortedAssets}
      portfolioData={portfolioData}
      status={status}
      totalAssetValue={totalAssetValue}
      monthlyAssetIncome={monthlyAssetIncome}
      annualAssetIncome={annualAssetIncome}
      isAddingAsset={isAddingAsset}
      editingAsset={editingAsset}
      getAssetTypeLabel={getAssetTypeLabel}
      onAddAsset={handleAddAsset}
      onUpdateAsset={handleUpdateAsset}
      onDeleteAsset={handleDeleteAsset}
      onSetIsAddingAsset={setIsAddingAsset}
      onSetEditingAsset={setEditingAsset}
      onNavigateToDefinitions={handleNavigateToDefinitions}
      onNavigateToCategories={handleNavigateToCategories}
      onNavigateToCalendar={handleNavigateToCalendar}
      onNavigateToAnalytics={handleNavigateToAnalytics}
      onNavigateToPortfolioHistory={handleNavigateToPortfolioHistory}
      onBack={onBack}
    />
  );
};

export default AssetsContainer;
