import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssetDefinition } from '@/types/domains/assets/';

interface SelectedAssetInfoProps {
  selectedDefinition: AssetDefinition;
}

export const SelectedAssetInfo: React.FC<SelectedAssetInfoProps> = ({
  selectedDefinition,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><strong>{t('assets.type')}:</strong> {t(`assets.types.${selectedDefinition.type}`)}</div>
        <div><strong>{t('assets.sector')}:</strong> {selectedDefinition.sectors && selectedDefinition.sectors.length > 0
          ? selectedDefinition.sectors.map(s => s.sectorName || s.sector).filter(Boolean).join(', ')
          : 'N/A'}</div>
        <div><strong>{t('assets.country')}:</strong> {selectedDefinition.country || 'N/A'}</div>
        <div><strong>{t('assets.currency')}:</strong> {selectedDefinition.currency || 'N/A'}</div>
        {selectedDefinition.dividendInfo && (
          <>
            <div><strong>{t('assets.dividend')}:</strong> {selectedDefinition.dividendInfo.amount}</div>
            <div><strong>{t('assets.frequency')}:</strong> {t(`paymentFrequency.${selectedDefinition.dividendInfo.frequency}`)}</div>
          </>
        )}
      </div>
    </div>
  );
};
