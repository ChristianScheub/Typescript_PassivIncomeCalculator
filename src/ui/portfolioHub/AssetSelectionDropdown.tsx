import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssetSelectionDropdownProps } from '@/types/shared/ui/asset-selection';

export const AssetSelectionDropdown: React.FC<AssetSelectionDropdownProps> = ({
  register,
  handleDefinitionSelect,
  filteredDefinitions,
  errors,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <select
        {...register('assetDefinitionId')}
        onChange={(e) => handleDefinitionSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        required
      >
        <option value="">{t('assets.selectAssetOption')}</option>
        {filteredDefinitions.map((definition) => (
          <option key={definition.id} value={definition.id}>
            {definition.fullName} {definition.ticker && `(${definition.ticker})`}
            {definition.sector && ` - ${definition.sector}`}
          </option>
        ))}
      </select>
      {errors.assetDefinitionId && (
        <p className="mt-1 text-sm text-red-600">
          {typeof errors.assetDefinitionId.message === 'string' ? errors.assetDefinitionId.message : 'Invalid selection'}
        </p>
      )}
    </div>
  );
};
