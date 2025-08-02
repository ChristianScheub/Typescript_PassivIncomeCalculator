import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePortfolioHistoryView } from '@/hooks/usePortfolioHistoryView';
import { PortfolioHistoryView } from '@/view/portfolio-hub/assets/PortfolioHistoryView';
import { ViewHeader } from '@/ui/shared/ViewHeader';
import { useDeviceCheck } from '@/service/shared/utilities/helper/useDeviceCheck';
import Logger from '@/service/shared/logging/Logger/logger';
import { AssetFocusTimeRange } from '@/types/shared/analytics';

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
  const [selectedTimeRange, setSelectedTimeRange] = useState<AssetFocusTimeRange>('1M');

  // usePortfolioHistoryView mit aktuellem Zeitbereich aufrufen
  const portfolioHistoryData = usePortfolioHistoryView(selectedTimeRange);

  // Transform data for the view component (PortfolioHistoryView expects specific structure)
  const transformedHistoryData = useMemo(() => {
    Logger.info(`🔍 DEBUG PortfolioHistoryContainer: portfolioHistoryData length=${portfolioHistoryData.length}`);
    if (portfolioHistoryData.length > 0) {
      Logger.info(`🔍 DEBUG first 3 items: ${JSON.stringify(portfolioHistoryData.slice(0, 3).map(point => ({ 
        date: point.date, 
        totalValue: point.totalValue, 
        valueType: typeof point.totalValue,
      })))}"`);
    }

    // Map to PortfolioHistoryPoint structure
    const transformed = portfolioHistoryData.map(point => ({
      date: point.date,
      totalValue: point.totalValue,
      totalInvested: 0,
      totalReturn: point.change ?? 0,
      totalReturnPercentage: point.changePercentage ?? 0,
      positions: []
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