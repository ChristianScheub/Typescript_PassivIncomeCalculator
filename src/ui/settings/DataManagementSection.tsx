import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/shared';
import { Download, Upload } from 'lucide-react';
import { getButtonText } from '@/ui/settings';
import { useDeviceCheck } from '@/service/shared/utilities/helper/useDeviceCheck';

interface DataManagementSectionProps {
  exportStatus: 'idle' | 'loading' | 'success' | 'error';
  importStatus: 'idle' | 'loading' | 'success' | 'error';
  importError: string | null;
  onExportData: (storeNames: string[]) => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  exportStatus,
  importStatus,
  importError,
  onExportData,
  onImportData,
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();
  const isSmartphone = !isDesktop;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract button text helpers for reduced complexity
  const exportButtonText = getButtonText(exportStatus, t, 'settings.exporting', 'settings.exported', 'settings.export');
  const importButtonText = getButtonText(importStatus, t, 'settings.importing', 'settings.imported', 'settings.import');

  // Unterstützte Stores für gezielten Export/Import
  const STORE_OPTIONS = [
    { key: 'transactions', label: t('settings.transactions') },
    { key: 'assetDefinitions', label: t('settings.assetDefinitions') },
    { key: 'assetCategories', label: t('settings.assetCategories') },
    { key: 'assetCategoryOptions', label: t('settings.assetCategoryOptions') },
    { key: 'assetCategoryAssignments', label: t('settings.assetCategoryAssignments') },
    { key: 'liabilities', label: t('settings.liabilities') },
    { key: 'expenses', label: t('settings.expenses') },
    { key: 'income', label: t('settings.income') },
    { key: 'exchangeRates', label: t('settings.exchangeRates') },
  ];

  const [selectedStores, setSelectedStores] = useState<string[]>(STORE_OPTIONS.map(opt => opt.key));

  return (
    <div className="space-y-4">
      {/* Import Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{t('settings.importData')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('settings.importDescription')}
          </p>
          {importError && (
            <p className="text-sm text-red-500 mt-1">{importError}</p>
          )}
        </div>
        <div className={isSmartphone ? '!w-[10vw] min-w-[48px] max-w-[80px] flex justify-center' : 'relative'} style={isSmartphone ? { width: '10vw', minWidth: 48, maxWidth: 80 } : {}}>
          {/* File-Input per Button-Ref triggern */}
          <input
            ref={fileInputRef}
            id="import-file-input"
            type="file"
            accept="application/json"
            onChange={onImportData}
            className="hidden"
            disabled={importStatus === 'loading'}
          />
          <Button
            type="button"
            disabled={importStatus === 'loading'}
            className={`flex items-center space-x-2${isSmartphone ? ' justify-center' : ''}`}
            style={isSmartphone ? { width: '10vw', minWidth: 48, maxWidth: 80 } : {}}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            {!isSmartphone && <span>{importButtonText}</span>}
          </Button>
        </div>
      </div>
      {/* Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{t('settings.exportData')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('settings.exportDescription')}
          </p>
        </div>
        <div className={isSmartphone ? '!w-[10vw] min-w-[48px] max-w-[80px] flex justify-center' : ''} style={isSmartphone ? { width: '10vw', minWidth: 48, maxWidth: 80 } : {}}>
          <Button
            onClick={() => onExportData(selectedStores)}
            disabled={exportStatus === 'loading' || selectedStores.length === 0}
            className={`flex items-center space-x-2${isSmartphone ? ' justify-center' : ''}`}
            style={isSmartphone ? { width: '10vw', minWidth: 48, maxWidth: 80 } : {}}
          >
            <Download size={16} />
            {!isSmartphone && <span>{exportButtonText}</span>}
          </Button>
        </div>
      </div>

      {/* Store Auswahl Collapsible (jetzt als <details>) */}
      <details className="mb-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/10 px-4 py-2">
        <summary className="cursor-pointer font-medium text-blue-700 dark:text-blue-300 py-2 select-none">
          {t('settings.selectDataSets')}
        </summary>
        <div className="mt-2">
          {/* Chips für ausgewählte Stores */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedStores.map(key => {
              const label = STORE_OPTIONS.find(opt => opt.key === key)?.label || key;
              return (
                <span key={key} className="flex items-center bg-blue-600 text-white rounded-full px-3 py-1 text-sm mr-1 mb-1">
                  {label}
                  <button
                    type="button"
                    className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                    onClick={() => setSelectedStores(selectedStores.filter(k => k !== key))}
                    aria-label={`Remove ${label}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
          {/* Multi-Select Input */}
          <div className="relative w-full max-w-md">
            <select
              multiple
              value={selectedStores}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                setSelectedStores(options);
              }}
              className="block w-full border border-blue-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
              size={Math.min(STORE_OPTIONS.length, 6)}
            >
              {STORE_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key} className="py-1">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-1">{t('settings.selectDataSetsHint')}</p>
        </div>
      </details>
    </div>
  );
};
