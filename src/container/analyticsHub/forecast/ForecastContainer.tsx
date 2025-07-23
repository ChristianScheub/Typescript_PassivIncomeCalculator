import React, { useEffect } from 'react';
import Logger from '@/service/shared/logging/Logger/logger';
import ForecastView from '@/view/analytics-hub/ForecastView';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import type { ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { updateForecastValues } from '@/store/slices/cache/forecastSlice';
import { useAsyncOperation } from '@/utils/containerUtils';

interface ForecastContainerProps {
  onBack?: () => void;
}

const ForecastContainer: React.FC<ForecastContainerProps> = ({ onBack }) => {
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
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


  // Logge den aktuellen inputHash bei jeder Änderung und jedem Render
  useEffect(() => {
    // Referenz- und Wertvergleich für inputHash
    if (typeof window !== 'undefined') {
      if (window.prevInputHash !== undefined) {
        Logger.info(`[ForecastContainer] inputHash: ${portfolioInputHash} | typeof: ${typeof portfolioInputHash} | referenzgleich zu vorherigem: ${Object.is(window.prevInputHash, portfolioInputHash)}`);
      } else {
        Logger.info(`[ForecastContainer] inputHash: ${portfolioInputHash} | typeof: ${typeof portfolioInputHash} | (erstes Render)`);
      }
      window.prevInputHash = portfolioInputHash;
    } else {
      Logger.info(`[ForecastContainer] inputHash: ${portfolioInputHash} | typeof: ${typeof portfolioInputHash}`);
    }
  }, [portfolioInputHash]);

  // Forecast nur neu berechnen, wenn sich der Portfolio-Input-Hash ändert
  useEffect(() => {
    if (!isDataLoading && portfolioInputHash) {
      Logger.info('[ForecastContainer] Portfolio inputHash changed, updating forecast values');
      executeAsyncOperation(
        'update forecast values',
        async () => {
          const action = updateForecastValues();
          dispatch(action);
        },
        () => {}
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioInputHash]);


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
