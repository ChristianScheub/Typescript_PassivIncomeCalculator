import React from 'react';
import { useTranslation } from 'react-i18next';
import { MonthlyProjection } from '../../types';
import TabSelector from '../../ui/navigation/TabSelector';
import BarChartCashFlowProjection from '../../ui/charts/barCharts/BarChartCashFlowProjection';
import BarChartNetCashFlow from '../../ui/charts/barCharts/BarChartNetCashFlow';
import BarChartExpenseCoverage from '../../ui/charts/barCharts/BarChartExpenseCoverage';
import MilestonesContainer from '../../container/MilestonesContainer';

type ForecastTab = 'projections' | 'fire';

interface ForecastViewProps {
  selectedTab: ForecastTab;
  isLoading: boolean;
  projections: MonthlyProjection[];
  onTabChange: (tab: ForecastTab) => void;
}

const ForecastView: React.FC<ForecastViewProps> = ({
  selectedTab,
  isLoading,
  projections,
  onTabChange
}) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 'projections', label: t('forecast.projections') },
    { id: 'fire', label: t('forecast.fire') }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">{t('forecast.loading')}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (selectedTab) {
      case 'projections':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartCashFlowProjection projections={projections} />
            <BarChartNetCashFlow projections={projections} />
            <BarChartExpenseCoverage projections={projections} />
          </div>
        );
      case 'fire':
        return <MilestonesContainer />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <TabSelector
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={(id) => onTabChange(id as ForecastTab)}
      />
      {renderContent()}
    </div>
  );
};

export default ForecastView;
/* case 'allocations':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AssetAllocationChart
              title={t('forecast.assetAllocation')}
              assetAllocation={assetAllocation}
            />
            <PieChartIncomeAllocation incomeAllocation={incomeAllocation} />
            <PieChartExpenseBreakdown expenseBreakdown={expenseBreakdown} liabilities={liabilities} />
          </div>
        );*/