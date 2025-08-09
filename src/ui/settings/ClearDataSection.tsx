import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/shared';
import { ChevronRight } from 'lucide-react';
import { ClearButton, getClearButtonIcon } from '@/ui/settings';
import { ClearStatus } from '@/types/shared/ui/clearButton';
import clsx from 'clsx';

interface ClearDataSectionProps {
  clearAssetDefinitionsStatus: ClearStatus;
  clearPriceHistoryStatus: ClearStatus;
  clearAssetTransactionsStatus: ClearStatus;
  clearDebtsStatus: ClearStatus;
  clearExpensesStatus: ClearStatus;
  clearIncomeStatus: ClearStatus;
  clearAllDataStatus: ClearStatus;
  clearReduxCacheStatus: ClearStatus;
  clearDividendHistoryStatus: ClearStatus;
  onClearAssetDefinitions: () => void;
  onClearPriceHistory: () => void;
  onClearAssetTransactions: () => void;
  onClearDebts: () => void;
  onClearExpenses: () => void;
  onClearIncome: () => void;
  onClearAllData: () => void;
  onClearReduxCache: () => void;
  onClearDividendHistory: () => void;
}

export const ClearDataSection: React.FC<ClearDataSectionProps> = ({
  clearAssetDefinitionsStatus,
  clearPriceHistoryStatus,
  clearAssetTransactionsStatus,
  clearDebtsStatus,
  clearExpensesStatus,
  clearIncomeStatus,
  clearAllDataStatus,
  clearReduxCacheStatus,
  clearDividendHistoryStatus,
  onClearAssetDefinitions,
  onClearPriceHistory,
  onClearAssetTransactions,
  onClearDebts,
  onClearExpenses,
  onClearIncome,
  onClearAllData,
  onClearReduxCache,
  onClearDividendHistory,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Asset Management Section */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t("settings.assetManagement")}
        </h3>
        <div className="space-y-3">
          <ClearButton
            status={clearAssetDefinitionsStatus}
            onClick={onClearAssetDefinitions}
            titleKey="settings.clearAssetDefinitions"
            descKey="settings.clearAssetDefinitionsDesc"
            t={t}
          />
          <ClearButton
            status={clearPriceHistoryStatus}
            onClick={onClearPriceHistory}
            titleKey="settings.clearPriceHistory"
            descKey="settings.clearPriceHistoryDesc"
            t={t}
          />
          {/* Transaktionen löschen */}
          <ClearButton
            status={clearAssetTransactionsStatus}
            onClick={onClearAssetTransactions}
            titleKey="settings.clearAssetTransactions"
            descKey="settings.clearAssetTransactionsDesc"
            t={t}
          />
          {/* Dividendenverlauf löschen */}
          <ClearButton
            status={clearDividendHistoryStatus}
            onClick={onClearDividendHistory}
            titleKey="settings.clearDividendHistory"
            descKey="settings.clearDividendHistoryDesc"
            t={t}
          />
        </div>
      </div>

      {/* Financial Management Section */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t("settings.financialManagement")}
        </h3>
        <div className="space-y-3">
          <ClearButton
            status={clearDebtsStatus}
            onClick={onClearDebts}
            titleKey="settings.clearDebts"
            descKey="settings.clearDebtsDesc"
            t={t}
          />

          <ClearButton
            status={clearExpensesStatus}
            onClick={onClearExpenses}
            titleKey="settings.clearExpenses"
            descKey="settings.clearExpensesDesc"
            t={t}
          />

          <ClearButton
            status={clearIncomeStatus}
            onClick={onClearIncome}
            titleKey="settings.clearIncome"
            descKey="settings.clearIncomeDesc"
            t={t}
          />
        </div>
      </div>

      {/* Cache Management Section */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t("settings.cacheManagement")}
        </h3>
        <div className="space-y-3">
          <ClearButton
            status={clearReduxCacheStatus}
            onClick={onClearReduxCache}
            titleKey="settings.clearReduxCache"
            descKey="settings.clearReduxCacheDesc"
            t={t}
          />
        </div>
      </div>

      {/* Complete Reset Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t("settings.completeReset")}
        </h3>
        <div className="space-y-3">
          <Button
            variant="destructive"
            className={clsx("w-full justify-between", {
              'opacity-50': clearAllDataStatus === "clearing"
            })}
            onClick={onClearAllData}
            disabled={clearAllDataStatus === "clearing"}
          >
            <div className="text-left">
              <span className="flex items-center mb-1">
                {getClearButtonIcon(clearAllDataStatus)}
                {t("settings.clearAllData")}
              </span>
              <p className="text-sm text-gray-400">
                {t("settings.clearAllDataDesc")}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
};
