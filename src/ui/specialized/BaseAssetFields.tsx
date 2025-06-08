import React from 'react';
import { AssetType, DividendFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { FormGrid, StandardFormField } from '../forms/FormGrid';
import { MonthSelector } from '../forms/MonthSelector';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import formatService from '../../service/formatService';
import { getDividendFrequencyOptions } from '../../constants';

interface BaseAssetFieldsProps {
  assetType: AssetType;
  dividendFrequency?: DividendFrequency;
  quantity?: number;
  currentPrice?: number;
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
  paymentFields: { months?: number[] };
  handleMonthChange: (month: number, checked: boolean) => void;
  showCalculatedValue?: boolean;
}

/**
 * Base component containing the common asset field logic
 * Used by both AssetSpecificSection and AssetSpecificFields
 */
export const BaseAssetFields: React.FC<BaseAssetFieldsProps> = ({
  assetType,
  dividendFrequency,
  quantity,
  currentPrice,
  watch,
  setValue,
  paymentFields,
  handleMonthChange,
  showCalculatedValue = true
}) => {
  const { t } = useTranslation();
  const dividendFrequencyOptions = getDividendFrequencyOptions(t);

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
      
      <StandardFormField
        label={t('assets.form.dividendFrequency')}
        name="dividendFrequency"
        type="select"
        options={dividendFrequencyOptions}
        value={watch('dividendFrequency')}
        onChange={(value) => setValue('dividendFrequency', value as DividendFrequency)}
      />
      
      {dividendFrequency && dividendFrequency !== 'none' && (
        <StandardFormField
          label={t('assets.form.dividendAmountPerShare')}
          name="dividendAmount"
          type="number"
          value={watch('dividendAmount')}
          onChange={(value) => setValue('dividendAmount', value)}
          step={0.01}
          min={0}
        />
      )}
    </>
  );

  const renderRealEstateFields = () => (
    <>
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
      
      <StandardFormField
        label={t('assets.form.monthlyRentalIncome')}
        name="rentalAmount"
        type="number"
        value={watch('rentalAmount')}
        onChange={(value) => setValue('rentalAmount', value)}
        placeholder={t('common.zeroAmountPlaceholder')}
        step={0.01}
        min={0}
      />
    </>
  );

  const renderBondFields = () => (
    <>
      <StandardFormField
        label={t('assets.form.interestRatePercent')}
        name="interestRate"
        type="number"
        value={watch('interestRate')}
        onChange={(value) => setValue('interestRate', value)}
        step={0.01}
        min={0}
      />
      
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

  const renderMonthSelector = () => {
    if (!['quarterly', 'annually', 'custom'].includes(dividendFrequency || '')) {
      return null;
    }

    let monthSelectorLabel: string;
    
    if (dividendFrequency === 'quarterly') {
      monthSelectorLabel = t('assets.form.quarterlyPaymentMonths');
    } else if (dividendFrequency === 'annually') {
      monthSelectorLabel = t('assets.form.annualPaymentMonth');
    } else {
      monthSelectorLabel = t('assets.form.customDividendMonths');
    }

    return (
      <Box sx={{ mt: 2 }}>
        <MonthSelector
          selectedMonths={paymentFields.months || []}
          onChange={(month: number, checked: boolean) => {
            handleMonthChange(month, checked);
            const currentMonths = paymentFields.months || [];
            const newMonths = checked 
              ? [...currentMonths, month].sort((a, b) => a - b)
              : currentMonths.filter(m => m !== month);
            
            if (dividendFrequency === 'custom') {
              setValue('dividendMonths', newMonths);
            } else {
              setValue('dividendPaymentMonths', newMonths);
            }
          }}
          label={monthSelectorLabel}
        />
      </Box>
    );
  };

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
    <>
      <FormGrid>
        {getFieldsByAssetType()}
      </FormGrid>
      {assetType === 'stock' && renderMonthSelector()}
    </>
  );
};

export type { BaseAssetFieldsProps };
