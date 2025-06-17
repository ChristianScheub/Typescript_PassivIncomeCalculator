import React, { useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { selectPortfolioCache } from '../../store/slices/assetsSlice';
import PortfolioOverviewView from '../../view/portfolio-hub/PortfolioOverviewView';
import calculatorService from '../../service/calculatorService';
import recentActivityService, { PortfolioCategory, PortfolioSubCategory } from '../../service/recentActivityService';
import Logger from '../../service/Logger/logger';

interface PortfolioSummary {
  totalAssetValue: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyCashFlow: number;
  assetsCount: number;
  liabilitiesCount: number;
  incomeSourcesCount: number;
  expenseCategoriesCount: number;
}

interface PortfolioOverviewContainerProps {
  portfolioSummary: PortfolioSummary;
  onCategoryChange: (category: PortfolioCategory, subCategory?: PortfolioSubCategory) => void;
}

const PortfolioOverviewContainer: React.FC<PortfolioOverviewContainerProps> = ({
  portfolioSummary,
  onCategoryChange
}) => {
  // Get detailed portfolio data for analytics
  const portfolioCache = useAppSelector(selectPortfolioCache);
  const income = useAppSelector(state => state.income.items);
  const expenses = useAppSelector(state => state.expenses.items);
  const liabilities = useAppSelector(state => state.liabilities.items);

  // Calculate portfolio analytics for overview charts
  const portfolioAnalytics = useMemo(() => {
    if (!portfolioCache?.positions.length) {
      return {
        assetAllocation: [],
        incomeSourcesBreakdown: [],
        expenseCategoriesBreakdown: [],
        liabilityTypesBreakdown: []
      };
    }

    Logger.info('Calculating portfolio analytics for overview');
    
    // Asset allocation from portfolio positions
    const assetAllocation = calculatorService.calculatePortfolioAnalytics(portfolioCache.positions).assetAllocation;
    
    // Income sources breakdown
    const incomeSourcesBreakdown = income.reduce((acc, incomeItem) => {
      const type = incomeItem.type;
      const monthlyAmount = calculatorService.calculateMonthlyIncome(incomeItem);
      
      const existingItem = acc.find(item => item.name === type);
      if (existingItem) {
        existingItem.value += monthlyAmount;
      } else {
        acc.push({
          name: type,
          value: monthlyAmount,
          percentage: 0 // Will be calculated below
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number; percentage: number }>);

    // Calculate percentages for income
    const totalIncome = incomeSourcesBreakdown.reduce((sum, item) => sum + item.value, 0);
    incomeSourcesBreakdown.forEach(item => {
      item.percentage = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
    });

    // Expense categories breakdown
    const expenseCategoriesBreakdown = expenses.reduce((acc, expense) => {
      const category = expense.category;
      const monthlyAmount = calculatorService.calculateMonthlyExpense(expense);
      
      const existingItem = acc.find(item => item.name === category);
      if (existingItem) {
        existingItem.value += monthlyAmount;
      } else {
        acc.push({
          name: category,
          value: monthlyAmount,
          percentage: 0 // Will be calculated below
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number; percentage: number }>);

    // Calculate percentages for expenses
    const totalExpenses = expenseCategoriesBreakdown.reduce((sum, item) => sum + item.value, 0);
    expenseCategoriesBreakdown.forEach(item => {
      item.percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
    });

    // Liability types breakdown
    const liabilityTypesBreakdown = liabilities.reduce((acc, liability) => {
      const type = liability.type;
      const balance = liability.currentBalance || 0;
      
      const existingItem = acc.find(item => item.name === type);
      if (existingItem) {
        existingItem.value += balance;
      } else {
        acc.push({
          name: type,
          value: balance,
          percentage: 0 // Will be calculated below
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number; percentage: number }>);

    // Calculate percentages for liabilities
    const totalLiabilities = liabilityTypesBreakdown.reduce((sum, item) => sum + item.value, 0);
    liabilityTypesBreakdown.forEach(item => {
      item.percentage = totalLiabilities > 0 ? (item.value / totalLiabilities) * 100 : 0;
    });

    return {
      assetAllocation,
      incomeSourcesBreakdown,
      expenseCategoriesBreakdown,
      liabilityTypesBreakdown
    };
  }, [portfolioCache, income, expenses, liabilities]);

  // Portfolio health indicators
  const healthIndicators = useMemo(() => {
    const { netWorth, totalAssetValue, totalLiabilities, monthlyCashFlow } = portfolioSummary;
    
    return {
      netWorthTrend: netWorth > 0 ? 'positive' as const : 'negative' as const,
      debtToAssetRatio: totalAssetValue > 0 ? (totalLiabilities / totalAssetValue) * 100 : 0,
      cashFlowHealth: monthlyCashFlow > 0 ? 'positive' as const : monthlyCashFlow < 0 ? 'negative' as const : 'neutral' as const,
      diversificationScore: portfolioAnalytics.assetAllocation.length * 20 // Simple diversification score
    };
  }, [portfolioSummary, portfolioAnalytics.assetAllocation.length]);

  Logger.info('Portfolio Overview: Rendering overview with summary'+ portfolioSummary);

  return (
    <PortfolioOverviewView
      portfolioSummary={portfolioSummary}
      portfolioAnalytics={portfolioAnalytics}
      healthIndicators={healthIndicators}
      onCategoryChange={onCategoryChange}
    />
  );
};

export default PortfolioOverviewContainer;
