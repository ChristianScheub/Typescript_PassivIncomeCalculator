import React from 'react';
import { useTranslation } from 'react-i18next';
import { DividendHistoryEntry } from '@/types/domains/assets/dividends';
import { Calendar, Upload } from 'lucide-react';
import { formatCurrency } from '@service/infrastructure/formatService/methods/formatCurrency';

interface DividendHistoryViewProps {
  dividendHistory: DividendHistoryEntry[];
  maxEntries?: number;
  showSourceIcons?: boolean;
  title?: string;
}

export const DividendHistoryView: React.FC<DividendHistoryViewProps> = ({
  dividendHistory = [],
  maxEntries = 10,
  showSourceIcons = true,
  title,
}) => {
  const { t } = useTranslation();
  const sortedHistory = [...dividendHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxEntries);

  const getSourceIcon = (source?: string) => {
    if (!showSourceIcons) return null;
    switch (source) {
      case 'manual':
        return <Calendar className="h-3 w-3 text-blue-500" />;
      case 'api':
        return <Upload className="h-3 w-3 text-green-500" />;
      default:
        return <Calendar className="h-3 w-3 text-gray-400" />;
    }
  };

  if (!dividendHistory || dividendHistory.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {title || t('assets.dividendHistory')}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('assets.noDividendHistory')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        {title || t('assets.dividendHistory')}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({dividendHistory.length} {t('assets.priceHistory.entries')})
        </span>
      </h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sortedHistory.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-700 rounded border"
          >
            <div className="flex items-center gap-2">
              {getSourceIcon(entry.source)}
              <div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(entry.amount)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(entry.date).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </div>
              </div>
            </div>
            <div className="text-right">
              {entry.currency && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {entry.currency}
                </div>
              )}
              {entry.source && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t(`assets.priceHistory.${entry.source}`)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {dividendHistory.length > maxEntries && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          {t('common.andMore', { count: dividendHistory.length - maxEntries })} weitere Einträge...
        </div>
      )}
    </div>
  );
};
