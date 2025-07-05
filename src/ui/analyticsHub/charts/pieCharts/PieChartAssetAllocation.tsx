import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartTooltip } from '../ChartTooltips';
import { COLORS_LIGHT, COLORS_DARK } from '@/utils/constants';
import { LineChart } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button, Card } from '@/ui/shared';
import { formatService } from '@/service';
import { AssetAllocation } from '@/types/domains/dashboard';

interface AssetAllocationChartProps {
  title?: string;
  assetAllocation: AssetAllocation[];
  showTitle?: boolean;
}

const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  title,
  assetAllocation,
  showTitle = true
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/';
  const { theme } = useTheme();
  
  // Use theme-aware colors
  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  return (
    <Card title={title}>
      <div className="w-full flex flex-col">
        {assetAllocation.length > 0 ? (
          <div className="flex flex-col">
            {/* Chart container with proper spacing */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {showTitle && (
                    <text
                      x="50%"
                      y="25"
                      textAnchor="middle"
                      className="text-lg font-semibold fill-current"
                    >
                      {title || t('forecast.assetAllocation')}
                    </text>
                  )}
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy={showTitle ? "60%" : "50%"}
                    outerRadius={showTitle ? 85 : 100}
                    innerRadius={showTitle ? 40 : 50}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetAllocation.map((item) => (
                      <Cell key={item.name} fill={colors[assetAllocation.findIndex(a => a.name === item.name) % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip chartType="pie" formatCurrency={formatService.formatCurrency} formatPercentage={(value: number) => `${(value).toFixed(1)}%`} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Single column layout for better readability */}
            <div className="mt-6 space-y-3 px-4 max-h-48 overflow-y-auto">
              {assetAllocation.map((allocation, index) => (
                <div key={allocation.name} className="flex items-center space-x-3 py-1">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t(`assets.types.${allocation.name}`)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatService.formatCurrency(allocation.value)}
                      {allocation.percentage && ` (${allocation.percentage.toFixed(1)}%)`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isDashboard && (
              <div className="flex justify-center mt-6 mb-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/forecast?tab=allocations')}
                  className="text-sm"
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  {t('common.viewDetails')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('forecast.noAssetData')}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AssetAllocationChart;
