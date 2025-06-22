import React from 'react';
import { AssetType } from '@/types/shared/base';
import { UseFormSetValue } from 'react-hook-form';
import { FormGrid, StandardFormField } from '../forms/FormGrid';
import { useTranslation } from 'react-i18next';
import formatService from '@/service/formatService';

interface BaseAssetFieldsProps {
  assetType: AssetType;
  quantity?: number;
  currentPrice?: number;
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
  showCalculatedValue?: boolean;
}

/**
 * Base component containing the common asset field logic
 * Used by both AssetSpecificSection and AssetSpecificFields
 */
export const BaseAssetFields: React.FC<BaseAssetFieldsProps> = ({
  assetType,
  quantity,
  currentPrice,
  watch,
  setValue,
  showCalculatedValue = true
}) => {
  const { t } = useTranslation();

  const renderStockFields = () => (
    <>
      <StandardFormField
        label={t('assets.form.ticker')}
        name="ticker"
        value={watch('ticker')}
        onChange={(value) => setValue('ticker', value)}
        placeholder={t('assets.form.tickerPlaceholder')}
      />
      
      <StandardFormField
        label={t('assets.form.quantity')}
        name="quantity"
        type="number"
        value={watch('quantity')}
        onChange={(value) => setValue('quantity', value)}
        placeholder={t('common.zeroPlaceholder')}
        step={1}
        min={0}
      />
      
      <StandardFormField
        label={t('assets.form.purchasePrice')}
        name="purchasePrice"
        type="number"
        value={watch('purchasePrice')}
        onChange={(value) => setValue('purchasePrice', value)}
        placeholder={t('common.zeroAmountPlaceholder')}
        step={0.01}
        min={0}
      />
      
      <StandardFormField
        label={t('assets.form.currentPrice')}
        name="currentPrice"
        type="number"
        value={watch('currentPrice')}
        onChange={(value) => setValue('currentPrice', value)}
        placeholder={t('common.zeroAmountPlaceholder')}
        step={0.01}
        min={0}
      />
      
      {showCalculatedValue && quantity && currentPrice && quantity > 0 && currentPrice > 0 && (
        <StandardFormField
          label={t('assets.form.calculatedValue')}
          name="calculatedValue"
          type="number"
          value={quantity * currentPrice}
          onChange={() => {}} // Read-only
          placeholder={t('common.zeroAmountPlaceholder')}
          step={0.01}
          min={0}
          disabled={true}
          helperText={`${t('assets.calculatedValue')}: ${formatService.formatCurrency(quantity * currentPrice)}`}
          gridColumn="span 2"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'action.hover'
            }
          }}
        />
      )}
    </>
  );

  const renderRealEstateFields = () => (
      <StandardFormField
        label={t('assets.form.propertyValue')}
        name="propertyValue"
        type="number"
        value={watch('propertyValue')}
        onChange={(value) => setValue('propertyValue', value)}
        placeholder={t('common.zeroAmountPlaceholder')}
        step={0.01}
        min={0}
      />
  );

  const renderBondFields = () => (
    <>
      <StandardFormField
        label={t('assets.form.maturityDate')}
        name="maturityDate"
        type="date"
        value={watch('maturityDate')}
        onChange={(value) => setValue('maturityDate', value)}
      />
      
      <StandardFormField
        label={t('assets.form.nominalValue')}
        name="nominalValue"
        type="number"
        value={watch('nominalValue')}
        onChange={(value) => setValue('nominalValue', value)}
        placeholder={t('common.zeroAmountPlaceholder')}
        step={0.01}
        min={0}
      />
    </>
  );

  const renderCryptoFields = () => (
    <>
      <StandardFormField
        label={t('assets.form.symbol')}
        name="symbol"
        value={watch('symbol')}
        onChange={(value) => setValue('symbol', value)}
        placeholder={t('assets.form.symbolPlaceholder')}
      />
      
      <StandardFormField
        label={t('assets.form.quantity')}
        name="quantity"
        type="number"
        value={watch('quantity')}
        onChange={(value) => setValue('quantity', value)}
        placeholder={t('common.zeroPlaceholder')}
        step={0.00000001}
        min={0}
      />
      
      <StandardFormField
        label={t('assets.form.acquisitionCost')}
        name="acquisitionCost"
        type="number"
        value={watch('acquisitionCost')}
        onChange={(value) => setValue('acquisitionCost', value)}
        placeholder={t('common.zeroAmountPlaceholder')}
        step={0.01}
        min={0}
      />
    </>
  );

  const getFieldsByAssetType = () => {
    switch (assetType) {
      case 'stock':
        return renderStockFields();
      case 'real_estate':
        return renderRealEstateFields();
      case 'bond':
        return renderBondFields();
      case 'crypto':
        return renderCryptoFields();
      default:
        return null;
    }
  };

  return (
    <FormGrid>
      {getFieldsByAssetType()}
    </FormGrid>
  );
};

export type { BaseAssetFieldsProps };
