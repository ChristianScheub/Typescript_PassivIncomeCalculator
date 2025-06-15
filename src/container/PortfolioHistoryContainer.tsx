import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Asset, AssetDefinition } from '../types';
import { PortfolioHistoryService, PortfolioHistoryPoint } from '../service/portfolioHistoryService';
import { PortfolioHistoryView } from '../view/portfolio/PortfolioHistoryView';
import { ViewHeader } from '../ui/layout/ViewHeader';
import { useDeviceCheck } from '../service/helper/useDeviceCheck';

interface PortfolioHistoryContainerProps {
  assets: Asset[];
  assetDefinitions: AssetDefinition[];
  totalInvestment: number;
  currentValue: number;
  onBack: () => void;
}

export const PortfolioHistoryContainer: React.FC<PortfolioHistoryContainerProps> = ({
  assets,
  assetDefinitions,
  totalInvestment,
  currentValue,
  onBack
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();
  const [historyData, setHistoryData] = useState<PortfolioHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate portfolio history
  const portfolioHistory = useMemo(() => {
    if (!assets || assets.length === 0) {
      return [];
    }
    
    try {
      return PortfolioHistoryService.calculatePortfolioHistory(assets, assetDefinitions);
    } catch (error) {
      console.error('Error calculating portfolio history:', error);
      return [];
    }
  }, [assets, assetDefinitions]);

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setHistoryData(portfolioHistory);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [portfolioHistory]);

  return (
    <div className="container mx-auto px-4 py-4">
      <ViewHeader
        title={t('portfolio.historyTitle')}
        isMobile={!isDesktop}
        leftContent={
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {isDesktop && t('common.back')}
          </button>
        }
      />

      <PortfolioHistoryView
        historyData={historyData}
        totalInvestment={totalInvestment}
        currentValue={currentValue}
        isLoading={isLoading}
      />
    </div>
  );
};
