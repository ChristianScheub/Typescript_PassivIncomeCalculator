import React from 'react';
import { AssetType, DividendFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { FormSection, SectionTitle } from '../forms/MaterialForm';
import { useTranslation } from 'react-i18next';
import { BaseAssetFields } from './BaseAssetFields';

interface AssetSpecificSectionProps {
  assetType: AssetType;
  dividendFrequency?: DividendFrequency;
  quantity?: number;
  currentPrice?: number;
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
  paymentFields: {
    months?: number[];
  };
  handleMonthChange: (month: number, checked: boolean) => void;
}

export const AssetSpecificSection: React.FC<AssetSpecificSectionProps> = ({
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
    <FormSection>
      <SectionTitle sx={{ 
        fontSize: { xs: '1rem', sm: '1.1rem' },
        mb: { xs: 2, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {getTitleByAssetType()}
      </SectionTitle>
      
      <BaseAssetFields
        assetType={assetType}
        dividendFrequency={dividendFrequency}
        quantity={quantity}
        currentPrice={currentPrice}
        watch={watch}
        setValue={setValue}
        paymentFields={paymentFields}
        handleMonthChange={handleMonthChange}
        showCalculatedValue={true}
      />
    </FormSection>
  );
};
