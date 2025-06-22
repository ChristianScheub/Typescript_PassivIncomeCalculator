import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import LiabilityAnalyticsView from '@/view/analytics-hub/liabilities/LiabilityAnalyticsView';
import calculatorService from '@/service/domain/financial/calculations/compositeCalculatorService';
import { Liability } from '@/types/domains/financial/entities';
import { 
  LiabilityBreakdownItem, 
  LiabilityItem, 
  InterestRateComparisonItem,
  PaymentScheduleItem,
  DebtProjectionItem,
  LiabilityAnalyticsData
} from '@/types/domains/analytics/reporting';
import Logger from '@/service/shared/logging/Logger/logger';

type LiabilityAnalyticsTab = 'monthly' | 'annual' | 'more';

interface LiabilityAnalyticsContainerProps {
  onBack: () => void;
}

const LiabilityAnalyticsContainer: React.FC<LiabilityAnalyticsContainerProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<LiabilityAnalyticsTab>('monthly');
  
  // Get liability data from Redux store
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  
  // Calculate liability analytics data
  const liabilityAnalytics = useMemo(() => {
    if (!liabilities.length) {
      Logger.info('No liabilities available for analytics');
      return {
        monthlyBreakdown: [],
        annualBreakdown: [],
        monthlyIndividualLiabilities: [],
        annualIndividualLiabilities: [],
        debtBalanceBreakdown: [],
        annualInterestBreakdown: [],
        interestRateComparison: [],
        paymentScheduleData: [],
        debtProjectionData5Years: [],
        debtProjectionData10Years: [],
        debtProjectionData30Years: [],
        totalMonthlyPayments: 0,
        totalAnnualPayments: 0,
        totalDebt: 0,
        totalAnnualInterest: 0
      } as LiabilityAnalyticsData;
    }
    
    Logger.info(`Calculating liability analytics for ${liabilities.length} liabilities`);
    
    // Calculate monthly liability breakdown by type
    const liabilityTypeMap = new Map<string, number>();
    const debtBalanceTypeMap = new Map<string, number>();
    const interestTypeMap = new Map<string, number>();
    let totalMonthlyPayments = 0;
    let totalDebt = 0;
    let totalAnnualInterest = 0;
    
    liabilities.forEach((liability: Liability) => {
      const monthlyPayment = calculatorService.calculateLiabilityMonthlyPayment(liability);
      const currentBalance = liability.currentBalance || 0;
      const interestRate = liability.interestRate || 0;
      const annualInterest = (currentBalance * interestRate) / 100;
      
      // Monthly payments by type
      const currentMonthlyAmount = liabilityTypeMap.get(liability.type) || 0;
      liabilityTypeMap.set(liability.type, currentMonthlyAmount + monthlyPayment);
      
      // Debt balance by type
      const currentDebtAmount = debtBalanceTypeMap.get(liability.type) || 0;
      debtBalanceTypeMap.set(liability.type, currentDebtAmount + currentBalance);
      
      // Interest by type
      const currentInterestAmount = interestTypeMap.get(liability.type) || 0;
      interestTypeMap.set(liability.type, currentInterestAmount + annualInterest);
      
      totalMonthlyPayments += monthlyPayment;
      totalDebt += currentBalance;
      totalAnnualInterest += annualInterest;
    });

    // Monthly breakdown by type
    const monthlyBreakdown: LiabilityBreakdownItem[] = Array.from(liabilityTypeMap.entries())
      .map(([type, amount]) => ({
        category: type,
        amount,
        percentage: totalMonthlyPayments > 0 ? (amount / totalMonthlyPayments) * 100 : 0
      }))
      .sort((a: LiabilityBreakdownItem, b: LiabilityBreakdownItem) => b.amount - a.amount);
    
    // Annual breakdown (same categories, but annual amounts)
    const annualBreakdown: LiabilityBreakdownItem[] = monthlyBreakdown.map(category => ({
      ...category,
      amount: category.amount * 12,
    }));
    
    // Debt balance breakdown by type
    const debtBalanceBreakdown: LiabilityBreakdownItem[] = Array.from(debtBalanceTypeMap.entries())
      .map(([type, amount]) => ({
        category: type,
        amount,
        percentage: totalDebt > 0 ? (amount / totalDebt) * 100 : 0
      }))
      .sort((a: LiabilityBreakdownItem, b: LiabilityBreakdownItem) => b.amount - a.amount);
    
    // Annual interest breakdown by type
    const annualInterestBreakdown: LiabilityBreakdownItem[] = Array.from(interestTypeMap.entries())
      .map(([type, amount]) => ({
        category: type,
        amount,
        percentage: totalAnnualInterest > 0 ? (amount / totalAnnualInterest) * 100 : 0
      }))
      .sort((a: LiabilityBreakdownItem, b: LiabilityBreakdownItem) => b.amount - a.amount);
    
    // Individual liabilities for monthly view
    const monthlyIndividualLiabilities: LiabilityItem[] = liabilities
      .map((liability: Liability) => ({
        name: liability.name,
        amount: calculatorService.calculateLiabilityMonthlyPayment(liability),
        category: liability.type,
        percentage: 0 // Will be calculated below
      }))
      .filter((liability: LiabilityItem) => liability.amount > 0)
      .sort((a: LiabilityItem, b: LiabilityItem) => b.amount - a.amount);
    
    // Individual liabilities for annual view
    const annualIndividualLiabilities: LiabilityItem[] = liabilities
      .map((liability: Liability) => ({
        name: liability.name,
        amount: calculatorService.calculateLiabilityMonthlyPayment(liability) * 12,
        category: liability.type,
        percentage: 0 // Will be calculated below
      }))
      .filter((liability: LiabilityItem) => liability.amount > 0)
      .sort((a: LiabilityItem, b: LiabilityItem) => b.amount - a.amount);
    
    // Interest rate comparison data
    const interestRateComparison: InterestRateComparisonItem[] = liabilities
      .filter((liability: Liability) => liability.interestRate && liability.interestRate > 0)
      .map((liability: Liability) => ({
        name: liability.name,
        rate: liability.interestRate || 0,
        type: liability.type
      }))
      .sort((a: InterestRateComparisonItem, b: InterestRateComparisonItem) => b.rate - a.rate);
    
    // Payment schedule data for annual view (monthly payments throughout the year)
    const paymentScheduleData: PaymentScheduleItem[] = Array.from({length: 12}, (_, month) => {
      const monthName = new Date(2024, month, 1).toLocaleDateString('de-DE', { month: 'short' });
      const totalPayment = liabilities.reduce((sum: number, liability: Liability) => {
        return sum + calculatorService.calculateLiabilityMonthlyPayment(liability);
      }, 0);
      
      return {
        month: monthName,
        amount: totalPayment,
        breakdown: liabilities.map((liability: Liability) => ({
          name: liability.name,
          amount: calculatorService.calculateLiabilityMonthlyPayment(liability)
        })).filter((item: { name: string; amount: number }) => item.amount > 0)
      };
    });
    
    // Helper function to calculate debt projection for any time period
    const calculateDebtProjection = (months: number): DebtProjectionItem[] => {
      const projectionData: DebtProjectionItem[] = [];
      const projectionLiabilities = liabilities.map((liability: Liability) => ({
        ...liability,
        remainingBalance: liability.currentBalance || 0
      }));
      
      // Calculate intervals for better visualization
      let interval: number;
      if (months <= 60) {
        interval = 1; // Monthly for 5yr
      } else if (months <= 120) {
        interval = 3; // Quarterly for 10yr
      } else {
        interval = 12; // Yearly for 30yr
      }
      
      for (let month = 0; month <= months; month += interval) {
        let monthLabel: string;
        if (month === 0) {
          monthLabel = 'Heute';
        } else if (months <= 60) {
          monthLabel = `${Math.floor(month / 12)}J ${month % 12}M`;
        } else if (months <= 120) {
          monthLabel = `${Math.floor(month / 12)} Jahre`;
        } else {
          monthLabel = `${Math.floor(month / 12)} Jahre`;
        }
        
        let totalBalance = 0;
        const liabilityBalances: { [key: string]: number } = {};
        
        projectionLiabilities.forEach((liability: typeof projectionLiabilities[0]) => {
          if (month === 0) {
            liabilityBalances[liability.name] = liability.remainingBalance;
            totalBalance += liability.remainingBalance;
          } else {
            // Calculate payments for the interval period
            for (let i = 0; i < interval && liability.remainingBalance > 0; i++) {
              const monthlyPayment = calculatorService.calculateLiabilityMonthlyPayment(liability);
              const monthlyInterest = (liability.remainingBalance * (liability.interestRate || 0)) / 100 / 12;
              const principalPayment = Math.max(0, monthlyPayment - monthlyInterest);
              
              // Update remaining balance
              liability.remainingBalance = Math.max(0, liability.remainingBalance - principalPayment);
            }
            
            liabilityBalances[liability.name] = liability.remainingBalance;
            totalBalance += liability.remainingBalance;
          }
        });
        
        projectionData.push({
          month: monthLabel,
          total: totalBalance,
          ...liabilityBalances
        });
      }
      
      return projectionData;
    };

    // Calculate debt projections for different time periods
    const debtProjectionData5Years = calculateDebtProjection(60);
    const debtProjectionData10Years = calculateDebtProjection(120);  
    const debtProjectionData30Years = calculateDebtProjection(360);
    
    // Calculate totals
    const totalAnnualPayments = totalMonthlyPayments * 12;
    
    // Calculate percentages for individual liabilities
    if (totalMonthlyPayments > 0) {
      monthlyIndividualLiabilities.forEach((liability: LiabilityItem) => {
        liability.percentage = (liability.amount / totalMonthlyPayments) * 100;
      });
    }
    
    if (totalAnnualPayments > 0) {
      annualIndividualLiabilities.forEach((liability: LiabilityItem) => {
        liability.percentage = (liability.amount / totalAnnualPayments) * 100;
      });
    }
    
    Logger.info(`Liability analytics calculated - Monthly total: ${totalMonthlyPayments}, Annual total: ${totalAnnualPayments}, Total debt: ${totalDebt}`);
    
    return {
      monthlyBreakdown,
      annualBreakdown,
      monthlyIndividualLiabilities,
      annualIndividualLiabilities,
      debtBalanceBreakdown,
      annualInterestBreakdown,
      interestRateComparison,
      paymentScheduleData,
      debtProjectionData5Years,
      debtProjectionData10Years,
      debtProjectionData30Years,
      totalMonthlyPayments,
      totalAnnualPayments,
      totalDebt,
      totalAnnualInterest
    } as LiabilityAnalyticsData;
  }, [liabilities]);

  const handleTabChange = (tab: LiabilityAnalyticsTab) => {
    Logger.info(`Switching to liability analytics tab: ${tab}`);
    setSelectedTab(tab);
  };

  return (
    <LiabilityAnalyticsView
      selectedTab={selectedTab}
      liabilityAnalytics={liabilityAnalytics}
      onTabChange={handleTabChange}
      onBack={onBack}
    />
  );
};

export default LiabilityAnalyticsContainer;
