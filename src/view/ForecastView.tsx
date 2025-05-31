import React from 'react';
import { useTranslation } from 'react-i18next';
import { MonthlyProjection, AssetAllocation, ExpenseBreakdown, IncomeAllocation } from '../types';
import TabSelector from '../ui/TabSelector';
import AssetAllocationChart from '../ui/pieCharts/PieChartAssetAllocation';
import PieChartIncomeAllocation from '../ui/pieCharts/PieChartIncomeAllocation';
import PieChartExpenseBreakdown from '../ui/pieCharts/PieChartExpenseBreakdown';
import BarChartCashFlowProjection from '../ui/barCharts/BarChartCashFlowProjection';
import BarChartNetCashFlow from '../ui/barCharts/BarChartNetCashFlow';
import BarChartExpenseCoverage from '../ui/barCharts/BarChartExpenseCoverage';

interface ForecastViewProps {
  selectedTab: 'projections' | 'allocations';
  isLoading: boolean;
  projections: MonthlyProjection[];
  assetAllocation: AssetAllocation[];
  expenseBreakdown: ExpenseBreakdown[];
  incomeAllocation: IncomeAllocation[];
  liabilities: { category: string; amount: number }[];
  onTabChange: (tab: 'projections' | 'allocations') => void;
}

const ForecastView: React.FC<ForecastViewProps> = ({
  selectedTab,
  isLoading,
  projections,
  assetAllocation,
  expenseBreakdown,
  incomeAllocation,
  liabilities,
  onTabChange
}) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 'projections', label: t('forecast.projections') },
    { id: 'allocations', label: t('forecast.allocations') }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">{t('forecast.loading')}</p>
      </div>
    );
  }

  if (selectedTab === 'projections') {
    return (
      <div className="space-y-6">
        <TabSelector
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={(id) => onTabChange(id as 'projections' | 'allocations')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartCashFlowProjection projections={projections} />
          <BarChartNetCashFlow projections={projections} />
          <BarChartExpenseCoverage projections={projections} />
        </div>
      </div>
    );
  }

  if (selectedTab === 'allocations') {
    return (
      <div className="space-y-6">
        <TabSelector
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={(id) => onTabChange(id as 'projections' | 'allocations')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AssetAllocationChart
            title={t('forecast.assetAllocation')}
            assetAllocation={assetAllocation}
          />
          <PieChartIncomeAllocation incomeAllocation={incomeAllocation} />
          <PieChartExpenseBreakdown expenseBreakdown={expenseBreakdown} liabilities={liabilities} />
        </div>
      </div>
    );
  }

  return null;
};

export default ForecastView;
