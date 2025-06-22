import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Asset, AssetDefinition } from '@/types/domains/assets';
import { usePortfolioHistoryView } from '../../hooks/usePortfolioHistoryView';
import { PortfolioHistoryView } from '@/view/portfolio-hub/PortfolioHistoryView';
import { ViewHeader } from '@/ui/layout/ViewHeader';
import { useDeviceCheck } from '@/service/shared/utilities/helper/useDeviceCheck';
import Logger from '@/service/shared/logging/Logger/logger';

interface PortfolioHistoryContainerProps {
  assets: Asset[];
  assetDefinitions: AssetDefinition[];
  totalInvestment: number;
  currentValue: number;
  onBack: () => void;
}

export const PortfolioHistoryContainer: React.FC<PortfolioHistoryContainerProps> = ({
  totalInvestment,
  currentValue,
  onBack
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();
  
  // Use the new portfolio history system
  const portfolioHistoryData = usePortfolioHistoryView('1M'); // Default to 1 month
  
  // Transform data for the view component (PortfolioHistoryView expects specific structure)
  const transformedHistoryData = useMemo(() => {
    Logger.info(`🔍 DEBUG PortfolioHistoryContainer: portfolioHistoryData length=${portfolioHistoryData.length}`);
    if (portfolioHistoryData.length > 0) {
      Logger.info(`🔍 DEBUG first 3 items: ${JSON.stringify(portfolioHistoryData.slice(0, 3).map(point => ({ 
        date: point.date, 
        value: point.value, 
        valueType: typeof point.value,
        hasTransactions: !!point.transactions 
      })))}`);
    }

    const transformed = portfolioHistoryData.map(point => ({
      date: point.date,
      value: point.value,
      transactions: point.transactions || [] // This field is required by PortfolioHistoryView
    }));

    Logger.info(`🔍 DEBUG PortfolioHistoryContainer transformed: length=${transformed.length}`);
    if (transformed.length > 0) {
      Logger.info(`🔍 DEBUG first 3 transformed: ${JSON.stringify(transformed.slice(0, 3))}`);
    }

    return transformed;
  }, [portfolioHistoryData]);

  return (
    <div className="container mx-auto px-4 py-4">
      <ViewHeader
        title={t('portfolio.historyTitle')}
        isMobile={!isDesktop}
        onBack={onBack}
      />

      <PortfolioHistoryView
        historyData={transformedHistoryData}
        totalInvestment={totalInvestment}
        currentValue={currentValue}
        isLoading={portfolioHistoryData.length === 0}
      />
    </div>
  );
};