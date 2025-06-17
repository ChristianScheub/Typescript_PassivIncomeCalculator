import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import Logger from '../../service/Logger/logger';
import OverviewAnalyticsView from '../../view/analytics/overview/OverviewAnalyticsView';

interface OverviewAnalyticsContainerProps {
  onBack?: () => void;
}

const OverviewAnalyticsContainer: React.FC<OverviewAnalyticsContainerProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<'summary' | 'insights' | 'trends'>('summary');
  
  const { items: assets, portfolioCache } = useAppSelector(state => state.assets);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: income } = useAppSelector(state => state.income);

  // Calculate comprehensive overview metrics
  const overviewData = useMemo(() => {
    const totalAssetValue = portfolioCache?.totals?.totalValue || 0;
    const monthlyIncome = portfolioCache?.totals?.monthlyIncome || 0;
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.paymentSchedule.amount || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.currentBalance || 0), 0);
    const netWorth = totalAssetValue - totalLiabilities;
    const monthlyCashFlow = monthlyIncome - totalExpenses;

    // Asset breakdown by type (using AssetDefinition types)
    const assetsByType = assets.reduce((acc, transaction) => {
      const assetDef = transaction.assetDefinition;
      const type = assetDef?.type || transaction.type || 'Other';
      const currentPrice = assetDef?.currentPrice || transaction.purchasePrice || 0;
      const quantity = transaction.purchaseQuantity || 0;
      const value = quantity * currentPrice;
      acc[type] = (acc[type] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    // Income breakdown by type
    const incomeByType = income.reduce((acc, inc) => {
      const type = inc.type || 'Other';
      acc[type] = (acc[type] || 0) + (inc.paymentSchedule.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    // Expense breakdown by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + (expense.paymentSchedule.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    // Financial health indicators
    const debtToAssetRatio = totalAssetValue > 0 ? (totalLiabilities / totalAssetValue) * 100 : 0;
    const savingsRate = monthlyIncome > 0 ? (monthlyCashFlow / monthlyIncome) * 100 : 0;
    const expenseRatio = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;

    return {
      totalAssetValue,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      totalExpenses,
      monthlyCashFlow,
      assetsByType,
      incomeByType,
      expensesByCategory,
      assetsCount: assets.length,
      incomeSourcesCount: income.length,
      expenseCategoriesCount: Object.keys(expensesByCategory).length,
      liabilitiesCount: liabilities.length,
      healthIndicators: {
        debtToAssetRatio,
        savingsRate,
        expenseRatio
      }
    };
  }, [portfolioCache, assets, income, expenses, liabilities]);

  // Monthly trends (simplified - could be enhanced with actual historical data)
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      month,
      income: overviewData.monthlyIncome * (0.9 + Math.random() * 0.2), // Simulated variance
      expenses: overviewData.totalExpenses * (0.9 + Math.random() * 0.2),
      cashFlow: 0 // Will be calculated from income - expenses
    })).map(item => ({
      ...item,
      cashFlow: item.income - item.expenses
    }));
  }, [overviewData]);

  const handleTabChange = (tab: 'summary' | 'insights' | 'trends') => {
    Logger.info(`Overview Analytics: Switching to ${tab} tab`);
    setSelectedTab(tab);
  };

  return (
    <OverviewAnalyticsView
      selectedTab={selectedTab}
      overviewData={overviewData}
      monthlyTrends={monthlyTrends}
      onTabChange={handleTabChange}
      onBack={onBack}
    />
  );
};

export default OverviewAnalyticsContainer;
