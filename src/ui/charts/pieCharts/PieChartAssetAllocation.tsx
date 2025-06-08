import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { CustomPieTooltip } from '../CustomPieTooltip';
import { AssetAllocation } from '../../../types';
import { COLORS_LIGHT, COLORS_DARK } from '../../../utils/constants';
import { LineChart } from 'lucide-react';
import formatService from '../../../service/formatService';
import { useTheme } from '../../../hooks/useTheme';

interface AssetAllocationChartProps {
  title?: string;
  assetAllocation: AssetAllocation[];
  height?: number | string;
  showTitle?: boolean;
}

const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  title,
  assetAllocation,
  height = 400,
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
      <div className="h-[500px] w-full flex flex-col">
        {assetAllocation.length > 0 ? (
          <div className="flex flex-col h-full">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {showTitle && (
                    <text
                      x="50%"
                      y="20"
                      textAnchor="middle"
                      className="text-lg font-semibold"
                    >
                      {title || t('forecast.assetAllocation')}
                    </text>
                  )}
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetAllocation.map((item) => (
                      <Cell key={item.name} fill={colors[assetAllocation.findIndex(a => a.name === item.name) % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip formatCurrency={formatService.formatCurrency} formatPercentage={(value) => `${(value).toFixed(1)}%`} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 px-4">
              {assetAllocation.map((allocation, index) => (
                <div key={allocation.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{t(`assets.types.${allocation.name}`)}</div>
                    <div className="text-sm text-gray-500">
                      {formatService.formatCurrency(allocation.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isDashboard && (
              <div className="flex justify-center mt-4 mb-2">
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
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('forecast.noAssetData')}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AssetAllocationChart;
