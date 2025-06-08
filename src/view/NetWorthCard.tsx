import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/common/Card';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import formatService from '../service/formatService';
import { useTranslation } from 'react-i18next';

interface NetWorthCardProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({
  netWorth,
  totalAssets,
  totalLiabilities
}) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{t('pages.netWorth')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          {formatService.formatCurrency(netWorth)}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <ArrowUpCircle className="text-emerald-500 mt-1" size={18} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('pages.totalAssets')}</p>
              <p className="text-lg font-semibold">{formatService.formatCurrency(totalAssets)}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <ArrowDownCircle className="text-red-500 mt-1" size={18} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('pages.totalLiabilities')}</p>
              <p className="text-lg font-semibold">{formatService.formatCurrency(totalLiabilities)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthCard;