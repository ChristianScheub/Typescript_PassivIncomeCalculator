import React, { useState, useMemo } from 'react';
import calculatorService from '../service/calculatorService';
import { useAppSelector } from '../hooks/redux';
import Logger from '../service/Logger/logger';
import ForecastView from '../view/ForecastView';

const ForecastContainer: React.FC = () => {

  const { items: assets, status: assetsStatus } = useAppSelector(state => state.assets);
  const { items: income, status: incomeStatus } = useAppSelector(state => state.income);
  const { items: expenses, status: expensesStatus } = useAppSelector(state => state.expenses);
  const { items: liabilities, status: liabilitiesStatus } = useAppSelector(state => state.liabilities);
  const [selectedTab, setSelectedTab] = useState<'projections' | 'allocations'>('projections');

  const isLoading = useMemo(() => {
    const isAnyLoading = ['loading'].includes(assetsStatus) || 
                        ['loading'].includes(incomeStatus) || 
                        ['loading'].includes(expensesStatus) || 
                        ['loading'].includes(liabilitiesStatus);
    
    Logger.info(`Forecast data loading status - Assets: ${assetsStatus}, Income: ${incomeStatus}, Expenses: ${expensesStatus}, Liabilities: ${liabilitiesStatus}`);
    return isAnyLoading;
  }, [assetsStatus, incomeStatus, expensesStatus, liabilitiesStatus]);

  const projections = useMemo(() => calculatorService.calculateProjections(income, expenses, liabilities, assets), [income, expenses, liabilities, assets]);
  const assetAllocation = useMemo(() => calculatorService.calculateAssetAllocation(assets), [assets]);
  const expenseBreakdown = useMemo(() => calculatorService.calculateExpenseBreakdown(expenses), [expenses]);
  const incomeAllocation = useMemo(() => calculatorService.calculateIncomeAllocation(income, assets), [income, assets]);

  return (
    <ForecastView
      selectedTab={selectedTab}
      isLoading={isLoading}
      projections={projections}
      assetAllocation={assetAllocation}
      expenseBreakdown={expenseBreakdown}
      incomeAllocation={incomeAllocation}
      onTabChange={setSelectedTab}
    />
  );
};

export default ForecastContainer;
