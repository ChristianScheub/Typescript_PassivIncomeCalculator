import React from 'react';
import { useTranslation } from 'react-i18next';
import { PriceHistoryEntry } from '../../types';
import { formatCurrency } from '../../service/formatService/methods/formatCurrency';
import { TrendingUp, TrendingDown, Calendar, Database, Upload } from 'lucide-react';

interface PriceHistoryViewProps {
  priceHistory: PriceHistoryEntry[];
  currency?: string;
  title?: string;
  showSourceIcons?: boolean;
  maxEntries?: number;
}

export const PriceHistoryView: React.FC<PriceHistoryViewProps> = ({
  priceHistory = [],
  currency = 'EUR',
  title,
  showSourceIcons = true,
  maxEntries = 10
}) => {
  const { t } = useTranslation();

  // Sort by date (newest first) and limit entries
  const sortedHistory = [...priceHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxEntries);

  const getSourceIcon = (source?: string) => {
    if (!showSourceIcons) return null;
    
    switch (source) {
      case 'manual':
        return <Calendar className="h-3 w-3 text-blue-500" />;
      case 'api':
        return <Database className="h-3 w-3 text-green-500" />;
      case 'import':
        return <Upload className="h-3 w-3 text-purple-500" />;
      default:
        return <Calendar className="h-3 w-3 text-gray-400" />;
    }
  };

  const calculatePriceChange = (currentPrice: number, previousPrice: number) => {
    if (previousPrice === 0) return null;
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    return change;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (sortedHistory.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {title || t('assets.priceHistory.title')}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('assets.priceHistory.noHistory')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        {title || t('assets.priceHistory.title')}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({sortedHistory.length} {t('assets.priceHistory.entries')})
        </span>
      </h4>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sortedHistory.map((entry, index) => {
          const previousEntry = sortedHistory[index + 1];
          const priceChange = previousEntry ? calculatePriceChange(entry.price, previousEntry.price) : null;
          
          return (
            <div 
              key={`${entry.date}-${entry.price}`}
              className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-700 rounded border"
            >
              <div className="flex items-center gap-2">
                {getSourceIcon(entry.source)}
                <div>
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(entry.price, currency)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(entry.date)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {priceChange !== null && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    priceChange >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {priceChange >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </div>
                )}
                
                {entry.source && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t(`assets.priceHistory.${entry.source}`)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {priceHistory.length > maxEntries && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          {t('common.andMore', { count: priceHistory.length - maxEntries })} weitere Einträge...
        </div>
      )}
    </div>
  );
};
