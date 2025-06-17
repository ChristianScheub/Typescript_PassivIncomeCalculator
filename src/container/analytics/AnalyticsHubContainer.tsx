import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import Logger from '../../service/Logger/logger';
import analyticsHistoryService from '../../service/analyticsHistoryService';
import DistributionsAnalyticsContainer from './DistributionsAnalyticsContainer';
import MilestonesContainer from '../forecast/MilestonesContainer';
import ForecastContainer from '../forecast/ForecastContainer';
import PerformanceAnalyticsContainer from './PerformanceAnalyticsContainer';
import CustomAnalyticsContainer from './CustomAnalyticsContainer';
import OverviewAnalyticsContainer from './OverviewAnalyticsContainer';
import AnalyticsHubView from '../../view/analytics/AnalyticsHubView';

export type AnalyticsCategory = 
  | 'overview' 
  | 'forecasting' 
  | 'milestones' 
  | 'distributions' 
  | 'performance' 
  | 'custom';

export type AnalyticsSubCategory = 
  // Overview
  | 'dashboard' 
  | 'summary'
  // Forecasting  
  | 'cashflow' 
  | 'portfolio' 
  | 'scenarios'
  // Milestones
  | 'fire' 
  | 'debt' 
  | 'savings' 
  | 'customMilestones'
  // Distributions
  | 'assets' 
  | 'income' 
  | 'expenses' 
  | 'geographic'
  // Performance
  | 'portfolioPerformance' 
  | 'returns' 
  | 'historical'
  // Custom
  | 'builder' 
  | 'saved' 
  | 'templates';

interface AnalyticsHubContainerProps {
  onBack?: () => void;
}

const AnalyticsHubContainer: React.FC<AnalyticsHubContainerProps> = ({ onBack }) => {
  
  // Default subcategories for each main category
  const defaultSubCategories: Record<AnalyticsCategory, AnalyticsSubCategory> = {
    overview: 'dashboard',
    forecasting: 'cashflow',
    milestones: 'fire',
    distributions: 'assets',
    performance: 'portfolioPerformance',
    custom: 'builder'
  };
  
  // Analytics navigation state
  const [selectedCategory, setSelectedCategory] = useState<AnalyticsCategory>('overview');
  const [selectedSubCategory, setSelectedSubCategory] = useState<AnalyticsSubCategory>('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<Array<{ category: AnalyticsCategory; subCategory: AnalyticsSubCategory }>>([]);
  
  // Get data for analytics insights
  const { items: assets } = useAppSelector(state => state.assets);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: income } = useAppSelector(state => state.income);
  const { portfolioCache } = useAppSelector(state => state.assets);

  // Calculate quick insights for overview
  const quickInsights = useMemo(() => {
    const totalAssetValue = portfolioCache?.totals?.totalValue || 0;
    const monthlyIncome = portfolioCache?.totals?.monthlyIncome || 0;
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.currentBalance || 0), 0);
    
    return {
      totalAssetValue,
      monthlyIncome,
      totalExpenses,
      totalLiabilities,
      netWorth: totalAssetValue - totalLiabilities,
      monthlyCashFlow: monthlyIncome - totalExpenses,
      assetsCount: assets.length,
      incomeSourcesCount: income.length,
      expenseCategoriesCount: new Set(expenses.map(e => e.category)).size,
      liabilitiesCount: liabilities.length
    };
  }, [portfolioCache, assets, income, expenses, liabilities]);

  // Navigation handlers
  const handleCategoryChange = (category: AnalyticsCategory, subCategory?: AnalyticsSubCategory) => {
    Logger.info(`Analytics Hub: Navigating to category ${category}${subCategory ? `, subcategory ${subCategory}` : ''}`);
    
    // Add current position to history
    setNavigationHistory(prev => [...prev, { category: selectedCategory, subCategory: selectedSubCategory }]);
    
    setSelectedCategory(category);
    if (subCategory) {
      setSelectedSubCategory(subCategory);
    } else {
      // Use default subcategory for main category
      setSelectedSubCategory(defaultSubCategories[category]);
    }

    // Track analytics history if not going to hub dashboard
    if (!(category === 'overview' && (!subCategory || subCategory === 'dashboard'))) {
      const finalSubCategory = subCategory || defaultSubCategories[category];
      const currentLanguage = localStorage.getItem('i18nextLng') || 'en';
      const title = analyticsHistoryService.getAnalyticsTitle(category, finalSubCategory, currentLanguage);
      const icon = analyticsHistoryService.getAnalyticsIcon(category, finalSubCategory);
      analyticsHistoryService.addToHistory(category, finalSubCategory, title, icon);
    }
  };

  const handleBackToHub = () => {
    Logger.info('Analytics Hub: Returning to hub overview');
    if (navigationHistory.length > 0) {
      const lastPosition = navigationHistory[navigationHistory.length - 1];
      setSelectedCategory(lastPosition.category);
      setSelectedSubCategory(lastPosition.subCategory);
      setNavigationHistory(prev => prev.slice(0, -1));
    } else {
      setSelectedCategory('overview');
      setSelectedSubCategory('dashboard');
    }
  };

  // Check if we should render a specific analytics container
  const shouldRenderContainer = () => {
    // Only show hub view for overview/dashboard, all other combinations should render specific containers
    return !(selectedCategory === 'overview' && selectedSubCategory === 'dashboard');
  };

  // Render specific analytics containers
  const renderAnalyticsContainer = () => {
    Logger.info(`Analytics Hub: Rendering container for ${selectedCategory} - ${selectedSubCategory}`);
    
    switch (selectedCategory) {
      case 'overview':
        switch (selectedSubCategory) {
          case 'dashboard':
            return null; // Will show hub view
          case 'summary':
            return <OverviewAnalyticsContainer onBack={handleBackToHub} />;
          default:
            return null;
        }
        
      case 'forecasting':
        // All forecasting subcategories go to ForecastContainer
        return <ForecastContainer onBack={handleBackToHub} />;
        
      case 'milestones':
        // All milestone subcategories go to MilestonesContainer  
        return <MilestonesContainer onBack={handleBackToHub} />;
        
      case 'distributions':
        // Use the new DistributionsAnalyticsContainer which shows overview and handles subcategories
        return <DistributionsAnalyticsContainer onBack={handleBackToHub} />;
      
      case 'performance':
        switch (selectedSubCategory) {
          case 'portfolioPerformance':
          case 'returns':
          case 'historical':
            return <PerformanceAnalyticsContainer onBack={handleBackToHub} />;
          default:
            return <PerformanceAnalyticsContainer onBack={handleBackToHub} />;
        }
        
      case 'custom':
        switch (selectedSubCategory) {
          case 'builder':
          case 'saved':
          case 'templates':
            return <CustomAnalyticsContainer onBack={handleBackToHub} />;
          default:
            return <CustomAnalyticsContainer onBack={handleBackToHub} />;
        }
        
      default:
        // Return to overview
        setSelectedCategory('overview');
        setSelectedSubCategory('dashboard');
        return null;
    }
  };

  // Log analytics hub access
  useEffect(() => {
    Logger.info('Analytics Hub accessed - initializing analytics overview');
  }, []);

  // If we should render a specific container, do so
  if (shouldRenderContainer()) {
    return renderAnalyticsContainer();
  }

  // Otherwise render the main analytics hub view
  return (
    <AnalyticsHubView
      selectedCategory={selectedCategory}
      selectedSubCategory={selectedSubCategory}
      quickInsights={quickInsights}
      onCategoryChange={handleCategoryChange}
      onBack={onBack}
    />
  );
};

export default AnalyticsHubContainer;
