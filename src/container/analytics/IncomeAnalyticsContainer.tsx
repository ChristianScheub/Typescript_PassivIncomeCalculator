import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import IncomeAnalyticsView from '@/view/analytics-hub/income/IncomeAnalyticsView';
import calculatorService from '@/service/domain/financial/calculations/compositeCalculatorService';
import { Income } from '@/types/domains/financial/entities';
import Logger from '@/service/shared/logging/Logger/logger';

type IncomeAnalyticsTab = 'monthly' | 'annual';

interface IncomeAnalyticsData {
  name: string;
  amount: number;
  category: string;
  percentage: number;
}

interface IncomeBreakdownData {
  category: string;
  amount: number;
  percentage: number;
}

interface IncomeAnalyticsContainerProps {
  onBack: () => void;
}

const IncomeAnalyticsContainer: React.FC<IncomeAnalyticsContainerProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<IncomeAnalyticsTab>('monthly');
  
  // Get income data from Redux store
  const { items: incomes } = useAppSelector(state => state.income);
  
  // Calculate income analytics data
  const incomeAnalytics = useMemo(() => {
    if (!incomes.length) {
      Logger.info('No incomes available for analytics');
      return {
        monthlyBreakdown: [],
        annualBreakdown: [],
        monthlyIndividualIncomes: [],
        annualIndividualIncomes: [],
        totalMonthlyIncome: 0,
        totalAnnualIncome: 0
      };
    }
    
    Logger.info(`Calculating income analytics for ${incomes.length} incomes`);
    
    // Calculate monthly income breakdown by type
    const incomeTypeMap = new Map<string, number>();
    let totalMonthlyIncome = 0;
    
    incomes.forEach((income: Income) => {
      if (!income.paymentSchedule) return;
      const monthlyAmount = calculatorService.calculateMonthlyIncome(income);
      const currentAmount = incomeTypeMap.get(income.type) || 0;
      incomeTypeMap.set(income.type, currentAmount + monthlyAmount);
      totalMonthlyIncome += monthlyAmount;
    });

    const monthlyBreakdown = Array.from(incomeTypeMap.entries())
      .map(([type, amount]) => ({
        category: type,
        amount,
        percentage: totalMonthlyIncome > 0 ? (amount / totalMonthlyIncome) * 100 : 0
      }))
      .sort((a: IncomeBreakdownData, b: IncomeBreakdownData) => b.amount - a.amount);
    
    // Calculate annual breakdown (same categories, but annual amounts)
    const annualBreakdown = monthlyBreakdown.map(category => ({
      ...category,
      amount: category.amount * 12,
      // Percentage stays the same as it's relative to total
    }));
    
    // Calculate individual incomes for monthly view
    const monthlyIndividualIncomes = incomes
      .map((income: Income) => ({
        name: income.name,
        amount: calculatorService.calculateMonthlyIncome(income),
        category: income.type,
        percentage: 0 // Will be calculated below
      }))
      .filter((income: IncomeAnalyticsData) => income.amount > 0)
      .sort((a: IncomeAnalyticsData, b: IncomeAnalyticsData) => b.amount - a.amount);
    
    // Calculate individual incomes for annual view
    const annualIndividualIncomes = incomes
      .map((income: Income) => ({
        name: income.name,
        amount: calculatorService.calculateMonthlyIncome(income) * 12,
        category: income.type,
        percentage: 0 // Will be calculated below
      }))
      .filter((income: IncomeAnalyticsData) => income.amount > 0)
      .sort((a: IncomeAnalyticsData, b: IncomeAnalyticsData) => b.amount - a.amount);
    
    // Calculate totals
    const totalAnnualIncome = totalMonthlyIncome * 12;
    
    // Calculate percentages for individual incomes
    if (totalMonthlyIncome > 0) {
      monthlyIndividualIncomes.forEach((income: IncomeAnalyticsData) => {
        income.percentage = (income.amount / totalMonthlyIncome) * 100;
      });
    }
    
    if (totalAnnualIncome > 0) {
      annualIndividualIncomes.forEach((income: IncomeAnalyticsData) => {
        income.percentage = (income.amount / totalAnnualIncome) * 100;
      });
    }
    
    Logger.info(`Income analytics calculated - Monthly total: ${totalMonthlyIncome}, Annual total: ${totalAnnualIncome}`);
    
    return {
      monthlyBreakdown,
      annualBreakdown,
      monthlyIndividualIncomes,
      annualIndividualIncomes,
      totalMonthlyIncome,
      totalAnnualIncome
    };
  }, [incomes]);

  const handleTabChange = (tab: IncomeAnalyticsTab) => {
    Logger.info(`Switching to income analytics tab: ${tab}`);
    setSelectedTab(tab);
  };

  return (
    <IncomeAnalyticsView
      selectedTab={selectedTab}
      incomeAnalytics={incomeAnalytics}
      onTabChange={handleTabChange}
      onBack={onBack}
    />
  );
};

export default IncomeAnalyticsContainer;
