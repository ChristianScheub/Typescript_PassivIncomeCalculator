import React, { useEffect } from 'react';
import Logger from '@/service/shared/logging/Logger/logger';
import ForecastView from '@/view/analytics-hub/ForecastView';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateForecastValues } from '@/store/slices/cache/forecastSlice';
import { useAsyncOperation } from '@/utils/containerUtils';

interface ForecastContainerProps {
  onBack?: () => void;
}

const ForecastContainer: React.FC<ForecastContainerProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();
  // Status-Strings werden nicht mehr als Trigger verwendet
  const forecast = useAppSelector(state => state.forecast);
  const isDataLoading = [
    useAppSelector(state => state.transactions.status),
    useAppSelector(state => state.income.status),
    useAppSelector(state => state.expenses.status),
    useAppSelector(state => state.liabilities.status)
  ].includes('loading');
  // Portfolio-Input-Hash als Trigger für Forecast-Update
  const portfolioInputHash = useAppSelector(state => state.transactions.cache?.inputHash);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Forecast nur neu berechnen, wenn sich der Portfolio-Input-Hash ändert
  useEffect(() => {
    if (!isDataLoading && portfolioInputHash) {
      Logger.info('[ForecastContainer] Portfolio inputHash changed, updating forecast values');
      executeAsyncOperation(
        'update forecast values',
        async () => {
          const action = updateForecastValues();
          await dispatch(action);
        },
        () => {}
      );
    }
  }, [dispatch, executeAsyncOperation, isDataLoading, portfolioInputHash]);

  // Initial load (nur wenn noch nie geladen und nicht loading)
  useEffect(() => {
    if (!forecast.lastUpdated && !isDataLoading && portfolioInputHash) {
      Logger.info('[ForecastContainer] Initial forecast load');
      executeAsyncOperation(
        'initial forecast load',
        async () => {
          const action = updateForecastValues();
          await dispatch(action);
        },
        () => {}
      );
    }
  }, [dispatch, executeAsyncOperation, forecast.lastUpdated, isDataLoading, portfolioInputHash]);

  const isLoading = isDataLoading || forecast.isLoading;

  Logger.info(`Forecast container render - isLoading: ${isLoading}, forecast cache age: ${forecast.lastUpdated}`);

  return (
    <ForecastView
      isLoading={isLoading}
      projections={forecast.projections}
      onBack={onBack}
    />
  );
};

export default ForecastContainer;
