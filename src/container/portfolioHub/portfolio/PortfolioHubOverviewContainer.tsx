import React, { useMemo } from 'react';
import { useAppSelector } from '@/hooks/redux';
import PortfolioOverviewView from '@/view/portfolio-hub/PortfolioHubOverviewView';
import calculatorService from '@/service/domain/financial/calculations/compositeCalculatorService';
import { getAssetAllocationFromCache } from '@/utils/portfolioCacheHelpers';
import Logger from '@/service/shared/logging/Logger/logger';
import { Income, Expense, Liability } from '@/types/domains/financial/entities';
import { CategoryBreakdown } from '@/types/domains/portfolio/allocations';
import { PortfolioCategory, PortfolioSubCategory } from '@/types/domains/analytics/reporting';

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
  const portfolioCache = useAppSelector(state => state.transactions.cache);
  const income = useAppSelector(state => state.income.items);
  const expenses = useAppSelector(state => state.expenses.items);
  const liabilities = useAppSelector(state => state.liabilities.items);

  // Calculate portfolio analytics for overview charts - OPTIMIZED
  const portfolioAnalytics = useMemo(() => {
    if (!portfolioCache || !Array.isArray(portfolioCache.positions) || portfolioCache.positions.length === 0) {
      Logger.cache('Portfolio Overview: No portfolio cache available, returning empty analytics [CACHE MISS]');
      return {
        assetAllocation: [],
        incomeSourcesBreakdown: [],
        expenseCategoriesBreakdown: [],
        liabilityTypesBreakdown: []
      };
    }

    Logger.cache('Portfolio Overview: Computing analytics from portfolio cache [CACHE HIT]');
    
    // OPTIMIZATION: Use pre-computed portfolio cache data instead of recalculating
    const assetAllocation = getAssetAllocationFromCache(portfolioCache.positions);
    
    // Income sources breakdown - avoiding asset-level recalculations
    const incomeSourcesBreakdown = income.reduce((acc: CategoryBreakdown[], incomeItem: Income) => {
      const type = incomeItem.type;
      const monthlyAmount = calculatorService.calculateMonthlyIncome(incomeItem);
      
      const existingItem = acc.find((item: CategoryBreakdown) => item.name === type);
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
    }, []);

    // Calculate percentages for income
    const totalIncome = incomeSourcesBreakdown.reduce((sum: number, item: CategoryBreakdown) => sum + item.value, 0);
    incomeSourcesBreakdown.forEach((item: CategoryBreakdown) => {
      item.percentage = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
    });

    // Expense categories breakdown
    const expenseCategoriesBreakdown = expenses.reduce((acc: CategoryBreakdown[], expense: Expense) => {
      const category = expense.category;
      const monthlyAmount = calculatorService.calculateMonthlyExpense(expense);
      
      const existingItem = acc.find((item: CategoryBreakdown) => item.name === category);
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
    }, []);

    // Calculate percentages for expenses
    const totalExpenses = expenseCategoriesBreakdown.reduce((sum: number, item: CategoryBreakdown) => sum + item.value, 0);
    expenseCategoriesBreakdown.forEach((item: CategoryBreakdown) => {
      item.percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
    });

    // Liability types breakdown
    const liabilityTypesBreakdown = liabilities.reduce((acc: CategoryBreakdown[], liability: Liability) => {
      const type = liability.type;
      const balance = liability.currentBalance || 0;
      
      const existingItem = acc.find((item: CategoryBreakdown) => item.name === type);
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
    }, []);

    // Calculate percentages for liabilities
    const totalLiabilities = liabilityTypesBreakdown.reduce((sum: number, item: CategoryBreakdown) => sum + item.value, 0);
    liabilityTypesBreakdown.forEach((item: CategoryBreakdown) => {
      item.percentage = totalLiabilities > 0 ? (item.value / totalLiabilities) * 100 : 0;
    });

    Logger.cache(`Portfolio Overview: Analytics computed from cache - ${assetAllocation.length} asset types, ${incomeSourcesBreakdown.length} income sources [CACHE HIT]`);

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
    
    // Determine cash flow health based on monthly cash flow
    let cashFlowHealth: 'positive' | 'negative' | 'neutral';
    if (monthlyCashFlow > 0) {
      cashFlowHealth = 'positive';
    } else if (monthlyCashFlow < 0) {
      cashFlowHealth = 'negative';
    } else {
      cashFlowHealth = 'neutral';
    }
    
    return {
      netWorthTrend: netWorth > 0 ? 'positive' as const : 'negative' as const,
      debtToAssetRatio: totalAssetValue > 0 ? (totalLiabilities / totalAssetValue) * 100 : 0,
      cashFlowHealth,
      diversificationScore: portfolioAnalytics.assetAllocation.length * 20 // Simple diversification score
    };
  }, [portfolioSummary, portfolioAnalytics.assetAllocation.length]);

  Logger.info('Portfolio Overview: Rendering overview with summary'+ portfolioSummary);

  return (
    <PortfolioOverviewView
      portfolioSummary={portfolioSummary}
      healthIndicators={healthIndicators}
      onCategoryChange={onCategoryChange}
    />
  );
};

export default PortfolioOverviewContainer;
