import React, { useState, useMemo, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { selectPortfolioCache } from '../../store/slices/assetsSlice';
import AssetsContainer from '../assets/AssetsContainer';
import LiabilitiesContainer from '../finance/LiabilitiesContainer';
import IncomeContainer from '../finance/IncomeContainer';
import ExpensesContainer from '../finance/ExpensesContainer';
import TransactionCenterContainer from '../transactions/TransactionCenterContainer';
import recentActivityService from '../../service/recentActivityService';
import calculatorService from '../../service/calculatorService';
import Logger from '../../service/Logger/logger';
import PortfolioOverviewContainer from './PortfolioOverviewContainer';

// Portfolio Hub Category Types
type PortfolioCategory = 
  | 'overview'        // Portfolio-Übersicht (Landing Page)
  | 'assets'          // Asset-Management  
  | 'liabilities'     // Schulden-Management
  | 'income'          // Einkommens-Management
  | 'expenses'        // Ausgaben-Management
  | 'transactions';   // Transaction-Center (Future)

type PortfolioSubCategory = 
  // Overview
  | 'dashboard' | 'summary' | 'allocations'
  // Assets  
  | 'portfolio' | 'definitions' | 'categories' | 'calendar' | 'history' | 'addTransaction'
  // Liabilities
  | 'debts' | 'payments' | 'projections' | 'addDebt'
  // Income
  | 'sources' | 'streams' | 'projections' | 'addIncome'
  // Expenses
  | 'categories' | 'budgets' | 'tracking' | 'addExpense'
  // Transactions
  | 'recent' | 'import' | 'export';

interface NavigationHistoryItem {
  category: PortfolioCategory;
  subCategory?: PortfolioSubCategory;
}

interface PortfolioHubContainerProps {
  // Currently no props needed - could add future props here
}

const PortfolioHubContainer: React.FC<PortfolioHubContainerProps> = () => {
  // Portfolio Hub Navigation State
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('overview');
  const [selectedSubCategory, setSelectedSubCategory] = useState<PortfolioSubCategory>('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);

  // Get portfolio data for context sharing
  const portfolioCache = useAppSelector(selectPortfolioCache);
  const assets = useAppSelector(state => state.assets.items);
  const liabilities = useAppSelector(state => state.liabilities.items);
  const income = useAppSelector(state => state.income.items);
  const expenses = useAppSelector(state => state.expenses.items);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  // Portfolio summary for hub context
  const portfolioSummary = useMemo(() => {
    const totalAssetValue = portfolioCache?.totals?.totalValue || 0;
    const monthlyIncome = portfolioCache?.totals?.monthlyIncome || 0;
    
    // Standard calculations for non-cached data
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.currentBalance || 0), 0);
    const netWorth = totalAssetValue - totalLiabilities;
    const monthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);
    const monthlyLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
    const monthlyCashFlow = monthlyIncome - monthlyExpenses - monthlyLiabilityPayments;

    return {
      totalAssetValue,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      monthlyLiabilityPayments,
      monthlyCashFlow,
      assetsCount: assets.length,
      liabilitiesCount: liabilities.length,
      incomeSourcesCount: income.length,
      expenseCategoriesCount: new Set(expenses.map(e => e.category)).size
    };
  }, [portfolioCache, assets.length, liabilities, income.length, expenses]);

  // Navigation handlers
  const handleCategoryChange = (category: PortfolioCategory, subCategory?: PortfolioSubCategory) => {
    Logger.info(`Portfolio Hub: Navigating to category ${category}${subCategory ? `, subcategory ${subCategory}` : ''}`);
    
    // Track portfolio activity in recent activity service
    recentActivityService.addPortfolioActivity(category, subCategory);
    
    // Add current position to history for breadcrumbs
    if (selectedCategory !== 'overview') {
      setNavigationHistory(prev => [...prev, { category: selectedCategory, subCategory: selectedSubCategory }]);
    }
    
    setSelectedCategory(category);
    if (subCategory) {
      setSelectedSubCategory(subCategory);
    }
  };

  const handleBackToHub = () => {
    Logger.info('Portfolio Hub: Returning to overview');
    
    if (navigationHistory.length > 0) {
      // Go back to previous position
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setSelectedCategory(previous.category);
      if (previous.subCategory) {
        setSelectedSubCategory(previous.subCategory);
      }
    } else {
      // Go back to overview
      setSelectedCategory('overview');
      setSelectedSubCategory('dashboard');
    }
    
    // Scroll to top when navigating back
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render content based on selected category
  const renderContent = () => {
    switch (selectedCategory) {
      case 'overview':
        return (
          <PortfolioOverviewContainer
            portfolioSummary={portfolioSummary}
            onCategoryChange={handleCategoryChange}
          />
        );
        
      case 'assets':
        return <AssetsContainer onBack={handleBackToHub} initialAction={selectedSubCategory} />;
        
      case 'liabilities':
        return <LiabilitiesContainer onBack={handleBackToHub} initialAction={selectedSubCategory} />;
        
      case 'income':
        return <IncomeContainer onBack={handleBackToHub} initialAction={selectedSubCategory} />;
        
      case 'expenses':
        return <ExpensesContainer onBack={handleBackToHub} initialAction={selectedSubCategory} />;
        
      case 'transactions':
        return <TransactionCenterContainer onBack={handleBackToHub} />;
        
      default:
        return (
          <PortfolioOverviewContainer
            portfolioSummary={portfolioSummary}
            onCategoryChange={handleCategoryChange}
          />
        );
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
};

export default PortfolioHubContainer;
