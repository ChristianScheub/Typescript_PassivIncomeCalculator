import React from 'react';
import { UseFormSetValue, UseFormWatch, FieldValues } from 'react-hook-form';
import { OptionalSection } from '../forms/StandardFormWrapper';
import { useTranslation } from 'react-i18next';
import { BaseAssetFields } from './BaseAssetFields';
import { AssetType } from '@/types/shared';

interface AssetSpecificFieldsProps {
  assetType: AssetType;
  quantity?: number;
  currentPrice?: number;
  watch: UseFormWatch<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
}

export const AssetSpecificFields: React.FC<AssetSpecificFieldsProps> = ({
  assetType,
  quantity,
  currentPrice,
  watch,
  setValue
}) => {
  const { t } = useTranslation();

  const getTitleByAssetType = () => {
    switch (assetType) {
      case 'stock':
        return t('assets.form.stockSpecific');
      case 'real_estate':
        return t('assets.form.realEstateSpecific');
      case 'bond':
        return t('assets.form.bondSpecific');
      case 'crypto':
        return t('assets.form.cryptoSpecific');
      default:
        return t('assets.form.assetSpecific');
    }
  };

  if (!assetType) {
    return null;
  }

  return (
    <OptionalSection title={getTitleByAssetType()}>
      <BaseAssetFields
        assetType={assetType}
        quantity={quantity}
        currentPrice={currentPrice}
        watch={watch}
        setValue={setValue}
        showCalculatedValue={false} // Different styling in OptionalSection
      />
    </OptionalSection>
  );
};
