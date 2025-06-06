import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { updateForecastValues } from '../store/slices/forecastSlice';
import Logger from '../service/Logger/logger';
import ForecastView from '../view/ForecastView';

const ForecastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status: assetsStatus } = useAppSelector(state => state.assets);
  const { status: incomeStatus } = useAppSelector(state => state.income);
  const { status: expensesStatus } = useAppSelector(state => state.expenses);
  const { status: liabilitiesStatus } = useAppSelector(state => state.liabilities);
  const forecast = useAppSelector(state => state.forecast);
  const [selectedTab, setSelectedTab] = useState<'projections' | 'allocations' | 'fire'>('fire');

  // Check if any of the underlying data is loading
  const isDataLoading = [assetsStatus, incomeStatus, expensesStatus, liabilitiesStatus].includes('loading');
  
  // Trigger forecast update when underlying data changes
  useEffect(() => {
    if (!isDataLoading && 
        (assetsStatus === 'succeeded' || incomeStatus === 'succeeded' || 
         expensesStatus === 'succeeded' || liabilitiesStatus === 'succeeded')) {
      Logger.info('Underlying data changed, updating forecast values');
      dispatch(updateForecastValues());
    }
  }, [dispatch, isDataLoading, assetsStatus, incomeStatus, expensesStatus, liabilitiesStatus]);

  // Initial load
  useEffect(() => {
    if (!forecast.lastUpdated && !isDataLoading) {
      Logger.info('Initial forecast load');
      dispatch(updateForecastValues());
    }
  }, [dispatch, forecast.lastUpdated, isDataLoading]);

  const isLoading = isDataLoading || forecast.isLoading;

  Logger.info(`Forecast container render - isLoading: ${isLoading}, forecast cache age: ${forecast.lastUpdated}`);

  return (
    <ForecastView
      selectedTab={selectedTab}
      isLoading={isLoading}
      projections={forecast.projections}
      assetAllocation={forecast.assetAllocation}
      expenseBreakdown={forecast.expenseBreakdown}
      incomeAllocation={forecast.incomeAllocation}
      liabilities={forecast.transformedLiabilities}
      onTabChange={setSelectedTab}
    />
  );
};

export default ForecastContainer;
