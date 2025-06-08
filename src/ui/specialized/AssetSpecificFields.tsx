import React from 'react';
import { AssetType, DividendFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { OptionalSection } from '../forms/StandardFormWrapper';
import { useTranslation } from 'react-i18next';
import { BaseAssetFields } from './BaseAssetFields';

interface AssetSpecificFieldsProps {
  assetType: AssetType;
  dividendFrequency?: DividendFrequency;
  quantity?: number;
  currentPrice?: number;
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
  paymentFields: { months?: number[] };
  handleMonthChange: (month: number, checked: boolean) => void;
}

export const AssetSpecificFields: React.FC<AssetSpecificFieldsProps> = ({
  assetType,
  dividendFrequency,
  quantity,
  currentPrice,
  watch,
  setValue,
  paymentFields,
  handleMonthChange
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
        dividendFrequency={dividendFrequency}
        quantity={quantity}
        currentPrice={currentPrice}
        watch={watch}
        setValue={setValue}
        paymentFields={paymentFields}
        handleMonthChange={handleMonthChange}
        showCalculatedValue={false} // Different styling in OptionalSection
      />
    </OptionalSection>
  );
};
