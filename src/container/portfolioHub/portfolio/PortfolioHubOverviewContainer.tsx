import React from 'react';
import PortfolioOverviewView from '@/view/portfolio-hub/PortfolioHubOverviewView';
import Logger from '@/service/shared/logging/Logger/logger';
import { PortfolioCategory, PortfolioSubCategory } from '@/types/domains/analytics/reporting';

interface PortfolioSummary {
  totalAssetValue: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyCashFlow: number;
  assetsCount: number;
  liabilitiesCount: number;
  incomeSourcesCount: number;
  expenseCategoriesCount: number;
}

interface PortfolioOverviewContainerProps {
  portfolioSummary: PortfolioSummary;
  onCategoryChange: (category: PortfolioCategory, subCategory?: PortfolioSubCategory) => void;
}

const PortfolioOverviewContainer: React.FC<PortfolioOverviewContainerProps> = ({
  portfolioSummary,
  onCategoryChange
}) => {

  Logger.info('Portfolio Overview: Rendering overview with summary'+ portfolioSummary);

  return (
    <PortfolioOverviewView
      portfolioSummary={portfolioSummary}
      onCategoryChange={onCategoryChange}
    />
  );
};

export default PortfolioOverviewContainer;
