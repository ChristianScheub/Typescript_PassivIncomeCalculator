import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePortfolioHistoryView } from '@/hooks/usePortfolioHistoryView';
import { PortfolioHistoryView } from '@/view/portfolio-hub/PortfolioHistoryView';
import { ViewHeader } from '@/ui/shared/ViewHeader';
import { useDeviceCheck } from '@/service/shared/utilities/helper/useDeviceCheck';
import Logger from '@/service/shared/logging/Logger/logger';

interface PortfolioHistoryContainerProps {
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
  
  // Zeitbereich-Filter im Container halten
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1T' | '1W' | '1M' | '3M' | '6M' | '1J' | 'Max'>('1M');

  // usePortfolioHistoryView mit aktuellem Zeitbereich aufrufen
  const portfolioHistoryData = usePortfolioHistoryView(selectedTimeRange);

  // Transform data for the view component (PortfolioHistoryView expects specific structure)
  const transformedHistoryData = useMemo(() => {
    Logger.info(`🔍 DEBUG PortfolioHistoryContainer: portfolioHistoryData length=${portfolioHistoryData.length}`);
    if (portfolioHistoryData.length > 0) {
      Logger.info(`🔍 DEBUG first 3 items: ${JSON.stringify(portfolioHistoryData.slice(0, 3).map(point => ({ 
        date: point.date, 
        value: point.value, 
        valueType: typeof point.value,
        hasTransactions: !!point.transactions 
      })))}"`);
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

  console.log('Container: Rendering PortfolioHistoryView', selectedTimeRange, transformedHistoryData.length);
  return (
    <div className="container mx-auto px-4 py-4">
      <ViewHeader
        title={t('portfolio.historyTitle')}
        isMobile={!isDesktop}
        onBack={onBack}
      />

      <PortfolioHistoryView
        key={selectedTimeRange}
        historyData={transformedHistoryData}
        totalInvestment={totalInvestment}
        currentValue={currentValue}
        isLoading={portfolioHistoryData.length === 0}
        timeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
      />
    </div>
  );
};