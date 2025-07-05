import React from 'react';
import { useTranslation } from 'react-i18next';
import { MonthlyProjection } from '@/types/domains/analytics';
import { ViewHeader } from '@ui/shared';
import { BarChartCashFlowProjection,BarChartExpenseCoverage ,BarChartNetCashFlow} from '@/ui/portfolioHub';

interface ForecastViewProps {
  isLoading: boolean;
  projections: MonthlyProjection[];
  onBack?: () => void;
}

const ForecastView: React.FC<ForecastViewProps> = ({
  isLoading,
  projections,
  onBack
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {onBack && (
            <ViewHeader
              title={t('forecast.title')}
              subtitle={t('forecast.subtitle')}
              onBack={onBack}
            />
          )}
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-gray-500 dark:text-gray-400">{t('forecast.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {onBack && (
          <ViewHeader
            title={t('forecast.title')}
            subtitle={t('forecast.subtitle')}
            onBack={onBack}
          />
        )}

        {/* Forecast Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <BarChartCashFlowProjection projections={projections} />
          <BarChartNetCashFlow projections={projections} />
          <BarChartExpenseCoverage projections={projections} />
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('forecast.aboutTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('forecast.aboutDescription')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('forecast.features')}
              </h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• {t('forecast.feature1')}</li>
                <li>• {t('forecast.feature2')}</li>
                <li>• {t('forecast.feature3')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('forecast.insights')}
              </h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• {t('forecast.insight1')}</li>
                <li>• {t('forecast.insight2')}</li>
                <li>• {t('forecast.insight3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastView;