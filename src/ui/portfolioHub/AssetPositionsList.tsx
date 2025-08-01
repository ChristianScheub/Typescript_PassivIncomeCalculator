import React from 'react';
import { useTranslation } from 'react-i18next';
import formatService from '@/service/infrastructure/formatService';
import { AssetDefinition } from '@/types/domains/assets/entities';
import { AssetWithValue } from '@/types/domains/portfolio/assetWithValue';

interface AssetPositionsListProps {
  assetsWithValues: AssetWithValue[];
  onAssetClick?: (assetDefinition: AssetDefinition) => void;
  title?: string;
  emptyMessage?: string;
  showQuantity?: boolean;
  showPrice?: boolean;
  showValue?: boolean;
  showDayChange?: boolean;
}

export const AssetPositionsList: React.FC<AssetPositionsListProps> = ({
  assetsWithValues,
  onAssetClick,
  title,
  emptyMessage,
  showQuantity = true,
  showPrice = true,
  showValue = true,
  showDayChange = true,
}) => {
  const { t } = useTranslation();

  const defaultTitle = title || t('assetFocus.positions') || 'Positionen';
  const defaultEmptyMessage = emptyMessage || t('assetFocus.noAssets') || 'Keine Assets gefunden';

  // Use fixed grid layout for better Tailwind compatibility
  const gridClass = "grid-cols-4";

  const handleAssetClick = (assetWithValue: AssetWithValue) => {
    if (onAssetClick) {
      onAssetClick(assetWithValue.assetDefinition);
    }
  };

  // Hilfsfunktion: Berechne dayChange und dayChangePercent aus priceHistory
  function getDayChange(assetDefinition: AssetDefinition, quantity: number) {
    if (!assetDefinition.priceHistory || assetDefinition.priceHistory.length < 2) {
      return { dayChange: 0, dayChangePercent: 0 };
    }
    const sortedHistory = [...assetDefinition.priceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const todayPrice = sortedHistory[0]?.price || assetDefinition.currentPrice || 0;
    const yesterdayPrice = sortedHistory[1]?.price || todayPrice;
    const priceChange = todayPrice - yesterdayPrice;
    const dayChange = quantity * priceChange;
    const dayChangePercent = yesterdayPrice > 0 ? (priceChange / yesterdayPrice) * 100 : 0;
    return { dayChange, dayChangePercent };
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {defaultTitle}
        </h3>
      </div>
      {assetsWithValues.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>{defaultEmptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Table Header */}
          <div className={`px-4 py-3 bg-gray-50 dark:bg-gray-900 grid ${gridClass} gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
            <div>{t('common.asset') || 'Asset'}</div>
            {showQuantity && <div className="text-right">{t('common.position') || 'Position'}</div>}
            {showValue && <div className="text-right">{t('common.value') || 'Wert'}</div>}
            {showDayChange && <div className="text-right">{t('common.change') || 'Änderung'}</div>}
          </div>
          {/* Assets Rows */}
          {assetsWithValues.map((assetWithValue, index) => {
            const { assetDefinition, value, quantity } = assetWithValue;
            if (!assetDefinition) return null;
            const { dayChange, dayChangePercent } = getDayChange(assetDefinition, quantity);
            return (
              <div 
                key={`${assetDefinition.ticker || assetDefinition.id}-${index}`} 
                className={`px-4 py-4 grid ${gridClass} gap-4 items-center transition-colors ${
                  onAssetClick 
                    ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleAssetClick(assetWithValue)}
              >
                {/* Asset Info */}
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {assetDefinition.ticker || assetDefinition.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {assetDefinition.fullName || assetDefinition.name}
                  </span>
                </div>
                {/* Position */}
                {showQuantity && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {quantity.toFixed(4)}
                    </div>
                    {showPrice && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        @ {formatService.formatCurrency(assetDefinition.currentPrice || 0)}
                      </div>
                    )}
                  </div>
                )}
                {/* Value */}
                {showValue && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatService.formatCurrency(value)}
                    </div>
                  </div>
                )}
                {/* Day Change */}
                {showDayChange && (
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      dayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {dayChange >= 0 ? '+' : ''}
                      {formatService.formatCurrency(dayChange)}
                    </div>
                    <div className={`text-xs ${
                      dayChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {dayChangePercent >= 0 ? '+' : ''}
                      {dayChangePercent.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
